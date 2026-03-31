import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getStripe } from "../stripe/client";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { PLANS, FOUNDER_PLAN, getFounderPriceTier, FREE_SYNCS_LIMIT, FREE_CAMPAIGN_LIMIT, TRIAL_DAYS, type PlanKey } from "../stripe/products";
import { getPaidSubscriberCount } from "../db";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getOrCreateStripeCustomer(
  userId: number,
  email: string | null | undefined,
  name: string | null | undefined
): Promise<string> {
  const stripe = getStripe();
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

  const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = userRows[0];
  if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

  if (user.stripeCustomerId) {
    // Verify the customer still exists in the current Stripe mode (live vs test keys can differ)
    try {
      await stripe.customers.retrieve(user.stripeCustomerId);
      return user.stripeCustomerId;
    } catch (err: unknown) {
      // Customer not found in current mode (e.g. switched from live to test keys) — create a new one
      const isNotFound = err instanceof Error && err.message.includes("No such customer");
      if (isNotFound) {
        console.warn(`[Stripe] Stale customer ID ${user.stripeCustomerId} — clearing and creating new one`);
        await db.update(users).set({ stripeCustomerId: null }).where(eq(users.id, userId));
      } else {
        throw err; // re-throw unexpected errors
      }
    }
  }

  const customer = await stripe.customers.create({
    email: email ?? undefined,
    name: name ?? undefined,
    metadata: { user_id: userId.toString() },
  });

  await db
    .update(users)
    .set({ stripeCustomerId: customer.id })
    .where(eq(users.id, userId));

  return customer.id;
}

// ─── Test user guard ────────────────────────────────────────────────────────
const TEST_USER_EMAILS = new Set([
  "tessa@subroast.com",
]);

function isTestUser(email: string | null | undefined): boolean {
  return !!email && TEST_USER_EMAILS.has(email.toLowerCase());
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const subscriptionRouter = router({
  /** Get current user's subscription/trial status */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const userRows = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    const user = userRows[0];
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });

    const now = Date.now();
    const isTrialing = user.plan === "trial" && user.trialEndsAt != null && user.trialEndsAt > now;
    const trialDaysLeft = isTrialing
      ? Math.max(0, Math.ceil((user.trialEndsAt! - now) / (1000 * 60 * 60 * 24)))
      : 0;

    // ⚠️ Test user: always return full Growth access regardless of DB state
    if (isTestUser(user.email)) {
      return {
        plan: "growth" as const,
        subscriptionStatus: "canceled" as const,
        isTrialing: false,
        trialDaysLeft: 0,
        trialEndsAt: null,
        hasActiveAccess: true,
        campaignLimit: null,
      };
    }

    return {
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
      isTrialing,
      trialDaysLeft,
      trialEndsAt: user.trialEndsAt,
      hasActiveAccess:
        isTrialing ||
        user.subscriptionStatus === "active" ||
        user.subscriptionStatus === "trialing",
      campaignLimit:
        user.plan === "growth"
          ? null // unlimited
          : 1,
    };
  }),

  /** Create Stripe Checkout session for the Founder Plan */
  createCheckoutSession: protectedProcedure
    .input(z.object({ plan: z.enum(["starter", "growth", "founder"]), origin: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // ⚠️ Test user guard: never create real Stripe sessions for test accounts
      if (isTestUser(ctx.user.email)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This is a test account. Billing is disabled.",
        });
      }

      const stripe = getStripe();

      // Determine dynamic price based on current paid subscriber count
      const paidCount = await getPaidSubscriberCount();
      const tier = getFounderPriceTier(paidCount);
      const lookupKey = `subroast_founder_${tier.priceUsd}_monthly`;

      const customerId = await getOrCreateStripeCustomer(
        ctx.user.id,
        ctx.user.email,
        ctx.user.name
      );

      let priceId: string;
      try {
        const prices = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 });
        if (prices.data.length > 0) {
          priceId = prices.data[0].id;
        } else {
          const product = await stripe.products.create({
            name: FOUNDER_PLAN.name,
            description: FOUNDER_PLAN.description,
          });
          const price = await stripe.prices.create({
            product: product.id,
            unit_amount: tier.priceUsd,
            currency: "usd",
            recurring: { interval: FOUNDER_PLAN.interval },
            lookup_key: lookupKey,
          });
          priceId = price.id;
        }
      } catch (err) {
        console.error("[Stripe] Price lookup/create failed:", err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create price" });
      }

      const customerParam = customerId
        ? { customer: customerId }
        : { customer_email: ctx.user.email ?? undefined };

      const session = await stripe.checkout.sessions.create({
        ...customerParam,
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        subscription_data: {
          metadata: {
            plan: "founder",
            user_id: ctx.user.id.toString(),
          },
        },
        allow_promotion_codes: true,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          plan: "founder",
          user_id: ctx.user.id.toString(),
          customer_email: ctx.user.email ?? "",
          customer_name: ctx.user.name ?? "",
        },
        success_url: `${input.origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${input.origin}/pricing`,
      });

      return { url: session.url };
    }),

  /** Create Stripe Customer Portal session for managing billing */
  createPortalSession: protectedProcedure
    .input(z.object({ origin: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const stripe = getStripe();
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const userRows = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      const user = userRows[0];
      if (!user?.stripeCustomerId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No billing account found" });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${input.origin}/settings`,
      });

      return { url: session.url };
    }),

  /** Public plan info with dynamic Founder pricing (no auth required) */
  getPlans: publicProcedure.query(async () => {
    const paidCount = await getPaidSubscriberCount();
    const tier = getFounderPriceTier(paidCount);
    return {
      founder: {
        ...FOUNDER_PLAN,
        key: "founder" as const,
        priceUsd: tier.priceUsd,
        priceLabel: tier.label,
        spotsLabel: tier.spotsLabel,
        paidCount,
      },
    };
  }),

  /** Founder spots remaining (public, for scarcity display) */
  getFounderSpots: publicProcedure.query(async () => {
    const paidCount = await getPaidSubscriberCount();
    const tier = getFounderPriceTier(paidCount);
    return {
      paidCount,
      priceLabel: tier.label,
      priceUsd: tier.priceUsd,
      spotsLabel: tier.spotsLabel,
      freeSyncsLimit: FREE_SYNCS_LIMIT,
      freeCampaignLimit: FREE_CAMPAIGN_LIMIT,
    };
  }),
});
