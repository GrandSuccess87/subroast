CREATE TABLE `feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('feature','bug','other') NOT NULL DEFAULT 'feature',
	`title` varchar(200) NOT NULL,
	`body` text,
	`status` enum('open','planned','done') NOT NULL DEFAULT 'open',
	`upvotes` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `outreach_campaigns` ADD `dailySyncsUsed` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `outreach_campaigns` ADD `dailySyncsResetAt` bigint;--> statement-breakpoint
ALTER TABLE `outreach_leads` ADD `spamScore` int;--> statement-breakpoint
ALTER TABLE `outreach_leads` ADD `spamFlags` text;--> statement-breakpoint
ALTER TABLE `outreach_leads` ADD CONSTRAINT `uq_campaign_post` UNIQUE(`campaignId`,`redditPostId`);