import {
  ensureRateLimitRecord,
  getRateLimitTracking,
  getUserSettings,
} from "./db";

export interface RateLimitStatus {
  canPost: boolean;
  canDm: boolean;
  postsToday: number;
  dmsToday: number;
  dmsThisHour: number;
  maxPostsPerDay: number;
  maxDmsPerDay: number;
  maxDmsPerHour: number;
  postWarning: boolean; // at 80%
  dmWarning: boolean;
  minutesSinceLastPost: number | null;
  minutesSinceLastDm: number | null;
  minMinutesBetweenPosts: number;
}

const DEFAULT_MAX_POSTS_DAY = 5;
const DEFAULT_MAX_DMS_DAY = 25;
const DEFAULT_MAX_DMS_HOUR = 5;
const DEFAULT_MIN_POST_INTERVAL_MS = 30 * 60 * 1000; // 30 min

export async function getRateLimitStatus(
  redditAccountId: number,
  userId: number
): Promise<RateLimitStatus> {
  const [tracking, settings] = await Promise.all([
    getRateLimitTracking(redditAccountId),
    getUserSettings(userId),
  ]);

  const maxPostsPerDay = settings?.maxPostsPerDay ?? DEFAULT_MAX_POSTS_DAY;
  const maxDmsPerDay = settings?.maxDmsPerDay ?? DEFAULT_MAX_DMS_DAY;
  const maxDmsPerHour = settings?.maxDmsPerHour ?? DEFAULT_MAX_DMS_HOUR;
  const minPostIntervalMs = settings?.minDelayBetweenPostsMs ?? DEFAULT_MIN_POST_INTERVAL_MS;

  const postsToday = tracking?.postsCount ?? 0;
  const dmsToday = tracking?.dmsCount ?? 0;
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  // Reset hourly DM counter if window expired
  const hourWindowStart = tracking?.hourWindowStart ?? now;
  const isNewHour = now - hourWindowStart > oneHour;
  const dmsThisHour = isNewHour ? 0 : (tracking?.dmsThisHour ?? 0);

  const lastPostAt = tracking?.lastPostAt;
  const lastDmAt = tracking?.lastDmAt;
  const minutesSinceLastPost = lastPostAt ? (now - lastPostAt) / 60000 : null;
  const minutesSinceLastDm = lastDmAt ? (now - lastDmAt) / 60000 : null;

  const postCooldownOk = !lastPostAt || now - lastPostAt >= minPostIntervalMs;
  const canPost = postsToday < maxPostsPerDay && postCooldownOk;
  const canDm = dmsToday < maxDmsPerDay && dmsThisHour < maxDmsPerHour;

  const postWarning = postsToday >= Math.floor(maxPostsPerDay * 0.8);
  const dmWarning = dmsToday >= Math.floor(maxDmsPerDay * 0.8);

  return {
    canPost,
    canDm,
    postsToday,
    dmsToday,
    dmsThisHour,
    maxPostsPerDay,
    maxDmsPerDay,
    maxDmsPerHour,
    postWarning,
    dmWarning,
    minutesSinceLastPost,
    minutesSinceLastDm,
    minMinutesBetweenPosts: minPostIntervalMs / 60000,
  };
}

export async function checkCanPost(
  redditAccountId: number,
  userId: number
): Promise<{ allowed: boolean; reason?: string }> {
  await ensureRateLimitRecord(redditAccountId);
  const status = await getRateLimitStatus(redditAccountId, userId);

  if (status.postsToday >= status.maxPostsPerDay) {
    return {
      allowed: false,
      reason: `Daily post limit reached (${status.maxPostsPerDay}/day). Resets at midnight.`,
    };
  }
  if (
    status.minutesSinceLastPost !== null &&
    status.minutesSinceLastPost < status.minMinutesBetweenPosts
  ) {
    const waitMin = Math.ceil(status.minMinutesBetweenPosts - status.minutesSinceLastPost);
    return {
      allowed: false,
      reason: `Must wait ${waitMin} more minute(s) between posts (30-min cooldown).`,
    };
  }
  return { allowed: true };
}

export async function checkCanDm(
  redditAccountId: number,
  userId: number
): Promise<{ allowed: boolean; reason?: string }> {
  await ensureRateLimitRecord(redditAccountId);
  const status = await getRateLimitStatus(redditAccountId, userId);

  if (status.dmsToday >= status.maxDmsPerDay) {
    return {
      allowed: false,
      reason: `Daily DM limit reached (${status.maxDmsPerDay}/day). Resets at midnight.`,
    };
  }
  if (status.dmsThisHour >= status.maxDmsPerHour) {
    return {
      allowed: false,
      reason: `Hourly DM limit reached (${status.maxDmsPerHour}/hour). Try again next hour.`,
    };
  }
  return { allowed: true };
}

export function randomDelayMs(minMs = 120000, maxMs = 600000): number {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}
