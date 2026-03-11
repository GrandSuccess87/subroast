import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "../_core/llm";
import { protectedProcedure, router } from "../_core/trpc";
import { notifyNewLeads } from "../emailNotifications";
import {
  createOutreachCampaign,
  deleteOutreachCampaign,
  getOutreachCampaignById,
  getOutreachCampaignsByUserId,
  getOutreachLeadsByCampaignId,
  getOutreachLeadsByUserId,
  updateOutreachCampaign,
  updateOutreachLeadStatus,
  upsertOutreachLead,
  getDb,
  getRedditAccountByUserId,
  incrementDmCount,
} from "../db";
import { checkCanDm } from "../rateLimiter";
import { refreshRedditToken, sendRedditDM } from "../reddit";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

async function getValidRedditToken(account: {
  id: number;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: number;
}): Promise<string> {
  const { updateRedditAccountTokens } = await import("../db");
  const now = Date.now();
  if (account.tokenExpiresAt - now < 5 * 60 * 1000) {
    const tokens = await refreshRedditToken(account.refreshToken);
    const newExpiry = now + tokens.expires_in * 1000;
    await updateRedditAccountTokens(account.id, tokens.access_token, newExpiry);
    return tokens.access_token;
  }
  return account.accessToken;
}

// ─── Reddit Public Search ─────────────────────────────────────────────────────

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

// ─── Match Scoring ────────────────────────────────────────────────────────────

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

// ─── Outreach Router ──────────────────────────────────────────────────────────

export const outreachRouter = router({
  // ── Campaign CRUD ──────────────────────────────────────────────────────────

  createCampaign: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(256),
        offering: z.string().min(1).max(2000),
        websiteUrl: z.string().url().optional().or(z.literal("")),
        subreddits: z.array(z.string().min(1).max(128)).min(1).max(20),
        keywords: z.array(z.string().min(1).max(128)).min(1).max(30),
        aiPromptInstructions: z.string().max(1000).optional(),
        reviewMode: z.enum(["auto_send", "review_first"]).default("review_first"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // ── Paywall: check campaign limit based on plan ──────────────────────────
      const db = await getDb();
      if (db) {
        const userRows = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
        const user = userRows[0];
        if (user) {
          const now = Date.now();
          const isTrialing = user.plan === "trial" && user.trialEndsAt != null && user.trialEndsAt > now;
          const hasActiveAccess =
            isTrialing ||
            user.subscriptionStatus === "active" ||
            user.subscriptionStatus === "trialing";

          // No active plan at all → require subscription
          if (!hasActiveAccess && user.plan === "none") {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "UPGRADE_REQUIRED",
            });
          }

          // Starter or trial → limit to 1 campaign
          if (user.plan !== "growth") {
            const existing = await getOutreachCampaignsByUserId(ctx.user.id);
            const activeCampaigns = existing.filter((c) => c.status !== "completed");
            if (activeCampaigns.length >= 1) {
              throw new TRPCError({
                code: "FORBIDDEN",
                message: "CAMPAIGN_LIMIT_REACHED",
              });
            }
          }
        }
      }
      // ────────────────────────────────────────────────────────────────────────

      const id = await createOutreachCampaign({
        userId: ctx.user.id,
        name: input.name,
        offering: input.offering,
        websiteUrl: input.websiteUrl || null,
        subreddits: JSON.stringify(input.subreddits),
        keywords: JSON.stringify(input.keywords),
        aiPromptInstructions: input.aiPromptInstructions || null,
        reviewMode: input.reviewMode,
        status: "active",
        leadsFound: 0,
        dmsSent: 0,
      });
      return { success: true, id };
    }),

  listCampaigns: protectedProcedure.query(async ({ ctx }) => {
    const campaigns = await getOutreachCampaignsByUserId(ctx.user.id);
    return campaigns.map((c) => ({
      ...c,
      subreddits: JSON.parse(c.subreddits) as string[],
      keywords: JSON.parse(c.keywords) as string[],
    }));
  }),

  getCampaign: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const c = await getOutreachCampaignById(input.id);
      if (!c || c.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      return {
        ...c,
        subreddits: JSON.parse(c.subreddits) as string[],
        keywords: JSON.parse(c.keywords) as string[],
      };
    }),

  updateCampaign: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(256).optional(),
        offering: z.string().min(1).max(2000).optional(),
        websiteUrl: z.string().optional(),
        subreddits: z.array(z.string()).optional(),
        keywords: z.array(z.string()).optional(),
        aiPromptInstructions: z.string().max(1000).optional(),
        reviewMode: z.enum(["auto_send", "review_first"]).optional(),
        status: z.enum(["active", "paused", "completed"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const c = await getOutreachCampaignById(input.id);
      if (!c || c.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      const { id, subreddits, keywords, ...rest } = input;
      await updateOutreachCampaign(id, {
        ...rest,
        ...(subreddits ? { subreddits: JSON.stringify(subreddits) } : {}),
        ...(keywords ? { keywords: JSON.stringify(keywords) } : {}),
      });
      return { success: true };
    }),

  deleteCampaign: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteOutreachCampaign(input.id, ctx.user.id);
      return { success: true };
    }),

  // ── AI Subreddit + Keyword Recommendations ─────────────────────────────────

  getRecommendations: protectedProcedure
    .input(
      z.object({
        offering: z.string().min(10).max(2000),
        websiteUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const systemPrompt = `You are an expert Reddit growth strategist for indie SaaS founders.
Given a product description, you recommend the best subreddits and keywords for finding potential customers.
Always respond with valid JSON matching the exact schema.`;

      const userPrompt = `Product/offering: "${input.offering}"
${input.websiteUrl ? `Website: ${input.websiteUrl}` : ""}

Recommend the best Reddit subreddits and search keywords to find people who might need this product.
Focus on subreddits where the target audience hangs out and discusses problems this product solves.

Return JSON with this EXACT structure:
{
  "subreddits": ["subreddit1", "subreddit2", ...],
  "keywords": ["keyword phrase 1", "keyword phrase 2", ...],
  "reasoning": "Brief explanation of why these were chosen"
}

Rules:
- 5-10 subreddits (without r/ prefix)
- 8-15 keywords/phrases that indicate someone needs this product
- Keywords should be problem-oriented, not product-oriented (e.g. "struggling with X" not "need X tool")`;

      const response = await invokeLLM({
        messages: [
          { role: "system" as const, content: systemPrompt },
          { role: "user" as const, content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "recommendations",
            strict: true,
            schema: {
              type: "object",
              properties: {
                subreddits: { type: "array", items: { type: "string" } },
                keywords: { type: "array", items: { type: "string" } },
                reasoning: { type: "string" },
              },
              required: ["subreddits", "keywords", "reasoning"],
              additionalProperties: false,
            },
          },
        },
      });

      const raw = response.choices[0]?.message?.content;
      if (!raw) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI returned no content" });
      const content = typeof raw === "string" ? raw : JSON.stringify(raw);
      try {
        return JSON.parse(content) as { subreddits: string[]; keywords: string[]; reasoning: string };
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to parse AI response" });
      }
    }),

  // ── Lead Discovery (Subreddit Monitor) ────────────────────────────────────

  syncLeads: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const c = await getOutreachCampaignById(input.campaignId);
      if (!c || c.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      if (c.status !== "active") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Campaign is not active" });

      const subreddits = JSON.parse(c.subreddits) as string[];
      const keywords = JSON.parse(c.keywords) as string[];

      let newLeads = 0;

      for (const sub of subreddits.slice(0, 5)) { // limit to 5 subreddits per sync
        for (const kw of keywords.slice(0, 3)) { // limit to 3 keywords per subreddit
          const posts = await searchRedditPosts(sub, kw, 5);
          for (const post of posts) {
            if (post.author === "[deleted]" || post.author === "AutoModerator") continue;
            const { score, matchedKeywords } = scoreMatch(post.title, post.body, keywords);
            await upsertOutreachLead({
              campaignId: input.campaignId,
              userId: ctx.user.id,
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

      // Update campaign lastSyncAt and leadsFound
      const updatedLeadsFound = c.leadsFound + newLeads;
      await updateOutreachCampaign(input.campaignId, {
        lastSyncAt: Date.now(),
        leadsFound: updatedLeadsFound,
      });

      // Send email notification for new leads
      if (newLeads > 0) {
        const origin = typeof globalThis !== "undefined" && (globalThis as Record<string, unknown>).__appOrigin
          ? String((globalThis as Record<string, unknown>).__appOrigin)
          : "https://subroast.manus.space";
        notifyNewLeads({
          campaignName: c.name,
          newLeadsCount: newLeads,
          totalLeadsCount: updatedLeadsFound,
          appUrl: origin,
        }).catch(() => {}); // fire-and-forget
      }

      return { success: true, newLeads };
    }),

  // ── Leads Inbox ────────────────────────────────────────────────────────────

  getLeads: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ ctx, input }) => {
      const c = await getOutreachCampaignById(input.campaignId);
      if (!c || c.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
      const leads = await getOutreachLeadsByCampaignId(input.campaignId);
      return leads.map((l) => ({
        ...l,
        matchedKeywords: l.matchedKeywords ? (JSON.parse(l.matchedKeywords) as string[]) : [],
      }));
    }),

  getAllLeads: protectedProcedure.query(async ({ ctx }) => {
    const leads = await getOutreachLeadsByUserId(ctx.user.id);
    return leads.map((l) => ({
      ...l,
      matchedKeywords: l.matchedKeywords ? (JSON.parse(l.matchedKeywords) as string[]) : [],
    }));
  }),

  // ── AI DM Generation ───────────────────────────────────────────────────────

  generateDm: protectedProcedure
    .input(z.object({ leadId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const leads = await getOutreachLeadsByUserId(ctx.user.id);
      const lead = leads.find((l) => l.id === input.leadId);
      if (!lead) throw new TRPCError({ code: "NOT_FOUND" });

      const campaign = await getOutreachCampaignById(lead.campaignId);
      if (!campaign || campaign.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });

      const systemPrompt = `You are an expert at writing genuine, human Reddit DMs that start real conversations.
You write like a thoughtful person who actually read the post — not a marketer, not a bot.
Your messages are warm, specific, and curious. They add value or share a relevant insight before asking anything.
NEVER mention any product, tool, app, or service. Never pitch. Never promote. Never include links.
The goal is to open a conversation, not close a sale.
${campaign.aiPromptInstructions ? `Additional instructions: ${campaign.aiPromptInstructions}` : ""}`;

      const userPrompt = `Write a Reddit DM to u/${lead.authorUsername} who posted in r/${lead.subreddit}.

Post title: "${lead.postTitle}"
Post body: "${(lead.postBody || "").slice(0, 600)}"

Context about the sender (use to inform tone and relevance, but DO NOT mention any product, tool, or service):
${campaign.offering}

Rules:
- Open by referencing something specific from their post — a detail, a struggle, a question they raised
- Share a genuine insight, observation, or relevant experience that adds value to what they shared
- Be curious — end with 1-2 natural follow-up questions that invite them to keep talking
- NO pitching, NO product mentions, NO links, NO CTAs
- Under 180 words
- No subject line (this is a DM body)
- Write like a real person texting, not a LinkedIn recruiter

Return JSON: { "dm": "the DM message text" }`;

      const response = await invokeLLM({
        messages: [
          { role: "system" as const, content: systemPrompt },
          { role: "user" as const, content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "dm_draft",
            strict: true,
            schema: {
              type: "object",
              properties: { dm: { type: "string" } },
              required: ["dm"],
              additionalProperties: false,
            },
          },
        },
      });

      const raw = response.choices[0]?.message?.content;
      if (!raw) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI returned no content" });
      const content = typeof raw === "string" ? raw : JSON.stringify(raw);
      const parsed = JSON.parse(content) as { dm: string };

      // Save draft first so it's never lost
      await updateOutreachLeadStatus(input.leadId, "dm_generated", { dmDraft: parsed.dm });

      // ── Attempt immediate send ──────────────────────────────────────────────
      const redditAccount = await getRedditAccountByUserId(ctx.user.id);

      if (!redditAccount || redditAccount.isPaused) {
        // No Reddit account connected — save draft for manual review
        return { success: true, dm: parsed.dm, sent: false, queued: false, reason: "no_reddit_account" };
      }

      const { allowed, reason: rateLimitReason } = await checkCanDm(redditAccount.id, ctx.user.id);

      if (!allowed) {
        // Rate limit hit — queue for background delivery
        await updateOutreachLeadStatus(input.leadId, "queued");
        return { success: true, dm: parsed.dm, sent: false, queued: true, reason: rateLimitReason ?? "rate_limited" };
      }

      // Send immediately
      try {
        const accessToken = await getValidRedditToken(redditAccount);
        const subject = `Re: ${lead.postTitle}`.slice(0, 100);
        await sendRedditDM(accessToken, lead.authorUsername, subject, parsed.dm);
        const now = Date.now();
        await updateOutreachLeadStatus(input.leadId, "sent", { sentAt: now });
        await incrementDmCount(redditAccount.id);
        return { success: true, dm: parsed.dm, sent: true, queued: false, reason: null };
      } catch (sendErr: unknown) {
        const errMsg = sendErr instanceof Error ? sendErr.message : String(sendErr);
        // Send failed — keep draft, surface error to user
        return { success: true, dm: parsed.dm, sent: false, queued: false, reason: `send_failed: ${errMsg}` };
      }
    }),

  // ── Lead Actions ───────────────────────────────────────────────────────────

  skipLead: protectedProcedure
    .input(z.object({ leadId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const leads = await getOutreachLeadsByUserId(ctx.user.id);
      const lead = leads.find((l) => l.id === input.leadId);
      if (!lead) throw new TRPCError({ code: "NOT_FOUND" });
      await updateOutreachLeadStatus(input.leadId, "skipped");
      return { success: true };
    }),

  queueLead: protectedProcedure
    .input(z.object({ leadId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const leads = await getOutreachLeadsByUserId(ctx.user.id);
      const lead = leads.find((l) => l.id === input.leadId);
      if (!lead) throw new TRPCError({ code: "NOT_FOUND" });
      if (!lead.dmDraft) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Generate a DM draft first" });
      await updateOutreachLeadStatus(input.leadId, "queued");
      return { success: true };
    }),

  // ── Send Existing DM Draft Immediately ──────────────────────────────────────

  sendDm: protectedProcedure
    .input(z.object({ leadId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const leads = await getOutreachLeadsByUserId(ctx.user.id);
      const lead = leads.find((l) => l.id === input.leadId);
      if (!lead) throw new TRPCError({ code: "NOT_FOUND" });
      if (!lead.dmDraft) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "No DM draft to send" });
      if (lead.status === "sent") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Already sent" });

      const redditAccount = await getRedditAccountByUserId(ctx.user.id);
      if (!redditAccount || redditAccount.isPaused) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Connect your Reddit account in Settings first" });
      }

      const { allowed, reason: rateLimitReason } = await checkCanDm(redditAccount.id, ctx.user.id);
      if (!allowed) {
        // Auto-queue instead of throwing
        await updateOutreachLeadStatus(input.leadId, "queued");
        return { success: true, sent: false, queued: true, reason: rateLimitReason ?? "rate_limited" };
      }

      try {
        const accessToken = await getValidRedditToken(redditAccount);
        const campaign = await getOutreachCampaignById(lead.campaignId);
        const subject = `Re: ${lead.postTitle}`.slice(0, 100);
        await sendRedditDM(accessToken, lead.authorUsername, subject, lead.dmDraft);
        const now = Date.now();
        await updateOutreachLeadStatus(input.leadId, "sent", { sentAt: now });
        await incrementDmCount(redditAccount.id);
        void campaign; // suppress unused warning
        return { success: true, sent: true, queued: false, reason: null };
      } catch (sendErr: unknown) {
        const errMsg = sendErr instanceof Error ? sendErr.message : String(sendErr);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Send failed: ${errMsg}` });
      }
    }),

  updateDmDraft: protectedProcedure
    .input(z.object({ leadId: z.number(), dmDraft: z.string().min(1).max(2000) }))
    .mutation(async ({ ctx, input }) => {
      const leads = await getOutreachLeadsByUserId(ctx.user.id);
      const lead = leads.find((l) => l.id === input.leadId);
      if (!lead) throw new TRPCError({ code: "NOT_FOUND" });
      await updateOutreachLeadStatus(input.leadId, "dm_generated", { dmDraft: input.dmDraft });
      return { success: true };
    }),

  // ── Lead Roast Engine ─────────────────────────────────────────────────────

  roastLead: protectedProcedure
    .input(z.object({ leadId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const leads = await getOutreachLeadsByUserId(ctx.user.id);
      const lead = leads.find((l) => l.id === input.leadId);
      if (!lead) throw new TRPCError({ code: "NOT_FOUND" });

      const campaign = await getOutreachCampaignById(lead.campaignId);
      if (!campaign || campaign.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });

      const systemPrompt = `You are SubRoast's Lead Roast Engine — an AI that evaluates Reddit posts as sales leads.
You score leads on three dimensions and generate a contextual outreach message.
Always respond with valid JSON matching the exact schema.`;

      const userPrompt = `Evaluate this Reddit post as a sales lead for the following offering:

OFFERING: ${campaign.offering}
${campaign.websiteUrl ? `WEBSITE: ${campaign.websiteUrl}` : ""}

REDDIT POST:
Subreddit: r/${lead.subreddit}
Author: u/${lead.authorUsername}
Title: "${lead.postTitle}"
Body: "${(lead.postBody || "").slice(0, 800)}"

Score this lead on:
1. fitScore (0-100): How well does this person's problem match the offering? 100 = perfect match, 0 = completely irrelevant.
2. urgencyScore (0-100): How actively are they seeking a solution RIGHT NOW? 100 = urgent need stated explicitly, 0 = casual mention.
3. sentimentScore (0-100): How frustrated/pained are they? 100 = very frustrated and ready to pay, 0 = neutral observation.

Based on the scores, classify leadHeat:
- "on_fire" if average score >= 80
- "hot" if average score >= 60
- "warm" if average score >= 40
- "cold" if average score < 40

Classify intentType as one of: "hiring", "buying", "seeking_advice", "venting", "unknown"

Write a roastInsight: a single punchy sentence explaining WHY this lead is or isn't worth pursuing (e.g. "Actively evaluating tools, budget confirmed, decision-maker posting directly" or "Just venting, no purchase intent detected").

Write a roastReplyDraft: a contextual DM (under 120 words) that references their specific pain point and naturally introduces the offering. Sound like a real founder, not a bot.

Return JSON with this EXACT structure:
{
  "fitScore": number,
  "urgencyScore": number,
  "sentimentScore": number,
  "leadHeat": "cold" | "warm" | "hot" | "on_fire",
  "intentType": "hiring" | "buying" | "seeking_advice" | "venting" | "unknown",
  "roastInsight": "string",
  "roastReplyDraft": "string"
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system" as const, content: systemPrompt },
          { role: "user" as const, content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "lead_roast",
            strict: true,
            schema: {
              type: "object",
              properties: {
                fitScore: { type: "number" },
                urgencyScore: { type: "number" },
                sentimentScore: { type: "number" },
                leadHeat: { type: "string", enum: ["cold", "warm", "hot", "on_fire"] },
                intentType: { type: "string", enum: ["hiring", "buying", "seeking_advice", "venting", "unknown"] },
                roastInsight: { type: "string" },
                roastReplyDraft: { type: "string" },
              },
              required: ["fitScore", "urgencyScore", "sentimentScore", "leadHeat", "intentType", "roastInsight", "roastReplyDraft"],
              additionalProperties: false,
            },
          },
        },
      });

      const raw = response.choices[0]?.message?.content;
      if (!raw) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI returned no content" });
      const content = typeof raw === "string" ? raw : JSON.stringify(raw);
      const parsed = JSON.parse(content) as {
        fitScore: number;
        urgencyScore: number;
        sentimentScore: number;
        leadHeat: "cold" | "warm" | "hot" | "on_fire";
        intentType: "hiring" | "buying" | "seeking_advice" | "venting" | "unknown";
        roastInsight: string;
        roastReplyDraft: string;
      };

      // Persist scores to DB
      const db = await getDb();
      if (db) {
        const { outreachLeads: leadsTable } = await import("../../drizzle/schema");
        await db
          .update(leadsTable)
          .set({
            fitScore: parsed.fitScore,
            urgencyScore: parsed.urgencyScore,
            sentimentScore: parsed.sentimentScore,
            leadHeat: parsed.leadHeat,
            intentType: parsed.intentType,
            roastInsight: parsed.roastInsight,
            roastReplyDraft: parsed.roastReplyDraft,
          })
          .where(eq(leadsTable.id, input.leadId));
      }

      return { success: true, ...parsed };
    }),

  // ── Pipeline Stage Update ─────────────────────────────────────────────────

  updatePipelineStage: protectedProcedure
    .input(
      z.object({
        leadId: z.number(),
        stage: z.enum(["new", "replied", "interested", "converted", "skipped"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const leads = await getOutreachLeadsByUserId(ctx.user.id);
      const lead = leads.find((l) => l.id === input.leadId);
      if (!lead) throw new TRPCError({ code: "NOT_FOUND" });
      const db = await getDb();
      if (db) {
        const { outreachLeads: leadsTable } = await import("../../drizzle/schema");
        await db
          .update(leadsTable)
          .set({ pipelineStage: input.stage })
          .where(eq(leadsTable.id, input.leadId));
      }
      return { success: true };
    }),

  // ── Cancel Queued Lead ────────────────────────────────────────────────────

  cancelQueuedLead: protectedProcedure
    .input(z.object({ leadId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const leads = await getOutreachLeadsByUserId(ctx.user.id);
      const lead = leads.find((l) => l.id === input.leadId);
      if (!lead) throw new TRPCError({ code: "NOT_FOUND" });
      if (lead.status !== "queued") {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Lead is not queued" });
      }
      // Revert to dm_generated so the user can review/re-queue
      await updateOutreachLeadStatus(input.leadId, "dm_generated");
      return { success: true };
    }),

  // ── Generate Public Comment Draft ─────────────────────────────────────────

  generateComment: protectedProcedure
    .input(z.object({ leadId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const leads = await getOutreachLeadsByUserId(ctx.user.id);
      const lead = leads.find((l) => l.id === input.leadId);
      if (!lead) throw new TRPCError({ code: "NOT_FOUND" });

      // Fetch campaign for context
      const campaign = await getOutreachCampaignById(lead.campaignId);
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });

      const systemPrompt = `You are an expert Reddit community builder and indie founder.
Your job is to write a helpful, genuine public comment reply that builds karma and subtly demonstrates expertise.
NEVER pitch directly. Sound like a real person helping, not a marketer.`;

      const userPrompt = `Post title: "${lead.postTitle}"
Post body: "${lead.postBody?.slice(0, 800) ?? ""}"
Author: u/${lead.authorUsername}
Subreddit: r/${lead.subreddit}

Offering context: ${campaign.offering}

Write a public comment (under 100 words) that:
1. Directly addresses the poster's question or problem
2. Provides genuine value or insight
3. Naturally positions you as someone who understands this space
4. Does NOT mention your product by name or pitch anything
5. Ends with an open question to encourage engagement

Return JSON: { "commentDraft": "string" }`;

      const response = await invokeLLM({
        messages: [
          { role: "system" as const, content: systemPrompt },
          { role: "user" as const, content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "comment_draft",
            strict: true,
            schema: {
              type: "object",
              properties: {
                commentDraft: { type: "string" },
              },
              required: ["commentDraft"],
              additionalProperties: false,
            },
          },
        },
      });

      const raw = response.choices[0]?.message?.content;
      if (!raw) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI returned no content" });
      const content = typeof raw === "string" ? raw : JSON.stringify(raw);
      const parsed = JSON.parse(content) as { commentDraft: string };

      // Persist comment draft to DB
      const db = await getDb();
      if (db) {
        const { outreachLeads: leadsTable } = await import("../../drizzle/schema");
        await db
          .update(leadsTable)
          .set({ commentDraft: parsed.commentDraft })
          .where(eq(leadsTable.id, input.leadId));
      }

      return { success: true, commentDraft: parsed.commentDraft };
    }),
});
