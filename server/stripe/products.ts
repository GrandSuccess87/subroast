/**
 * SubRoast Stripe product & price definitions.
 * Single Founder Plan with dynamic pricing based on paid subscriber count.
 *
 * Pricing ladder:
 *   First 10 paid users  → $25/month
 *   Users 11–30          → $35/month
 *   31+                  → $45/month
 */

export interface FounderPriceTier {
  priceUsd: number;   // in cents
  label: string;      // human-readable price label
  spotsLabel: string; // scarcity label shown in UI
}

export function getFounderPriceTier(paidCount: number): FounderPriceTier {
  if (paidCount < 10) {
    return {
      priceUsd: 2500,
      label: "$25/month",
      spotsLabel: `${10 - paidCount} of 10 founder spots remaining`,
    };
  }
  if (paidCount < 30) {
    return {
      priceUsd: 3500,
      label: "$35/month",
      spotsLabel: `${30 - paidCount} early-access spots remaining`,
    };
  }
  return {
    priceUsd: 4500,
    label: "$45/month",
    spotsLabel: "",
  };
}

export const FOUNDER_PLAN = {
  name: "SubRoast Founder Plan",
  description: "Unlimited lead scans · AI Draft & Roast · Buyer intent detection · Lock in early pricing",
  interval: "month" as const,
  campaignLimit: null as null, // unlimited
  features: [
    "Unlimited outreach campaigns",
    "Unlimited lead syncs",
    "Buyer intent detection",
    "AI Draft & Roast + replies",
    "Faster outreach workflow",
    "Lock in early pricing",
  ],
};

/** Legacy shape — kept so existing webhook/subscription code compiles without changes */
export const PLANS = {
  starter: {
    name: "SubRoast Starter",
    description: "1 campaign · AI roast",
    priceUsd: 2500,
    interval: "month" as const,
    campaignLimit: 1,
    features: FOUNDER_PLAN.features,
  },
  growth: {
    name: "SubRoast Growth",
    description: "Unlimited campaigns · Priority lead sync",
    priceUsd: 3500,
    interval: "month" as const,
    campaignLimit: null as null,
    features: FOUNDER_PLAN.features,
  },
} as const;

export type PlanKey = "starter" | "growth" | "founder";

/** Free trial limits */
export const FREE_SYNCS_LIMIT = 3;    // total syncs before paywall
export const FREE_CAMPAIGN_LIMIT = 1; // max campaigns before paywall

// Legacy — no longer used for new signups
export const TRIAL_DAYS = 7;
export const TRIAL_REMINDER_DAY = 6;
