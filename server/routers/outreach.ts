import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "../_core/llm";
import { protectedProcedure, router } from "../_core/trpc";
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
} from "../db";

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
        "User-Agent": "SubSignal/1.0 (subreddit monitoring bot)",
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
      await updateOutreachCampaign(input.campaignId, {
        lastSyncAt: Date.now(),
        leadsFound: c.leadsFound + newLeads,
      });

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

      const systemPrompt = `You are a Reddit DM expert who writes genuine, helpful outreach messages for indie SaaS founders.
Your DMs are conversational, non-spammy, and reference the specific Reddit post.
${campaign.aiPromptInstructions ? `Additional instructions: ${campaign.aiPromptInstructions}` : ""}`;

      const userPrompt = `Write a Reddit DM to u/${lead.authorUsername} who posted in r/${lead.subreddit}:

Post title: "${lead.postTitle}"
Post body: "${(lead.postBody || "").slice(0, 500)}"

Our offering: ${campaign.offering}
${campaign.websiteUrl ? `Website: ${campaign.websiteUrl}` : ""}

Rules:
- Start with a genuine reference to their specific post (not generic)
- Be helpful, not salesy
- Mention your product naturally as a potential solution
- Keep it under 150 words
- No subject line needed (this is a DM body)
- Sound like a real person, not a bot

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

      await updateOutreachLeadStatus(input.leadId, "dm_generated", { dmDraft: parsed.dm });

      // If auto_send mode, queue it
      if (campaign.reviewMode === "auto_send") {
        await updateOutreachLeadStatus(input.leadId, "queued");
      }

      return { success: true, dm: parsed.dm, autoQueued: campaign.reviewMode === "auto_send" };
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

  updateDmDraft: protectedProcedure
    .input(z.object({ leadId: z.number(), dmDraft: z.string().min(1).max(2000) }))
    .mutation(async ({ ctx, input }) => {
      const leads = await getOutreachLeadsByUserId(ctx.user.id);
      const lead = leads.find((l) => l.id === input.leadId);
      if (!lead) throw new TRPCError({ code: "NOT_FOUND" });
      await updateOutreachLeadStatus(input.leadId, "dm_generated", { dmDraft: input.dmDraft });
      return { success: true };
    }),
});
