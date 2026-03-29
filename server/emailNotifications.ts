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
import { ENV } from "./_core/env";

const OWNER_EMAIL = "tessa@subroast.com";
const FROM_ADDRESS = "SubRoast <onboarding@resend.dev>";

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

  const title = `🎯 ${params.newLeadsCount} new ${plural} found — ${params.campaignName}`;
  const bodyText = `SubRoast found **${params.newLeadsCount} new ${plural}** for your campaign **"${params.campaignName}"**.

Total leads in this campaign: ${params.totalLeadsCount}

**What to do next:**
1. Open your DM Campaigns inbox
2. Filter by **Strong match** to find your best leads
3. Click **Analyse & Draft** to generate your outreach message
4. Send directly

[Open SubRoast → DM Campaigns](${params.appUrl}/dm-campaigns)

---
*SubRoast monitors Reddit so you don't have to. Leads are scored Strong / Partial / Lowest based on keyword match.*`;

  // In-app owner notification
  await notifyOwner({ title, content: bodyText }).catch((err) => {
    console.warn("[Notifications] Failed to send in-app new leads notification:", err?.message ?? err);
  });

  // Resend email to owner
  if (ENV.resendApiKey) {
    const html = `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <h2 style="color: #e07b39; margin-bottom: 4px;">🎯 ${params.newLeadsCount} new ${plural} found</h2>
        <p style="color: #6b7280; margin-top: 0;">Campaign: <strong>${params.campaignName}</strong></p>
        <table style="width:100%; border-collapse:collapse; margin-top:16px;">
          <tr>
            <td style="padding:8px 12px; background:#f9fafb; border:1px solid #e5e7eb; font-weight:600; width:160px;">New leads</td>
            <td style="padding:8px 12px; border:1px solid #e5e7eb;">${params.newLeadsCount}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px; background:#f9fafb; border:1px solid #e5e7eb; font-weight:600;">Total leads</td>
            <td style="padding:8px 12px; border:1px solid #e5e7eb;">${params.totalLeadsCount}</td>
          </tr>
        </table>
        <div style="margin-top:24px;">
          <p style="font-weight:600;">What to do next:</p>
          <ol style="padding-left:20px; color:#374151;">
            <li>Open your DM Campaigns inbox</li>
            <li>Filter by <strong>Strong match</strong> to find your best leads</li>
            <li>Click <strong>Analyse &amp; Draft</strong> to generate your outreach message</li>
            <li>Send directly</li>
          </ol>
        </div>
        <a href="${params.appUrl}/dm-campaigns" style="display:inline-block; margin-top:20px; padding:10px 20px; background:#e07b39; color:#fff; text-decoration:none; border-radius:6px; font-weight:600;">Open DM Campaigns →</a>
        <p style="margin-top:24px; font-size:12px; color:#9ca3af;">
          This is an automated notification from SubRoast. Leads are scored Strong / Partial / Lowest based on keyword match.
        </p>
      </div>
    `;
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ENV.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [OWNER_EMAIL],
        subject: title,
        html,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          console.warn(`[Notifications] Resend API error (${res.status}): ${detail}`);
        } else {
          console.log(`[Notifications] New leads email sent for campaign "${params.campaignName}" (${params.newLeadsCount} leads)`);
        }
      })
      .catch((err) => {
        console.warn("[Notifications] Failed to send new leads email:", err?.message ?? err);
      });
  }
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
