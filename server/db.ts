import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  DmCampaign,
  DmRecipient,
  InsertDmCampaign,
  InsertDmRecipient,
  InsertPostHistory,
  InsertRedditAccount,
  InsertScheduledPost,
  InsertUser,
  InsertUserSettings,
  PostHistory,
  RateLimitTracking,
  RedditAccount,
  ScheduledPost,
  UserSettings,
  dmCampaigns,
  dmRecipients,
  postHistory,
  rateLimitTracking,
  redditAccounts,
  scheduledPosts,
  userSettings,
  users,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  for (const field of ["name", "email", "loginMethod"] as const) {
    const v = user[field];
    if (v !== undefined) {
      values[field] = v ?? null;
      updateSet[field] = v ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ─── Reddit Accounts ─────────────────────────────────────────────────────────

export async function getRedditAccountByUserId(userId: number): Promise<RedditAccount | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(redditAccounts)
    .where(and(eq(redditAccounts.userId, userId), eq(redditAccounts.isActive, true)))
    .limit(1);
  return result[0];
}

export async function upsertRedditAccount(data: InsertRedditAccount): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(redditAccounts).values(data).onDuplicateKeyUpdate({
    set: {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      tokenExpiresAt: data.tokenExpiresAt,
      scopes: data.scopes,
      isActive: true,
      failureCount: 0,
      isPaused: false,
      pauseReason: null,
    },
  });
}

export async function updateRedditAccountTokens(
  id: number,
  accessToken: string,
  tokenExpiresAt: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(redditAccounts)
    .set({ accessToken, tokenExpiresAt })
    .where(eq(redditAccounts.id, id));
}

export async function incrementRedditAccountFailures(
  id: number,
  reason: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const account = await db
    .select()
    .from(redditAccounts)
    .where(eq(redditAccounts.id, id))
    .limit(1);
  if (!account[0]) return;

  const newCount = account[0].failureCount + 1;
  const shouldPause = newCount >= 3;

  await db
    .update(redditAccounts)
    .set({
      failureCount: newCount,
      isPaused: shouldPause,
      pauseReason: shouldPause ? `Auto-paused after ${newCount} failures: ${reason}` : account[0].pauseReason,
    })
    .where(eq(redditAccounts.id, id));
}

export async function deactivateRedditAccount(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(redditAccounts)
    .set({ isActive: false })
    .where(eq(redditAccounts.userId, userId));
}

// ─── Rate Limit Tracking ─────────────────────────────────────────────────────

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getRateLimitTracking(
  redditAccountId: number
): Promise<RateLimitTracking | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const today = todayDateString();
  const result = await db
    .select()
    .from(rateLimitTracking)
    .where(
      and(
        eq(rateLimitTracking.redditAccountId, redditAccountId),
        eq(rateLimitTracking.date, today)
      )
    )
    .limit(1);
  return result[0];
}

export async function ensureRateLimitRecord(redditAccountId: number): Promise<RateLimitTracking> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const today = todayDateString();
  const existing = await getRateLimitTracking(redditAccountId);
  if (existing) return existing;

  await db.insert(rateLimitTracking).values({
    redditAccountId,
    date: today,
    postsCount: 0,
    dmsCount: 0,
    dmsThisHour: 0,
  });
  const fresh = await getRateLimitTracking(redditAccountId);
  return fresh!;
}

export async function incrementPostCount(redditAccountId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await ensureRateLimitRecord(redditAccountId);
  const today = todayDateString();
  await db
    .update(rateLimitTracking)
    .set({
      postsCount: sql`postsCount + 1`,
      lastPostAt: Date.now(),
    })
    .where(
      and(
        eq(rateLimitTracking.redditAccountId, redditAccountId),
        eq(rateLimitTracking.date, today)
      )
    );
}

export async function incrementDmCount(redditAccountId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await ensureRateLimitRecord(redditAccountId);
  const today = todayDateString();
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  const record = await getRateLimitTracking(redditAccountId);
  const hourWindowStart = record?.hourWindowStart ?? now;
  const isNewHour = now - hourWindowStart > oneHour;

  await db
    .update(rateLimitTracking)
    .set({
      dmsCount: sql`dmsCount + 1`,
      dmsThisHour: isNewHour ? 1 : sql`dmsThisHour + 1`,
      lastDmAt: now,
      hourWindowStart: isNewHour ? now : hourWindowStart,
    })
    .where(
      and(
        eq(rateLimitTracking.redditAccountId, redditAccountId),
        eq(rateLimitTracking.date, today)
      )
    );
}

// ─── Scheduled Posts ─────────────────────────────────────────────────────────

export async function createScheduledPost(data: InsertScheduledPost): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(scheduledPosts).values(data);
}

export async function getScheduledPostsByUserId(userId: number): Promise<ScheduledPost[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(scheduledPosts)
    .where(eq(scheduledPosts.userId, userId))
    .orderBy(desc(scheduledPosts.scheduledAt));
}

export async function getPendingScheduledPosts(): Promise<ScheduledPost[]> {
  const db = await getDb();
  if (!db) return [];
  const now = Date.now();
  return db
    .select()
    .from(scheduledPosts)
    .where(
      and(
        eq(scheduledPosts.status, "pending"),
        sql`scheduledAt <= ${now}`
      )
    )
    .orderBy(scheduledPosts.scheduledAt);
}

export async function updateScheduledPostStatus(
  id: number,
  status: "posted" | "failed" | "cancelled",
  extra?: { redditPostId?: string; redditPostUrl?: string; errorMessage?: string; postedAt?: number }
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(scheduledPosts)
    .set({ status, ...extra })
    .where(eq(scheduledPosts.id, id));
}

export async function cancelScheduledPost(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(scheduledPosts)
    .set({ status: "cancelled" })
    .where(and(eq(scheduledPosts.id, id), eq(scheduledPosts.userId, userId)));
}

// ─── Post History ─────────────────────────────────────────────────────────────

export async function createPostHistory(data: InsertPostHistory): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(postHistory).values(data);
}

export async function getPostHistoryByUserId(userId: number): Promise<PostHistory[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(postHistory)
    .where(eq(postHistory.userId, userId))
    .orderBy(desc(postHistory.postedAt))
    .limit(100);
}

// ─── DM Campaigns ────────────────────────────────────────────────────────────

export async function createDmCampaign(data: InsertDmCampaign): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(dmCampaigns).values(data);
  return (result as unknown as { insertId: number }).insertId;
}

export async function getDmCampaignsByUserId(userId: number): Promise<DmCampaign[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(dmCampaigns)
    .where(eq(dmCampaigns.userId, userId))
    .orderBy(desc(dmCampaigns.createdAt));
}

export async function getDmCampaignById(id: number): Promise<DmCampaign | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(dmCampaigns).where(eq(dmCampaigns.id, id)).limit(1);
  return result[0];
}

export async function updateDmCampaignStatus(
  id: number,
  status: "draft" | "active" | "paused" | "completed"
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(dmCampaigns).set({ status }).where(eq(dmCampaigns.id, id));
}

export async function updateDmCampaignCounts(
  id: number,
  sentCount: number,
  failedCount: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(dmCampaigns)
    .set({ sentCount, failedCount })
    .where(eq(dmCampaigns.id, id));
}

// ─── DM Recipients ───────────────────────────────────────────────────────────

export async function createDmRecipients(data: InsertDmRecipient[]): Promise<void> {
  const db = await getDb();
  if (!db) return;
  if (data.length === 0) return;
  await db.insert(dmRecipients).values(data);
}

export async function getDmRecipientsByCampaignId(campaignId: number): Promise<DmRecipient[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(dmRecipients)
    .where(eq(dmRecipients.campaignId, campaignId))
    .orderBy(dmRecipients.scheduledAt);
}

export async function getPendingDmRecipients(): Promise<DmRecipient[]> {
  const db = await getDb();
  if (!db) return [];
  const now = Date.now();
  return db
    .select()
    .from(dmRecipients)
    .where(
      and(
        eq(dmRecipients.status, "pending"),
        sql`scheduledAt <= ${now}`
      )
    )
    .orderBy(dmRecipients.scheduledAt)
    .limit(10);
}

export async function updateDmRecipientStatus(
  id: number,
  status: "sent" | "failed" | "skipped",
  extra?: { sentAt?: number; errorMessage?: string }
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(dmRecipients)
    .set({ status, ...extra })
    .where(eq(dmRecipients.id, id));
}

// ─── User Settings ────────────────────────────────────────────────────────────

export async function getUserSettings(userId: number): Promise<UserSettings | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);
  return result[0];
}

export async function upsertUserSettings(data: InsertUserSettings): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(userSettings).values(data).onDuplicateKeyUpdate({
    set: {
      maxPostsPerDay: data.maxPostsPerDay,
      maxDmsPerDay: data.maxDmsPerDay,
      maxDmsPerHour: data.maxDmsPerHour,
    },
  });
}
