import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { redditAccounts, waitlistSignups } from "../drizzle/schema";
import {
  cancelScheduledPost,
  createDmCampaign,
  createDmRecipients,
  createPostHistory,
  createScheduledPost,
  getDmCampaignsByUserId,
  getDmRecipientsByCampaignId,
  getPostHistoryByUserId,
  getRedditAccountByUserId,
  getRateLimitTracking,
  getScheduledPostsByUserId,
  getUserSettings,
  incrementPostCount,
  updateDmCampaignStatus,
  upsertUserSettings,
} from "./db";
import { checkCanPost, getRateLimitStatus, randomDelayMs } from "./rateLimiter";
import { getRedditAuthUrl, submitRedditPost, refreshRedditToken } from "./reddit";
import { ENV } from "./_core/env";
import { nanoid } from "nanoid";
import axios from "axios";
import { outreachRouter } from "./routers/outreach";
import { subscriptionRouter } from "./routers/subscription";
import { onboardingRouter } from "./routers/onboarding";
import { feedbackRouter } from "./routers/feedback";

// ─── AI Roast Router ─────────────────────────────────────────────────────────

const roastRouter = router({
  analyze: protectedProcedure
    .input(
      z.object({
        content: z.string().min(10).max(10000),
        subreddit: z.string().min(1).max(128),
        type: z.enum(["post", "dm"]).default("post"),
      })
    )
    .mutation(async ({ input }) => {
      const systemPrompt = `You are a brutally honest Reddit veteran who reviews posts and DMs for indie SaaS founders.
You analyze content for Reddit fit and provide structured feedback.
Always respond with valid JSON matching the exact schema provided.`;

      const userPrompt = `Analyze this Reddit ${input.type} for r/${input.subreddit}:

---
${input.content}
---

Return a JSON object with this EXACT structure:
{
  "review": {
    "clarity": "High|Medium|Low",
    "subreddit_fit": "High|Medium|Low",
    "promo_risk": "Low|Medium|High",
    "explanation": "2 sentences explaining the scores"
  },
  "virality": {
    "score": 42,
    "tip": "One specific, actionable tip to increase virality"
  },
  "roast": "3-5 witty lines like a Redditor would say, separated by newlines",
  "improved_title": "A compelling Reddit post title for the improved draft (max 300 chars)",
  "improved_draft": "Full rewritten version of the post/DM that would perform better on Reddit",
  "improved_virality": {
    "score": 78,
    "tip": "What still could push this even higher"
  },
  "recommended_subreddit": "The single best subreddit to post this in (without r/ prefix), based on the content and target audience",
  "subreddit_reasoning": "One sentence explaining why this subreddit is the best fit"
}

For the virality score (1-100), consider: does the title ask a question (+15), is there an emotional hook (+10), is it specific/concrete (+10), does it fit the subreddit culture (+15), is there a story/narrative (+10), is there value for the reader (+15), is the length appropriate (+10), does it avoid overt self-promotion (+15). Sum these up for the score.`;

      const response = await invokeLLM({
        messages: [
          { role: "system" as const, content: systemPrompt as string },
          { role: "user" as const, content: userPrompt as string },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "reddit_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                review: {
                  type: "object",
                  properties: {
                    clarity: { type: "string", enum: ["High", "Medium", "Low"] },
                    subreddit_fit: { type: "string", enum: ["High", "Medium", "Low"] },
                    promo_risk: { type: "string", enum: ["Low", "Medium", "High"] },
                    explanation: { type: "string" },
                  },
                  required: ["clarity", "subreddit_fit", "promo_risk", "explanation"],
                  additionalProperties: false,
                },
                virality: {
                  type: "object",
                  properties: {
                    score: { type: "integer", description: "Virality score 1-100" },
                    tip: { type: "string", description: "One actionable tip to increase virality" },
                  },
                  required: ["score", "tip"],
                  additionalProperties: false,
                },
                roast: { type: "string" },
                improved_title: { type: "string", description: "Compelling Reddit post title for the improved draft" },
                improved_draft: { type: "string" },
                improved_virality: {
                  type: "object",
                  properties: {
                    score: { type: "integer", description: "Virality score 1-100 for the improved draft" },
                    tip: { type: "string", description: "What could push this even higher" },
                  },
                  required: ["score", "tip"],
                  additionalProperties: false,
                },
                recommended_subreddit: { type: "string", description: "Best subreddit without r/ prefix" },
                subreddit_reasoning: { type: "string", description: "One sentence explaining the subreddit choice" },
              },
              required: ["review", "virality", "roast", "improved_title", "improved_draft", "improved_virality", "recommended_subreddit", "subreddit_reasoning"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent = response.choices[0]?.message?.content;
      if (!rawContent) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI returned no content" });
      const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);

      try {
        return JSON.parse(content) as {
          review: {
            clarity: "High" | "Medium" | "Low";
            subreddit_fit: "High" | "Medium" | "Low";
            promo_risk: "Low" | "Medium" | "High";
            explanation: string;
          };
          virality: {
            score: number;
            tip: string;
          };
          roast: string;
          improved_title: string;
          improved_draft: string;
          improved_virality: {
            score: number;
            tip: string;
          };
          recommended_subreddit: string;
          subreddit_reasoning: string;
        };
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to parse AI response" });
      }
    }),
});

// ─── Reddit Router ────────────────────────────────────────────────────────────

const redditRouter = router({
  getAccount: protectedProcedure.query(async ({ ctx }) => {
    const account = await getRedditAccountByUserId(ctx.user.id);
    if (!account) return null;
    return {
      id: account.id,
      redditUsername: account.redditUsername,
      isActive: account.isActive,
      isPaused: account.isPaused,
      pauseReason: account.pauseReason,
      failureCount: account.failureCount,
      scopes: account.scopes,
      createdAt: account.createdAt.getTime(),
    };
  }),

  getConnectUrl: protectedProcedure
    .input(z.object({ origin: z.string() }))
    .query(({ input }) => {
      const redirectUri = `${input.origin}/api/reddit/callback`;
      // Return the connect URL for the frontend to navigate to
      return { url: `/api/reddit/connect?origin=${encodeURIComponent(input.origin)}` };
    }),

  getRateLimitStatus: protectedProcedure.query(async ({ ctx }) => {
    const account = await getRedditAccountByUserId(ctx.user.id);
    if (!account) return null;
    return getRateLimitStatus(account.id, ctx.user.id);
  }),

  disconnect: protectedProcedure.mutation(async ({ ctx }) => {
    await axios.post(
      "/api/reddit/disconnect",
      {},
      { headers: { cookie: ctx.req.headers.cookie ?? "" } }
    );
    return { success: true };
  }),

  unpauseAccount: protectedProcedure.mutation(async ({ ctx }) => {
    const account = await getRedditAccountByUserId(ctx.user.id);
    if (!account) throw new TRPCError({ code: "NOT_FOUND", message: "No Reddit account connected" });
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    await db.update(redditAccounts)
      .set({ isPaused: false, pauseReason: null, failureCount: 0 })
      .where(eq(redditAccounts.id, account.id));
    return { success: true };
  }),
});

// ─── Scheduled Posts Router ───────────────────────────────────────────────────

const scheduleRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        subreddit: z.string().min(1).max(128),
        title: z.string().min(1).max(300),
        body: z.string().max(40000).optional(),
        scheduledAt: z.number(), // unix ms
      })
    )
    .mutation(async ({ ctx, input }) => {
      const account = await getRedditAccountByUserId(ctx.user.id);
      if (!account) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Connect your Reddit account first",
        });
      }
      if (account.isPaused) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Account is paused: ${account.pauseReason}`,
        });
      }

      await createScheduledPost({
        userId: ctx.user.id,
        redditAccountId: account.id,
        subreddit: input.subreddit,
        title: input.title,
        body: input.body,
        scheduledAt: input.scheduledAt,
      });

      return { success: true };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return getScheduledPostsByUserId(ctx.user.id);
  }),

  cancel: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await cancelScheduledPost(input.id, ctx.user.id);
      return { success: true };
    }),

  // ── Smart Post: AI picks optimal viral time, fires immediately or schedules ──
  postNow: protectedProcedure
    .input(
      z.object({
        subreddit: z.string().min(1).max(128),
        title: z.string().min(1).max(300),
        body: z.string().max(40000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const account = await getRedditAccountByUserId(ctx.user.id);
      if (!account) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Connect your Reddit account first" });
      }
      if (account.isPaused) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: `Account is paused: ${account.pauseReason}` });
      }

      // ── Ask AI for the optimal posting window ─────────────────────────────────────
      const now = new Date();
      const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      const currentDay = dayNames[now.getUTCDay()];
      const currentHourUTC = now.getUTCHours();

      const timingPrompt = `You are a Reddit growth expert. Given the subreddit r/${input.subreddit} and a post titled "${input.title.slice(0, 120)}", determine the single best UTC hour to post for maximum virality.

Current UTC time: ${currentHourUTC}:00 on ${currentDay}.

Consider: peak activity windows for the subreddit type, day-of-week patterns, time zones of the likely audience, and Reddit's general peak hours (typically 8-10am EST = 13-15 UTC, and 6-9pm EST = 23-02 UTC).

Return JSON: { "best_utc_hour": 14, "day_offset": 0, "reasoning": "brief explanation" }
- best_utc_hour: 0-23 (UTC hour to post)
- day_offset: 0 = today, 1 = tomorrow (use 1 if today's window has already passed)
- reasoning: 1 sentence`;

      let bestUtcHour = 14; // default: 2pm UTC (9am EST)
      let dayOffset = 0;
      let reasoning = "Default peak window (9am EST)";

      try {
        const aiResp = await invokeLLM({
          messages: [
            { role: "system" as const, content: "You are a Reddit growth expert. Always respond with valid JSON." },
            { role: "user" as const, content: timingPrompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "optimal_timing",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  best_utc_hour: { type: "integer" },
                  day_offset: { type: "integer" },
                  reasoning: { type: "string" },
                },
                required: ["best_utc_hour", "day_offset", "reasoning"],
                additionalProperties: false,
              },
            },
          },
        });
        const raw = aiResp.choices[0]?.message?.content;
        if (raw) {
          const parsed = JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw)) as {
            best_utc_hour: number;
            day_offset: number;
            reasoning: string;
          };
          bestUtcHour = Math.max(0, Math.min(23, parsed.best_utc_hour));
          dayOffset = parsed.day_offset === 1 ? 1 : 0;
          reasoning = parsed.reasoning;
        }
      } catch {
        // AI timing failed — fall back to default
      }

      // ── Compute scheduled timestamp ───────────────────────────────────────────────────────
      const target = new Date(now);
      target.setUTCDate(target.getUTCDate() + dayOffset);
      target.setUTCHours(bestUtcHour, 0, 0, 0);

      // If target is in the past (same day, window already passed), push to tomorrow
      if (target.getTime() <= now.getTime()) {
        target.setUTCDate(target.getUTCDate() + 1);
      }

      const scheduledAt = target.getTime();
      const minutesUntilPost = Math.round((scheduledAt - now.getTime()) / 60000);
      const isImmediate = minutesUntilPost <= 10; // within 10 min = fire now

      // ── Check rate limits ─────────────────────────────────────────────────────────────────────
      const { checkCanPost: canPostCheck } = await import("./rateLimiter");
      const { allowed, reason: rateLimitReason } = await canPostCheck(account.id, ctx.user.id);

      if (isImmediate && allowed) {
        // Fire immediately
        let accessToken = account.accessToken;
        const nowMs = Date.now();
        if (account.tokenExpiresAt - nowMs < 5 * 60 * 1000) {
          const tokens = await refreshRedditToken(account.refreshToken);
          accessToken = tokens.access_token;
          const db = await getDb();
          if (db) {
            const { redditAccounts: raTable } = await import("../drizzle/schema");
            await db.update(raTable).set({ accessToken, tokenExpiresAt: nowMs + tokens.expires_in * 1000 }).where(eq(raTable.id, account.id));
          }
        }

        const { postId, postUrl } = await submitRedditPost(accessToken, input.subreddit, input.title, input.body ?? "");
        await incrementPostCount(account.id);
        await createPostHistory({
          userId: ctx.user.id,
          redditAccountId: account.id,
          subreddit: input.subreddit,
          title: input.title,
          body: input.body,
          redditPostId: postId,
          redditPostUrl: postUrl,
          postedAt: nowMs,
        });
        return {
          action: "posted" as const,
          postUrl,
          scheduledAt: null,
          reasoning,
          message: `Posted immediately to r/${input.subreddit}!`,
        };
      }

      // Schedule for optimal time
      if (!allowed && isImmediate) {
        // Rate limited right now — schedule for optimal window instead
      }

      await createScheduledPost({
        userId: ctx.user.id,
        redditAccountId: account.id,
        subreddit: input.subreddit,
        title: input.title,
        body: input.body,
        scheduledAt,
      });

      const scheduledDate = new Date(scheduledAt);
      const timeStr = scheduledDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York", timeZoneName: "short" });
      const dayStr = dayOffset === 0 ? "today" : "tomorrow";

      return {
        action: "scheduled" as const,
        postUrl: null,
        scheduledAt,
        reasoning,
        message: isImmediate && !allowed
          ? `Rate limited — scheduled for ${timeStr} ${dayStr} (${rateLimitReason})`
          : `Scheduled for ${timeStr} ${dayStr} — ${reasoning}`,
      };
    }),
});

// ─── DM Campaigns Router ──────────────────────────────────────────────────────

const dmRouter = router({
  createCampaign: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(256),
        subject: z.string().min(1).max(256),
        message: z.string().min(1).max(10000),
        usernames: z.array(z.string().min(1).max(64)).min(1).max(25),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const account = await getRedditAccountByUserId(ctx.user.id);
      if (!account) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Connect your Reddit account first",
        });
      }

      const campaignId = await createDmCampaign({
        userId: ctx.user.id,
        redditAccountId: account.id,
        name: input.name,
        subject: input.subject,
        message: input.message,
        totalRecipients: input.usernames.length,
        sentCount: 0,
        failedCount: 0,
      });

      // Schedule recipients with randomized delays (2-10 min between each)
      const now = Date.now();
      let cumulativeDelay = 0;
      const recipients = input.usernames.map((username) => {
        const delay = randomDelayMs(2 * 60 * 1000, 10 * 60 * 1000);
        cumulativeDelay += delay;
        return {
          campaignId,
          userId: ctx.user.id,
          username,
          status: "pending" as const,
          scheduledAt: now + cumulativeDelay,
        };
      });

      await createDmRecipients(recipients);

      return { success: true, campaignId };
    }),

  listCampaigns: protectedProcedure.query(async ({ ctx }) => {
    return getDmCampaignsByUserId(ctx.user.id);
  }),

  getCampaignRecipients: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ ctx, input }) => {
      const campaigns = await getDmCampaignsByUserId(ctx.user.id);
      const campaign = campaigns.find((c) => c.id === input.campaignId);
      if (!campaign) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
      }
      return getDmRecipientsByCampaignId(input.campaignId);
    }),

  pauseCampaign: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const campaigns = await getDmCampaignsByUserId(ctx.user.id);
      const campaign = campaigns.find((c) => c.id === input.campaignId);
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });
      await updateDmCampaignStatus(input.campaignId, "paused");
      return { success: true };
    }),

  resumeCampaign: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const campaigns = await getDmCampaignsByUserId(ctx.user.id);
      const campaign = campaigns.find((c) => c.id === input.campaignId);
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });
      await updateDmCampaignStatus(input.campaignId, "active");
      return { success: true };
    }),
});

// ─── History Router ───────────────────────────────────────────────────────────

const historyRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return getPostHistoryByUserId(ctx.user.id);
  }),
});

// ─── Settings Router ──────────────────────────────────────────────────────────

const settingsRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const settings = await getUserSettings(ctx.user.id);
    return (
      settings ?? {
        maxPostsPerDay: 5,
        maxDmsPerDay: 25,
        maxDmsPerHour: 5,
        minDelayBetweenDmsMs: 120000,
        maxDelayBetweenDmsMs: 600000,
        minDelayBetweenPostsMs: 1800000,
      }
    );
  }),

  update: protectedProcedure
    .input(
      z.object({
        maxPostsPerDay: z.number().min(1).max(10).optional(),
        maxDmsPerDay: z.number().min(1).max(25).optional(),
        maxDmsPerHour: z.number().min(1).max(5).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await upsertUserSettings({
        userId: ctx.user.id,
        maxPostsPerDay: input.maxPostsPerDay ?? 5,
        maxDmsPerDay: input.maxDmsPerDay ?? 25,
        maxDmsPerHour: input.maxDmsPerHour ?? 5,
      });
      return { success: true };
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  roast: roastRouter,
  reddit: redditRouter,
  schedule: scheduleRouter,
  dm: dmRouter,
  outreach: outreachRouter,
  subscription: subscriptionRouter,
  onboarding: onboardingRouter,
  feedback: feedbackRouter,
  history: historyRouter,
  settings: settingsRouter,
  waitlist: router({
    count: publicProcedure
      .query(async () => {
        const db = await getDb();
        if (!db) return { count: 0 };
        const result = await db.select({ count: sql<number>`COUNT(*)` }).from(waitlistSignups);
        return { count: Number(result[0]?.count ?? 0) };
      }),
    join: publicProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().max(200).optional(),
        source: z.enum(["header", "footer", "home_header", "home_footer", "home_modal"]),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (db) {
          // Upsert — ignore duplicate email+source combinations
          await db.insert(waitlistSignups).values({
            email: input.email,
            name: input.name ?? null,
            source: input.source,
          }).onDuplicateKeyUpdate({ set: { email: input.email } }).catch(() => {});
        }
        // Notify owner
        const { notifyOwner } = await import("./_core/notification");
        await notifyOwner({
          title: "New Waitlist Signup",
          content: `${input.name ? input.name + " (" + input.email + ")" : input.email} joined the waitlist via ${input.source}.`,
        }).catch(() => {});
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
