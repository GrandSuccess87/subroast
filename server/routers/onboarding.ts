import { eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb, getRedditAccountByUserId, getOutreachCampaignsByUserId, getOutreachLeadsByUserId, getPostHistoryByUserId } from "../db";
import { users } from "../../drizzle/schema";

// ─── Onboarding Router ────────────────────────────────────────────────────────

export const onboardingRouter = router({
  /**
   * Returns the completion state of each onboarding checklist step plus
   * whether the user has already dismissed the checklist.
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();

    let dismissed = false;
    if (db) {
      const rows = await db
        .select({ onboardingDismissedAt: users.onboardingDismissedAt })
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);
      dismissed = !!(rows[0]?.onboardingDismissedAt);
    }

    const redditAccount = await getRedditAccountByUserId(ctx.user.id);
    const redditConnected = !!(redditAccount?.isActive);

    const campaigns = await getOutreachCampaignsByUserId(ctx.user.id);
    const campaignCreated = campaigns.length > 0;

    const leads = await getOutreachLeadsByUserId(ctx.user.id);
    const leadSynced = leads.length > 0;

    const history = await getPostHistoryByUserId(ctx.user.id);
    const postDrafted = history.length > 0;

    const steps = [
      {
        id: "campaign_created",
        label: "Create your first outreach campaign",
        description: "Set up subreddit monitoring to discover leads automatically",
        href: "/dm-campaigns",
        completed: campaignCreated,
      },
      {
        id: "lead_synced",
        label: "Sync leads from Reddit",
        description: "Run your first lead sync to find prospects in your target subreddits",
        href: "/dm-campaigns",
        completed: leadSynced,
      },
      {
        id: "post_drafted",
        label: "Roast your first post & check your virality score",
        description: "Get AI feedback, a brutally honest roast, and a 1-100 virality score on your next Reddit post",
        href: "/draft",
        completed: postDrafted,
      },
    ];

    const completedCount = steps.filter((s) => s.completed).length;
    const allComplete = completedCount === steps.length;

    return {
      dismissed,
      allComplete,
      completedCount,
      totalCount: steps.length,
      steps,
    };
  }),

  /**
   * Permanently dismisses the onboarding checklist for this user.
   */
  dismiss: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { success: false };
    await db
      .update(users)
      .set({ onboardingDismissedAt: Date.now() })
      .where(eq(users.id, ctx.user.id));
    return { success: true };
  }),

  // ─── Qualification Onboarding ─────────────────────────────────────────────

  /**
   * Returns the user's qualification onboarding state so the frontend
   * knows whether to gate the dashboard and which step to resume from.
   */
  getQualificationStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { completed: false, step: 0, data: null };

    const rows = await db
      .select({
        onboardingStep: users.onboardingStep,
        onboardingCompletedAt: users.onboardingCompletedAt,
        currentTool: users.currentTool,
        currentToolOther: users.currentToolOther,
        painPoints: users.painPoints,
        painPointsOther: users.painPointsOther,
        successDefinition: users.successDefinition,
        willingnessToPay: users.willingnessToPay,
        additionalNotes: users.additionalNotes,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    const row = rows[0];
    if (!row) return { completed: false, step: 0, data: null };

    return {
      completed: !!(row.onboardingCompletedAt),
      step: row.onboardingStep ?? 0,
      data: {
        name: row.name,
        email: row.email,
        currentTool: row.currentTool,
        currentToolOther: row.currentToolOther,
        painPoints: row.painPoints ? (JSON.parse(row.painPoints) as string[]) : [],
        painPointsOther: row.painPointsOther,
        successDefinition: row.successDefinition,
        willingnessToPay: row.willingnessToPay,
        additionalNotes: row.additionalNotes,
      },
    };
  }),

  /**
   * Saves progress for a single step so the user can resume if they drop off.
   * The step number is stored so the frontend knows where to resume.
   */
  saveStep: protectedProcedure
    .input(
      z.object({
        step: z.number().min(1).max(5),
        currentTool: z.string().max(128).optional(),
        currentToolOther: z.string().max(256).optional(),
        painPoints: z.array(z.string()).optional(),
        painPointsOther: z.string().max(512).optional(),
        successDefinition: z.string().max(2000).optional(),
        willingnessToPay: z.enum(["under_20", "20_39", "40_59", "60_plus", "need_results", "yes", "maybe", "no"]).optional(),
        additionalNotes: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      await db
        .update(users)
        .set({
          onboardingStep: input.step,
          ...(input.currentTool !== undefined ? { currentTool: input.currentTool } : {}),
          ...(input.currentToolOther !== undefined ? { currentToolOther: input.currentToolOther } : {}),
          ...(input.painPoints !== undefined ? { painPoints: JSON.stringify(input.painPoints) } : {}),
          ...(input.painPointsOther !== undefined ? { painPointsOther: input.painPointsOther } : {}),
          ...(input.successDefinition !== undefined ? { successDefinition: input.successDefinition } : {}),
          ...(input.willingnessToPay !== undefined ? { willingnessToPay: input.willingnessToPay } : {}),
          ...(input.additionalNotes !== undefined ? { additionalNotes: input.additionalNotes } : {}),
        })
        .where(eq(users.id, ctx.user.id));

      return { success: true };
    }),

  /**
   * Marks the qualification onboarding as complete and redirects to dashboard.
   */
  complete: protectedProcedure
    .input(
      z.object({
        currentTool: z.string().max(128),
        currentToolOther: z.string().max(256).optional(),
        painPoints: z.array(z.string()),
        painPointsOther: z.string().max(512).optional(),
        successDefinition: z.string().min(1).max(2000),
        willingnessToPay: z.enum(["under_20", "20_39", "40_59", "60_plus", "need_results", "yes", "maybe", "no"]),
        additionalNotes: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      await db
        .update(users)
        .set({
          onboardingStep: 5,
          onboardingCompletedAt: Date.now(),
          currentTool: input.currentTool,
          currentToolOther: input.currentToolOther ?? null,
          painPoints: JSON.stringify(input.painPoints),
          painPointsOther: input.painPointsOther ?? null,
          successDefinition: input.successDefinition,
          willingnessToPay: input.willingnessToPay,
          additionalNotes: input.additionalNotes ?? null,
        })
        .where(eq(users.id, ctx.user.id));

      return { success: true };
    }),
});
