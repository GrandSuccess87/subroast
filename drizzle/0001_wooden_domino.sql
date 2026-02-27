CREATE TABLE `dm_campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`redditAccountId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`subject` varchar(256) NOT NULL,
	`message` text NOT NULL,
	`status` enum('draft','active','paused','completed') NOT NULL DEFAULT 'draft',
	`totalRecipients` int NOT NULL DEFAULT 0,
	`sentCount` int NOT NULL DEFAULT 0,
	`failedCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dm_campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dm_recipients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`userId` int NOT NULL,
	`username` varchar(64) NOT NULL,
	`status` enum('pending','sent','failed','skipped') NOT NULL DEFAULT 'pending',
	`sentAt` bigint,
	`errorMessage` text,
	`scheduledAt` bigint,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dm_recipients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`redditAccountId` int NOT NULL,
	`subreddit` varchar(128) NOT NULL,
	`title` text NOT NULL,
	`body` text,
	`redditPostId` varchar(64),
	`redditPostUrl` text,
	`type` enum('manual','scheduled') NOT NULL DEFAULT 'manual',
	`status` enum('posted','failed','removed') NOT NULL DEFAULT 'posted',
	`commentCount` int DEFAULT 0,
	`upvotes` int DEFAULT 0,
	`postedAt` bigint NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `post_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rate_limit_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`redditAccountId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`postsCount` int NOT NULL DEFAULT 0,
	`dmsCount` int NOT NULL DEFAULT 0,
	`lastPostAt` bigint,
	`lastDmAt` bigint,
	`dmsThisHour` int NOT NULL DEFAULT 0,
	`hourWindowStart` bigint,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rate_limit_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reddit_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`redditUsername` varchar(64) NOT NULL,
	`accessToken` text NOT NULL,
	`refreshToken` text NOT NULL,
	`tokenExpiresAt` bigint NOT NULL,
	`scopes` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`failureCount` int NOT NULL DEFAULT 0,
	`isPaused` boolean NOT NULL DEFAULT false,
	`pauseReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reddit_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduled_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`redditAccountId` int NOT NULL,
	`subreddit` varchar(128) NOT NULL,
	`title` text NOT NULL,
	`body` text,
	`scheduledAt` bigint NOT NULL,
	`status` enum('pending','posted','failed','cancelled') NOT NULL DEFAULT 'pending',
	`redditPostId` varchar(64),
	`redditPostUrl` text,
	`errorMessage` text,
	`postedAt` bigint,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduled_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`maxPostsPerDay` int NOT NULL DEFAULT 5,
	`maxDmsPerDay` int NOT NULL DEFAULT 25,
	`maxDmsPerHour` int NOT NULL DEFAULT 5,
	`minDelayBetweenDmsMs` bigint NOT NULL DEFAULT 120000,
	`maxDelayBetweenDmsMs` bigint NOT NULL DEFAULT 600000,
	`minDelayBetweenPostsMs` bigint NOT NULL DEFAULT 1800000,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_settings_userId_unique` UNIQUE(`userId`)
);
