import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { desc, eq, sql } from "drizzle-orm";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { feedback, users } from "../../drizzle/schema";

export const feedbackRouter = router({
  // Submit a new feedback item (any logged-in user)
  submit: protectedProcedure
    .input(
      z.object({
        type: z.enum(["feature", "bug", "other"]),
        title: z.string().min(1).max(200),
        body: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.insert(feedback).values({
        userId: ctx.user.id,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
      });

      return { success: true };
    }),

  // List all feedback items (public board — visible to all logged-in users)
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const rows = await db
      .select({
        id: feedback.id,
        userId: feedback.userId,
        type: feedback.type,
        title: feedback.title,
        body: feedback.body,
        status: feedback.status,
        upvotes: feedback.upvotes,
        createdAt: feedback.createdAt,
        authorName: users.name,
      })
      .from(feedback)
      .leftJoin(users, eq(feedback.userId, users.id))
      .orderBy(desc(feedback.upvotes), desc(feedback.createdAt));

    return rows.map((r) => ({
      ...r,
      isOwn: r.userId === ctx.user.id,
    }));
  }),

  // Upvote a feedback item (one upvote per user per item — tracked client-side for now)
  upvote: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db
        .update(feedback)
        .set({ upvotes: sql`${feedback.upvotes} + 1` })
        .where(eq(feedback.id, input.id));

      return { success: true };
    }),

  // Admin: update status of a feedback item
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["open", "planned", "done"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db
        .update(feedback)
        .set({ status: input.status })
        .where(eq(feedback.id, input.id));

      return { success: true };
    }),
});
