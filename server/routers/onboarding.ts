import { eq } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb, getRedditAccountByUserId, getOutreachCampaignsByUserId, getOutreachLeadsByUserId, getPostHistoryByUserId } from "../db";
import { users } from "../../drizzle/schema";

// ─── Onboarding Router ────────────────────────────────────────────────────────
//
// Computes real completion state for each onboarding step and exposes a
// dismiss mutation so the checklist can be permanently hidden.

export const onboardingRouter = router({
  /**
   * Returns the completion state of each onboarding step plus whether the
   * user has already dismissed the checklist.
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();

    // Check dismissal first — if dismissed, return early with flag set
    let dismissed = false;
    if (db) {
      const rows = await db
        .select({ onboardingDismissedAt: users.onboardingDismissedAt })
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);
      dismissed = !!(rows[0]?.onboardingDismissedAt);
    }

    // Step 1: Reddit account connected
    const redditAccount = await getRedditAccountByUserId(ctx.user.id);
    const redditConnected = !!(redditAccount?.isActive);

    // Step 2: First outreach campaign created
    const campaigns = await getOutreachCampaignsByUserId(ctx.user.id);
    const campaignCreated = campaigns.length > 0;

    // Step 3: First lead synced (any lead exists)
    const leads = await getOutreachLeadsByUserId(ctx.user.id);
    const leadSynced = leads.length > 0;

    // Step 4: First post drafted (any post history entry)
    const history = await getPostHistoryByUserId(ctx.user.id);
    const postDrafted = history.length > 0;

    const steps = [
      {
        id: "reddit_connected",
        label: "Connect your Reddit account",
        description: "Link Reddit to enable post drafting and DM sending",
        href: "/settings",
        completed: redditConnected,
        comingSoon: true, // REDDIT_CONNECT_DISABLED: remove this flag when Reddit API is approved
      },
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
});
