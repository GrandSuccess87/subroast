/**
 * Auto-sync module for outreach campaigns.
 *
 * Sync frequency by plan:
 *   - Starter / trial: twice daily at 8am and 8pm EST (12-hour window)
 *   - Growth: every 4 hours (6 times per day)
 *
 * Campaigns are processed one at a time with a 500ms stagger between each
 * to avoid bursting Reddit's public search rate limit.
 */

import { getDb } from "./db";
import {
  getActiveCampaignsForSync,
  updateOutreachCampaign,
  upsertOutreachLead,
} from "./db";
import { notifyNewLeads } from "./emailNotifications";
import { users, outreachCampaigns } from "../drizzle/schema";
import { eq, inArray } from "drizzle-orm";

// ─── Sync window helpers ──────────────────────────────────────────────────────

/**
 * Returns true if the current time falls within ±30 minutes of a target
 * hour in EST (UTC-5). Used to gate the twice-daily sync for Starter plans.
 */
function isWithinSyncWindow(targetHourEst: number): boolean {
  const nowUtc = new Date();
  // EST = UTC - 5
  const estHour = (nowUtc.getUTCHours() - 5 + 24) % 24;
  const estMinute = nowUtc.getUTCMinutes();
  const totalMinutes = estHour * 60 + estMinute;
  const targetMinutes = targetHourEst * 60;
  const diff = Math.abs(totalMinutes - targetMinutes);
  // Within 30-minute window on either side
  return diff <= 30 || diff >= 24 * 60 - 30;
}

/**
 * Returns true if a Growth campaign is due for a 4-hour sync.
 * A campaign is due if it has never been synced, or its last sync was
 * more than 4 hours ago.
 */
function isGrowthSyncDue(lastSyncAt: number | null): boolean {
  if (lastSyncAt == null) return true;
  const fourHoursMs = 4 * 60 * 60 * 1000;
  return Date.now() - lastSyncAt >= fourHoursMs;
}

/**
 * Returns true if a Starter/trial campaign is due for a twice-daily sync.
 * A campaign is due if it has never been synced, or its last sync was
 * more than 11.5 hours ago (to avoid double-firing within the same window).
 */
function isStarterSyncDue(lastSyncAt: number | null): boolean {
  if (lastSyncAt == null) return true;
  const elevenHalfHoursMs = 11.5 * 60 * 60 * 1000;
  return Date.now() - lastSyncAt >= elevenHalfHoursMs;
}

// ─── Spam filter (mirrors outreach.ts) ──────────────────────────────────────

// Subreddits where external URLs in the body are normal (job boards, freelance)
const JOB_BOARD_SUBREDDITS = new Set(["forhire", "freelance_forhire", "jobbit", "remotework", "hireadev"]);

const BOT_USERNAME_RE = /^[a-z]+[_-]?[0-9]{4,}$|^[a-z0-9]{8,}[0-9]{4,}$|^[A-Za-z]+[0-9]{4,}$/;
const URL_RE = /https?:\/\/[^\s)\]]+/i;
const EXCESSIVE_PUNCT_RE = /[!?]{3,}/;

function isSpamPost(post: {
  title: string;
  body: string;
  author: string;
  subreddit: string;
}): { spam: boolean; reason: string } {
  const { title, body, author, subreddit } = post;
  const bodyTrimmed = body.trim();
  const isJobBoard = JOB_BOARD_SUBREDDITS.has(subreddit.toLowerCase());

  // 1. Body contains an external URL — skip this check for job board subreddits
  //    where URLs (portfolios, contact links) are normal and expected
  if (!isJobBoard && URL_RE.test(bodyTrimmed)) {
    return { spam: true, reason: "external_url_in_body" };
  }

  // 2. Body is too short to be a genuine discussion post (< 50 chars, non-empty)
  if (bodyTrimmed.length > 0 && bodyTrimmed.length < 50) {
    return { spam: true, reason: "body_too_short" };
  }

  // 3. Body is identical or near-identical to title (copy-paste spam)
  if (bodyTrimmed.length > 0 && bodyTrimmed.toLowerCase() === title.toLowerCase().trim()) {
    return { spam: true, reason: "body_equals_title" };
  }

  // 4. Title is all-caps (shouting spam)
  const titleWords = title.replace(/[^a-zA-Z\s]/g, "").trim();
  if (titleWords.length > 10 && titleWords === titleWords.toUpperCase()) {
    return { spam: true, reason: "title_all_caps" };
  }

  // 5. Excessive punctuation in title (!!!, ???, etc.)
  if (EXCESSIVE_PUNCT_RE.test(title)) {
    return { spam: true, reason: "excessive_punctuation" };
  }

  // 6. Username matches bot/throwaway patterns
  if (BOT_USERNAME_RE.test(author)) {
    return { spam: true, reason: "bot_username_pattern" };
  }

  return { spam: false, reason: "" };
}

// ─── Reddit public search ─────────────────────────────────────────────────────

async function searchRedditPosts(
  subreddit: string,
  keyword: string,
  limit = 10
): Promise<Array<{
  id: string;
  url: string;
  title: string;
  body: string;
  author: string;
  subreddit: string;
  createdUtc: number;
}>> {
  try {
    const query = encodeURIComponent(keyword);
    const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${query}&restrict_sr=1&sort=new&limit=${limit}&t=week`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "SubRoast/1.0 (subreddit monitoring bot)",
        Accept: "application/json",
      },
    });
    if (!res.ok) return [];
    const json = await res.json() as {
      data?: {
        children?: Array<{
          data: {
            id: string;
            permalink: string;
            title: string;
            selftext: string;
            author: string;
            subreddit: string;
            created_utc: number;
          };
        }>;
      };
    };
    return (json.data?.children ?? []).map((c) => ({
      id: c.data.id,
      url: `https://reddit.com${c.data.permalink}`,
      title: c.data.title,
      body: c.data.selftext,
      author: c.data.author,
      subreddit: c.data.subreddit,
      createdUtc: c.data.created_utc * 1000,
    }));
  } catch {
    return [];
  }
}

function scoreMatch(
  postTitle: string,
  postBody: string,
  keywords: string[]
): { score: "strong" | "partial" | "lowest"; matchedKeywords: string[] } {
  const text = `${postTitle} ${postBody}`.toLowerCase();
  const matched = keywords.filter((kw) => text.includes(kw.toLowerCase()));
  const ratio = matched.length / Math.max(keywords.length, 1);
  const score = ratio >= 0.5 ? "strong" : ratio >= 0.2 ? "partial" : "lowest";
  return { score, matchedKeywords: matched };
}

// ─── Per-campaign sync ────────────────────────────────────────────────────────

async function syncCampaign(campaign: {
  id: number;
  userId: number;
  name: string;
  subreddits: string;
  keywords: string;
  leadsFound: number;
}, userPlan: string): Promise<number> {
  const subreddits = JSON.parse(campaign.subreddits) as string[];
  const keywords = JSON.parse(campaign.keywords) as string[];
  let newLeads = 0;

  // Growth users process all subreddits; Starter/trial capped at 5
  const subLimit = userPlan === "growth" ? subreddits.length : 5;
  for (const sub of subreddits.slice(0, subLimit)) {
    for (const kw of keywords.slice(0, 3)) {
      const posts = await searchRedditPosts(sub, kw, 5);
      for (const post of posts) {
        if (post.author === "[deleted]" || post.author === "AutoModerator") continue;

        // Apply spam filter (same rules as manual sync)
        const spamCheck = isSpamPost({ title: post.title, body: post.body, author: post.author, subreddit: post.subreddit });
        if (spamCheck.spam) {
          console.log(`[AutoSync] Spam filtered: ${post.id} by u/${post.author} (${spamCheck.reason})`);
          continue;
        }

        const { score, matchedKeywords } = scoreMatch(post.title, post.body, keywords);
        await upsertOutreachLead({
          campaignId: campaign.id,
          userId: campaign.userId,
          redditPostId: post.id,
          redditPostUrl: post.url,
          subreddit: post.subreddit,
          postTitle: post.title,
          postBody: post.body || null,
          authorUsername: post.author,
          matchScore: score,
          matchedKeywords: JSON.stringify(matchedKeywords),
          status: "new",
          discoveredAt: Date.now(),
        });
        newLeads++;
      }
    }
  }

  const updatedLeadsFound = campaign.leadsFound + newLeads;
  await updateOutreachCampaign(campaign.id, {
    lastSyncAt: Date.now(),
    leadsFound: updatedLeadsFound,
  });

  if (newLeads > 0) {
    const origin = typeof globalThis !== "undefined" && (globalThis as Record<string, unknown>).__appOrigin
      ? String((globalThis as Record<string, unknown>).__appOrigin)
      : "https://subroast.manus.space";
    notifyNewLeads({
      campaignName: campaign.name,
      newLeadsCount: newLeads,
      totalLeadsCount: updatedLeadsFound,
      appUrl: origin,
    }).catch(() => {});
  }

  return newLeads;
}

/** Sleep for ms milliseconds */
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ─── Main auto-sync job ───────────────────────────────────────────────────────

export async function runAutoSync(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Load all active campaigns
  const campaigns = await getActiveCampaignsForSync();
  if (campaigns.length === 0) return;

  // Load user plans for all unique userIds in one query
  const userIds = Array.from(new Set(campaigns.map((c) => c.userId)));
  const userRows = await db
    .select({ id: users.id, plan: users.plan, subscriptionStatus: users.subscriptionStatus, trialEndsAt: users.trialEndsAt })
    .from(users)
    .where(inArray(users.id, userIds));

  const userPlanMap = new Map(userRows.map((u) => [u.id, u]));

  // Determine which campaigns are due for sync
  const due: typeof campaigns = [];

  for (const campaign of campaigns) {
    const user = userPlanMap.get(campaign.userId);
    if (!user) continue;

    const now = Date.now();
    const isTrialing = user.plan === "trial" && user.trialEndsAt != null && user.trialEndsAt > now;
    const hasActiveAccess =
      isTrialing ||
      user.subscriptionStatus === "active" ||
      user.subscriptionStatus === "trialing";

    if (!hasActiveAccess) continue; // skip inactive users

    const isGrowth = user.plan === "growth";

    if (isGrowth) {
      // Growth: sync every 4 hours
      if (isGrowthSyncDue(campaign.lastSyncAt ?? null)) {
        due.push(campaign);
      }
    } else {
      // Starter / trial: sync twice daily at 8am and 8pm EST
      const inMorningWindow = isWithinSyncWindow(8);
      const inEveningWindow = isWithinSyncWindow(20);
      if ((inMorningWindow || inEveningWindow) && isStarterSyncDue(campaign.lastSyncAt ?? null)) {
        due.push(campaign);
      }
    }
  }

  if (due.length === 0) return;

  console.log(`[AutoSync] Syncing ${due.length} campaign(s)...`);

  let synced = 0;
  let totalNewLeads = 0;

  for (const campaign of due) {
    const user = userPlanMap.get(campaign.userId);
    const plan = user?.plan ?? "starter";
    try {
      const newLeads = await syncCampaign(campaign, plan);
      totalNewLeads += newLeads;
      synced++;
      console.log(`[AutoSync] Campaign ${campaign.id} (${campaign.name}): +${newLeads} leads`);
    } catch (err) {
      console.error(`[AutoSync] Campaign ${campaign.id} failed:`, err);
    }
    // 500ms stagger between campaigns to avoid bursting Reddit's rate limit
    if (synced < due.length) await sleep(500);
  }

  console.log(`[AutoSync] Done. ${synced} campaigns synced, ${totalNewLeads} new leads total.`);
}
