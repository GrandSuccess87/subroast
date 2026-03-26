/**
 * Email notification helpers for SubRoast.
 *
 * Uses the Manus built-in notification service (notifyOwner) to send
 * owner-facing alerts. For per-user notifications, we use the same
 * service since SubRoast is a single-owner SaaS tool.
 *
 * Two notification types:
 * 1. New leads digest — sent when syncLeads finds new leads for a campaign
 * 2. Trial reminder — sent on Day 6 of the 7-day free trial
 */

import { notifyOwner } from "./_core/notification";
import { getDb } from "./db";
import { users, outreachCampaigns } from "../drizzle/schema";
import { and, eq, isNull, lt, or } from "drizzle-orm";
import { TRIAL_REMINDER_DAY, TRIAL_DAYS } from "./stripe/products";

// ─── New Leads Digest ─────────────────────────────────────────────────────────

/**
 * Sends a notification when new leads are found for a campaign.
 * Called after syncLeads completes.
 */
export async function notifyNewLeads(params: {
  campaignName: string;
  newLeadsCount: number;
  totalLeadsCount: number;
  appUrl: string;
}): Promise<void> {
  if (params.newLeadsCount === 0) return;

  const plural = params.newLeadsCount === 1 ? "lead" : "leads";

  await notifyOwner({
    title: `🎯 ${params.newLeadsCount} new ${plural} found — ${params.campaignName}`,
    content: `SubRoast found **${params.newLeadsCount} new ${plural}** for your campaign **"${params.campaignName}"**.

Total leads in this campaign: ${params.totalLeadsCount}

**What to do next:**
1. Open your DM Campaigns inbox
2. Review the new leads (look for Strong match badges first)
3. Click "Generate DM" to create personalized outreach
4. Queue or send directly

[Open SubRoast → DM Campaigns](${params.appUrl}/dm-campaigns)

---
*SubRoast monitors Reddit so you don't have to. Leads are scored Strong / Partial / Lowest based on keyword match.*`,
  }).catch((err) => {
    console.warn("[Notifications] Failed to send new leads notification:", err?.message ?? err);
  });
}

// ─── Trial Reminder ───────────────────────────────────────────────────────────

/**
 * Checks for users whose trial ends tomorrow (Day 6 check → Day 7 expiry)
 * and sends them a reminder notification.
 * Called by the background job processor daily.
 */
export async function sendTrialReminders(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const now = Date.now();
  // Window: trial ends between 20-28 hours from now (Day 6 reminder for Day 7 expiry)
  const windowStart = now + 20 * 60 * 60 * 1000; // 20 hours from now
  const windowEnd = now + 28 * 60 * 60 * 1000;   // 28 hours from now

  const usersToRemind = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.plan, "trial"),
        // Trial ends within the reminder window
        lt(users.trialEndsAt, windowEnd),
        // Not already reminded
        isNull(users.trialReminderSentAt)
      )
    );

  for (const user of usersToRemind) {
    if (!user.trialEndsAt || user.trialEndsAt < windowStart) continue;

    try {
      const hoursLeft = Math.ceil((user.trialEndsAt - now) / (1000 * 60 * 60));
      const daysLeft = Math.ceil(hoursLeft / 24);

      await notifyOwner({
        title: `⏰ Your SubRoast trial ends in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`,
        content: `Hi ${user.name ?? "there"},

Your **${TRIAL_DAYS}-day free trial** of SubRoast ends in approximately **${hoursLeft} hours**.

After your trial ends, you'll lose access to:
- Outreach campaign monitoring
- AI lead discovery & DM generation
- AI Draft & Roast
- Auto-scheduling

**Keep your momentum going — upgrade now:**

🚀 **Starter Plan — $19/month**
- 1 outreach campaign
- 5 posts/day, 25 DMs/day
- All AI features

📈 **Growth Plan — $49/month**
- Unlimited campaigns
- Everything in Starter

You can cancel anytime. No long-term commitment.

[Upgrade Now → SubRoast Pricing](/pricing)

---
*You're receiving this because you started a free trial. To cancel before being charged, simply don't upgrade.*`,
      });

      // Mark reminder as sent
      await db
        .update(users)
        .set({ trialReminderSentAt: now })
        .where(eq(users.id, user.id));

      console.log(`[Jobs] Trial reminder sent to user ${user.id}`);
    } catch (err) {
      console.warn(`[Jobs] Failed to send trial reminder to user ${user.id}:`, err);
    }
  }
}
