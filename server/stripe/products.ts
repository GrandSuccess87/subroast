/**
 * SubSignal Stripe product & price definitions.
 * Price IDs are created dynamically on first use via ensurePrices().
 * Store them in env or hardcode after first run in production.
 */

export const PLANS = {
  starter: {
    name: "SubSignal Starter",
    description: "1 campaign · 5 posts/day · 25 DMs/day · AI roast",
    priceUsd: 1900, // $19.00 in cents
    interval: "month" as const,
    campaignLimit: 1,
    features: [
      "1 outreach campaign",
      "5 posts per day",
      "25 DMs per day",
      "AI Draft & Roast",
      "AI auto-scheduling",
      "Lead discovery",
    ],
  },
  growth: {
    name: "SubSignal Growth",
    description: "Unlimited campaigns · Priority lead sync · DM templates",
    priceUsd: 3900, // $39.00 in cents
    interval: "month" as const,
    campaignLimit: Infinity,
    features: [
      "Unlimited outreach campaigns",
      "5 posts per day",
      "25 DMs per day",
      "AI Draft & Roast",
      "AI auto-scheduling",
      "Priority lead sync",
      "DM template library (coming soon)",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export const TRIAL_DAYS = 7;
export const TRIAL_REMINDER_DAY = 6; // send reminder on day 6
