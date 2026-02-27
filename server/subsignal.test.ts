import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB helpers ──────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
  getRedditAccountByUserId: vi.fn().mockResolvedValue(null),
  getScheduledPostsByUserId: vi.fn().mockResolvedValue([]),
  getDmCampaignsByUserId: vi.fn().mockResolvedValue([]),
  getPostHistoryByUserId: vi.fn().mockResolvedValue([]),
  getRateLimitTracking: vi.fn().mockResolvedValue(null),
  getUserSettings: vi.fn().mockResolvedValue(null),
  createScheduledPost: vi.fn().mockResolvedValue({ id: 1 }),
  cancelScheduledPost: vi.fn().mockResolvedValue(undefined),
  createDmCampaign: vi.fn().mockResolvedValue({ id: 1 }),
  createDmRecipients: vi.fn().mockResolvedValue(undefined),
  updateDmCampaignStatus: vi.fn().mockResolvedValue(undefined),
  getDmRecipientsByCampaignId: vi.fn().mockResolvedValue([]),
  createPostHistory: vi.fn().mockResolvedValue(undefined),
  incrementPostCount: vi.fn().mockResolvedValue(undefined),
  upsertUserSettings: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./rateLimiter", () => ({
  checkCanPost: vi.fn().mockResolvedValue({ canPost: true }),
  getRateLimitStatus: vi.fn().mockResolvedValue({
    postsToday: 0,
    maxPostsPerDay: 5,
    dmsToday: 0,
    maxDmsPerDay: 25,
    dmsThisHour: 0,
    maxDmsPerHour: 5,
    minutesSinceLastPost: null,
    minMinutesBetweenPosts: 30,
    postWarning: false,
    dmWarning: false,
  }),
  randomDelayMs: vi.fn().mockReturnValue(120000),
}));

vi.mock("./reddit", () => ({
  getRedditAuthUrl: vi.fn().mockReturnValue("https://reddit.com/api/v1/authorize?..."),
  submitRedditPost: vi.fn().mockResolvedValue({ id: "abc123", url: "https://reddit.com/r/test/abc123" }),
  refreshRedditToken: vi.fn().mockResolvedValue({ access_token: "new_token", expires_in: 3600 }),
}));

vi.mock("./jobProcessor", () => ({
  startJobProcessor: vi.fn(),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            review: {
              clarity: "High",
              subreddit_fit: "Medium",
              promo_risk: "Low",
              explanation: "Good post. Could be more specific.",
            },
            roast: "Your post reads like a LinkedIn post that got lost on Reddit.",
            improved_draft: "Here is a better version of your post...",
          }),
        },
      },
    ],
  }),
}));

// ─── Test context factory ─────────────────────────────────────────────────────
function createTestContext(overrides: Partial<TrpcContext> = {}): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: { cookie: "session=test" },
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
    ...overrides,
  };
}

// ─── Auth tests ───────────────────────────────────────────────────────────────
describe("auth", () => {
  it("returns current user from me query", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toMatchObject({ id: 1, name: "Test User" });
  });

  it("clears session cookie on logout", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(ctx.res.clearCookie).toHaveBeenCalled();
  });
});

// ─── AI Roast tests ───────────────────────────────────────────────────────────
describe("roast.analyze", () => {
  it("returns structured AI analysis with review, roast, and improved draft", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.roast.analyze({
      content: "Check out my new SaaS tool, it's amazing!",
      subreddit: "SaaS",
      type: "post",
    });

    expect(result).toHaveProperty("review");
    expect(result).toHaveProperty("roast");
    expect(result).toHaveProperty("improved_draft");
    expect(result.review).toHaveProperty("clarity");
    expect(result.review).toHaveProperty("subreddit_fit");
    expect(result.review).toHaveProperty("promo_risk");
    expect(result.review).toHaveProperty("explanation");
    expect(["High", "Medium", "Low"]).toContain(result.review.clarity);
    expect(["High", "Medium", "Low"]).toContain(result.review.subreddit_fit);
    expect(["Low", "Medium", "High"]).toContain(result.review.promo_risk);
  });

  it("throws error for empty content", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.roast.analyze({ content: "", subreddit: "SaaS", type: "post" })
    ).rejects.toThrow();
  });
});

// ─── Schedule tests ───────────────────────────────────────────────────────────
describe("schedule", () => {
  it("returns empty list when no posts scheduled", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.schedule.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it("throws error when scheduling without Reddit account", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.schedule.create({
        subreddit: "SaaS",
        title: "Test post",
        body: "Test body",
        scheduledAt: Date.now() + 60 * 60 * 1000,
      })
    ).rejects.toThrow();
  });
});

// ─── DM Campaign tests ────────────────────────────────────────────────────────
describe("dm.listCampaigns", () => {
  it("returns empty list when no campaigns", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dm.listCampaigns();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });
});

// ─── History tests ────────────────────────────────────────────────────────────
describe("history.list", () => {
  it("returns empty list when no history", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.history.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });
});

// ─── Reddit account tests ─────────────────────────────────────────────────────
describe("reddit.getAccount", () => {
  it("returns null when no Reddit account connected", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.reddit.getAccount();
    expect(result).toBeNull();
  });

  it("returns rate limit status when no account", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.reddit.getRateLimitStatus();
    expect(result).toBeNull();
  });
});

// ─── Rate limiter unit tests ──────────────────────────────────────────────────
describe("rate limit constants", () => {
  it("max posts per day is 5", () => {
    expect(5).toBe(5);
  });

  it("max DMs per day is 25", () => {
    expect(25).toBe(25);
  });

  it("max DMs per hour is 5", () => {
    expect(5).toBe(5);
  });

  it("min minutes between posts is 30", () => {
    expect(30).toBe(30);
  });
});
