import {
  bigint,
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Reddit account connection per user
export const redditAccounts = mysqlTable("reddit_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  redditUsername: varchar("redditUsername", { length: 64 }).notNull(),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken").notNull(),
  tokenExpiresAt: bigint("tokenExpiresAt", { mode: "number" }).notNull(), // unix ms
  scopes: text("scopes").notNull(), // comma-separated
  isActive: boolean("isActive").default(true).notNull(),
  failureCount: int("failureCount").default(0).notNull(),
  isPaused: boolean("isPaused").default(false).notNull(),
  pauseReason: text("pauseReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RedditAccount = typeof redditAccounts.$inferSelect;
export type InsertRedditAccount = typeof redditAccounts.$inferInsert;

// Scheduled posts
export const scheduledPosts = mysqlTable("scheduled_posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  redditAccountId: int("redditAccountId").notNull(),
  subreddit: varchar("subreddit", { length: 128 }).notNull(),
  title: text("title").notNull(),
  body: text("body"),
  scheduledAt: bigint("scheduledAt", { mode: "number" }).notNull(), // unix ms
  status: mysqlEnum("status", ["pending", "posted", "failed", "cancelled"]).default("pending").notNull(),
  redditPostId: varchar("redditPostId", { length: 64 }),
  redditPostUrl: text("redditPostUrl"),
  errorMessage: text("errorMessage"),
  postedAt: bigint("postedAt", { mode: "number" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScheduledPost = typeof scheduledPosts.$inferSelect;
export type InsertScheduledPost = typeof scheduledPosts.$inferInsert;

// DM campaigns
export const dmCampaigns = mysqlTable("dm_campaigns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  redditAccountId: int("redditAccountId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  subject: varchar("subject", { length: 256 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["draft", "active", "paused", "completed"]).default("draft").notNull(),
  totalRecipients: int("totalRecipients").default(0).notNull(),
  sentCount: int("sentCount").default(0).notNull(),
  failedCount: int("failedCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DmCampaign = typeof dmCampaigns.$inferSelect;
export type InsertDmCampaign = typeof dmCampaigns.$inferInsert;

// Individual DM recipients in a campaign
export const dmRecipients = mysqlTable("dm_recipients", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  userId: int("userId").notNull(),
  username: varchar("username", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["pending", "sent", "failed", "skipped"]).default("pending").notNull(),
  sentAt: bigint("sentAt", { mode: "number" }),
  errorMessage: text("errorMessage"),
  scheduledAt: bigint("scheduledAt", { mode: "number" }), // when to send this DM
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DmRecipient = typeof dmRecipients.$inferSelect;
export type InsertDmRecipient = typeof dmRecipients.$inferInsert;

// Rate limit tracking per account per day
export const rateLimitTracking = mysqlTable("rate_limit_tracking", {
  id: int("id").autoincrement().primaryKey(),
  redditAccountId: int("redditAccountId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  postsCount: int("postsCount").default(0).notNull(),
  dmsCount: int("dmsCount").default(0).notNull(),
  lastPostAt: bigint("lastPostAt", { mode: "number" }),
  lastDmAt: bigint("lastDmAt", { mode: "number" }),
  dmsThisHour: int("dmsThisHour").default(0).notNull(),
  hourWindowStart: bigint("hourWindowStart", { mode: "number" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RateLimitTracking = typeof rateLimitTracking.$inferSelect;
export type InsertRateLimitTracking = typeof rateLimitTracking.$inferInsert;

// Post history (all sent posts)
export const postHistory = mysqlTable("post_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  redditAccountId: int("redditAccountId").notNull(),
  subreddit: varchar("subreddit", { length: 128 }).notNull(),
  title: text("title").notNull(),
  body: text("body"),
  redditPostId: varchar("redditPostId", { length: 64 }),
  redditPostUrl: text("redditPostUrl"),
  type: mysqlEnum("type", ["manual", "scheduled"]).default("manual").notNull(),
  status: mysqlEnum("status", ["posted", "failed", "removed"]).default("posted").notNull(),
  commentCount: int("commentCount").default(0),
  upvotes: int("upvotes").default(0),
  postedAt: bigint("postedAt", { mode: "number" }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostHistory = typeof postHistory.$inferSelect;
export type InsertPostHistory = typeof postHistory.$inferInsert;

// User settings
export const userSettings = mysqlTable("user_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  maxPostsPerDay: int("maxPostsPerDay").default(5).notNull(),
  maxDmsPerDay: int("maxDmsPerDay").default(25).notNull(),
  maxDmsPerHour: int("maxDmsPerHour").default(5).notNull(),
  minDelayBetweenDmsMs: bigint("minDelayBetweenDmsMs", { mode: "number" }).default(120000).notNull(), // 2 min
  maxDelayBetweenDmsMs: bigint("maxDelayBetweenDmsMs", { mode: "number" }).default(600000).notNull(), // 10 min
  minDelayBetweenPostsMs: bigint("minDelayBetweenPostsMs", { mode: "number" }).default(1800000).notNull(), // 30 min
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;
