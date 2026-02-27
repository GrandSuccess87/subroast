import type { Express, Request, Response } from "express";
import express from "express";
import { getStripe } from "./client";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

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
        return res.status(400).send(`Webhook Error: ${message}`);
      }

      // ⚠️ Test event short-circuit (required by Manus Stripe integration)
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      console.log(`[Webhook] Event: ${event.type} | ${event.id}`);

      const db = await getDb();
      if (!db) {
        return res.status(500).json({ error: "DB unavailable" });
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
                  plan: "trial",
                  subscriptionStatus: "trialing",
                  trialStartAt: now,
                  trialEndsAt: trialEnd,
                })
                .where(eq(users.id, userId));

              console.log(`[Webhook] User ${userId} started ${planKey} trial`);
            }
            break;
          }

          case "customer.subscription.updated": {
            const sub = event.data.object as import("stripe").Stripe.Subscription;
            const customerId = sub.customer as string;

            const userRows = await db
              .select()
              .from(users)
              .where(eq(users.stripeCustomerId, customerId))
              .limit(1);

            if (userRows[0]) {
              const planKey = (sub.metadata?.plan as "starter" | "growth") ?? "starter";
              const status = sub.status as "active" | "trialing" | "past_due" | "canceled";
              const mappedStatus =
                status === "active" || status === "trialing" || status === "past_due" || status === "canceled"
                  ? status
                  : "none" as const;

              await db
                .update(users)
                .set({
                  stripeSubscriptionId: sub.id,
                  plan: status === "active" ? planKey : status === "trialing" ? "trial" : "none",
                  subscriptionStatus: mappedStatus,
                })
                .where(eq(users.stripeCustomerId, customerId));

              console.log(`[Webhook] Subscription updated for customer ${customerId}: ${status}`);
            }
            break;
          }

          case "customer.subscription.deleted": {
            const sub = event.data.object as import("stripe").Stripe.Subscription;
            const customerId = sub.customer as string;

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
        return res.status(500).json({ error: "Processing failed" });
      }

      res.json({ received: true });
    }
  );
}
