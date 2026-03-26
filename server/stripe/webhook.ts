import type { Express, Request, Response } from "express";
import express from "express";
import { getStripe } from "./client";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// ─── Test users: never charge, never update subscription state ───────────────
const TEST_USER_EMAILS = new Set([
  "tessa.anderson@blackvectorhorizon.solutions",
]);

/** Returns true if the given email is a protected test account */
function isTestUserEmail(email: string | null | undefined): boolean {
  return !!email && TEST_USER_EMAILS.has(email.toLowerCase());
}

export function registerStripeWebhook(app: Express) {
  // MUST use raw body before json middleware
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      let event: import("stripe").Stripe.Event;

      try {
        const stripe = getStripe();
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret!);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[Webhook] Signature verification failed:", message);
        // Always return 200 + JSON — Stripe verifier requires this
        return res.status(200).json({ verified: false, error: message });
      }

      // ⚠️ Test event short-circuit (required by Manus Stripe integration)
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      console.log(`[Webhook] Event: ${event.type} | ${event.id}`);

      const db = await getDb();
      if (!db) {
        console.error("[Webhook] DB unavailable");
        return res.status(200).json({ verified: true, warning: "DB unavailable" });
      }

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as import("stripe").Stripe.Checkout.Session;
            const userId = session.metadata?.user_id
              ? parseInt(session.metadata.user_id)
              : null;
            const customerId = session.customer as string | null;
            const subscriptionId = session.subscription as string | null;
            const customerEmail = session.metadata?.customer_email ?? session.customer_email;

            // ⚠️ Test user guard: never update subscription state for test accounts
            if (isTestUserEmail(customerEmail)) {
              console.log(`[Webhook] Skipping checkout.session.completed for test user: ${customerEmail}`);
              break;
            }

            if (userId && customerId) {
              // Determine plan from metadata or line items
              const planKey = (session.metadata?.plan as "starter" | "growth") ?? "starter";
              const now = Date.now();
              const trialEnd = session.metadata?.trial_end
                ? parseInt(session.metadata.trial_end)
                : now + 7 * 24 * 60 * 60 * 1000;

              await db
                .update(users)
                .set({
                  stripeCustomerId: customerId,
                  stripeSubscriptionId: subscriptionId ?? undefined,
                  plan: planKey, // set to actual plan (growth/starter) so UI shows correct state
                  subscriptionStatus: "trialing",
                  trialStartAt: now,
                  trialEndsAt: trialEnd,
                })
                .where(eq(users.id, userId));

              console.log(`[Webhook] User ${userId} started ${planKey} trial`);
            }
            break;
          }

          case "customer.subscription.created":
          case "customer.subscription.updated": {
            const sub = event.data.object as import("stripe").Stripe.Subscription;
            const customerId = sub.customer as string;

            const userRows = await db
              .select()
              .from(users)
              .where(eq(users.stripeCustomerId, customerId))
              .limit(1);

            // ⚠️ Test user guard
            if (userRows[0] && isTestUserEmail(userRows[0].email)) {
              console.log(`[Webhook] Skipping ${event.type} for test user: ${userRows[0].email}`);
              break;
            }

            if (userRows[0]) {
              const planKey = (sub.metadata?.plan as "starter" | "growth") ?? "starter";
              const status = sub.status as "active" | "trialing" | "past_due" | "canceled";
              const mappedStatus =
                status === "active" || status === "trialing" || status === "past_due" || status === "canceled"
                  ? status
                  : "none" as const;

              // For trialing status, set plan to the actual plan key (growth/starter) so UI knows which plan
              // For active status, also set to planKey
              // For canceled/past_due, set to "none"
              const newPlan = (status === "active" || status === "trialing") ? planKey : "none";
              const trialEndMs = sub.trial_end ? sub.trial_end * 1000 : null;

              await db
                .update(users)
                .set({
                  stripeSubscriptionId: sub.id,
                  plan: newPlan,
                  subscriptionStatus: mappedStatus,
                  ...(trialEndMs ? { trialEndsAt: trialEndMs } : {}),
                })
                .where(eq(users.stripeCustomerId, customerId));

              console.log(`[Webhook] Subscription ${event.type} for customer ${customerId}: ${status} plan=${newPlan}`);
            }
            break;
          }

          case "customer.subscription.deleted": {
            const sub = event.data.object as import("stripe").Stripe.Subscription;
            const customerId = sub.customer as string;

            // ⚠️ Test user guard: look up by customer ID first
            const deletedUserRows = await db.select().from(users).where(eq(users.stripeCustomerId, customerId)).limit(1);
            if (deletedUserRows[0] && isTestUserEmail(deletedUserRows[0].email)) {
              console.log(`[Webhook] Skipping subscription.deleted for test user: ${deletedUserRows[0].email}`);
              break;
            }

            await db
              .update(users)
              .set({
                plan: "none",
                subscriptionStatus: "canceled",
                stripeSubscriptionId: null,
              })
              .where(eq(users.stripeCustomerId, customerId));

            console.log(`[Webhook] Subscription canceled for customer ${customerId}`);
            break;
          }

          case "invoice.payment_failed": {
            const invoice = event.data.object as import("stripe").Stripe.Invoice;
            const customerId = invoice.customer as string;

            // ⚠️ Test user guard
            const failedUserRows = await db.select().from(users).where(eq(users.stripeCustomerId, customerId)).limit(1);
            if (failedUserRows[0] && isTestUserEmail(failedUserRows[0].email)) {
              console.log(`[Webhook] Skipping invoice.payment_failed for test user: ${failedUserRows[0].email}`);
              break;
            }

            await db
              .update(users)
              .set({ subscriptionStatus: "past_due" })
              .where(eq(users.stripeCustomerId, customerId));

            console.log(`[Webhook] Payment failed for customer ${customerId}`);
            break;
          }

          default:
            console.log(`[Webhook] Unhandled event type: ${event.type}`);
        }
      } catch (err) {
        console.error("[Webhook] Processing error:", err);
        // Still return 200 so Stripe doesn't retry — log the error for investigation
        return res.status(200).json({ verified: true, warning: "Processing error" });
      }

      res.status(200).json({ verified: true });
    }
  );
}
