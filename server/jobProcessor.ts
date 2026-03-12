/**
 * Background job processor for SubRoast.
 * Runs on a polling interval to:
 * 1. Process pending scheduled posts
 * 2. Process pending DM recipients
 */

import { and, eq, sql } from "drizzle-orm";
import { dmRecipients, scheduledPosts } from "../drizzle/schema";
import {
  createPostHistory,
  getDmCampaignById,
  getDmRecipientsByCampaignId,
  getDb,
  getPendingDmRecipients,
  getPendingScheduledPosts,
  getRedditAccountByUserId,
  incrementDmCount,
  incrementPostCount,
  incrementRedditAccountFailures,
  resetDbPool,
  updateDmCampaignCounts,
  updateDmCampaignStatus,
  updateDmRecipientStatus,
  updateRedditAccountTokens,
  updateScheduledPostStatus,
} from "./db";
import { checkCanDm, checkCanPost } from "./rateLimiter";
import { refreshRedditToken, sendRedditDM, submitRedditPost } from "./reddit";
import { sendTrialReminders } from "./emailNotifications";
import { runAutoSync } from "./autoSync";

async function getValidAccessToken(account: {
  id: number;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: number;
}): Promise<string> {
  const now = Date.now();
  if (account.tokenExpiresAt - now < 5 * 60 * 1000) {
    const tokens = await refreshRedditToken(account.refreshToken);
    const newExpiry = now + tokens.expires_in * 1000;
    await updateRedditAccountTokens(account.id, tokens.access_token, newExpiry);
    return tokens.access_token;
  }
  return account.accessToken;
}

async function processScheduledPosts() {
  const pending = await getPendingScheduledPosts();
  if (pending.length === 0) return;

  for (const post of pending) {
    try {
      const account = await getRedditAccountByUserId(post.userId);
      if (!account) {
        await updateScheduledPostStatus(post.id, "failed", {
          errorMessage: "No active Reddit account found",
        });
        continue;
      }

      if (account.isPaused) {
        await updateScheduledPostStatus(post.id, "failed", {
          errorMessage: `Account paused: ${account.pauseReason}`,
        });
        continue;
      }

      const { allowed, reason } = await checkCanPost(account.id, post.userId);
      if (!allowed) {
        // Reschedule 35 minutes later by updating scheduledAt and resetting to pending
        const newTime = Date.now() + 35 * 60 * 1000;
        const db = await getDb();
        if (db) {
          await db
            .update(scheduledPosts)
            .set({ scheduledAt: newTime, errorMessage: reason })
            .where(eq(scheduledPosts.id, post.id));
        }
        continue;
      }

      const accessToken = await getValidAccessToken(account);
      const { postId, postUrl } = await submitRedditPost(
        accessToken,
        post.subreddit,
        post.title,
        post.body ?? ""
      );

      const now = Date.now();
      await updateScheduledPostStatus(post.id, "posted", {
        redditPostId: postId,
        redditPostUrl: postUrl,
        postedAt: now,
      });
      await incrementPostCount(account.id);
      await createPostHistory({
        userId: post.userId,
        redditAccountId: account.id,
        subreddit: post.subreddit,
        title: post.title,
        body: post.body,
        redditPostId: postId,
        redditPostUrl: postUrl,
        type: "scheduled",
        status: "posted",
        postedAt: now,
      });

      console.log(`[Jobs] Posted scheduled post ${post.id} to r/${post.subreddit}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[Jobs] Failed to post scheduled post ${post.id}:`, msg);

      const account = await getRedditAccountByUserId(post.userId);
      if (account) {
        await incrementRedditAccountFailures(account.id, msg);
      }
      await updateScheduledPostStatus(post.id, "failed", { errorMessage: msg });
    }
  }
}

async function processDmRecipients() {
  const pending = await getPendingDmRecipients();
  if (pending.length === 0) return;

  for (const recipient of pending) {
    try {
      const campaign = await getDmCampaignById(recipient.campaignId);
      if (!campaign) {
        await updateDmRecipientStatus(recipient.id, "skipped", {
          errorMessage: "Campaign not found",
        });
        continue;
      }

      if (campaign.status === "paused" || campaign.status === "completed") {
        await updateDmRecipientStatus(recipient.id, "skipped", {
          errorMessage: `Campaign is ${campaign.status}`,
        });
        continue;
      }

      const account = await getRedditAccountByUserId(recipient.userId);
      if (!account || account.isPaused) {
        await updateDmRecipientStatus(recipient.id, "skipped", {
          errorMessage: account?.isPaused
            ? `Account paused: ${account.pauseReason}`
            : "No active Reddit account",
        });
        continue;
      }

      const { allowed } = await checkCanDm(account.id, recipient.userId);
      if (!allowed) {
        // Reschedule 65 minutes later
        const db = await getDb();
        if (db) {
          await db
            .update(dmRecipients)
            .set({ scheduledAt: Date.now() + 65 * 60 * 1000 })
            .where(eq(dmRecipients.id, recipient.id));
        }
        continue;
      }

      const accessToken = await getValidAccessToken(account);
      await sendRedditDM(accessToken, recipient.username, campaign.subject, campaign.message);

      const now = Date.now();
      await updateDmRecipientStatus(recipient.id, "sent", { sentAt: now });
      await incrementDmCount(account.id);

      // Update campaign counts
      const allRecipients = await getDmRecipientsByCampaignId(campaign.id);
      const sentCount = allRecipients.filter((r) => r.status === "sent").length;
      const failedCount = allRecipients.filter((r) => r.status === "failed").length;
      const pendingCount = allRecipients.filter((r) => r.status === "pending").length;

      await updateDmCampaignCounts(campaign.id, sentCount, failedCount);

      if (pendingCount === 0) {
        await updateDmCampaignStatus(campaign.id, "completed");
      }

      console.log(`[Jobs] Sent DM to u/${recipient.username} for campaign ${campaign.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[Jobs] Failed to send DM to ${recipient.username}:`, msg);

      const account = await getRedditAccountByUserId(recipient.userId);
      if (account) {
        await incrementRedditAccountFailures(account.id, msg);
      }
      await updateDmRecipientStatus(recipient.id, "failed", { errorMessage: msg });
    }
  }
}

let jobInterval: NodeJS.Timeout | null = null;

export function startJobProcessor() {
  if (jobInterval) return;
  console.log("[Jobs] Starting background job processor (60s interval)");

  const run = async () => {
    try {
      await processScheduledPosts();
      await processDmRecipients();
      await sendTrialReminders();
      await runAutoSync();
    } catch (err) {
      console.error("[Jobs] Processor error:", err);
      // Reset DB pool on connection errors so next run gets a fresh connection
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes("ECONNRESET") || errMsg.includes("ECONNREFUSED") || errMsg.includes("ETIMEDOUT")) {
        resetDbPool();
      }
    }
  };

  run();
  jobInterval = setInterval(run, 60 * 1000);
}

export function stopJobProcessor() {
  if (jobInterval) {
    clearInterval(jobInterval);
    jobInterval = null;
  }
}
