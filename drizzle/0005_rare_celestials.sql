ALTER TABLE `outreach_leads` ADD `upvotes` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `outreach_leads` ADD `commentCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `outreach_leads` ADD `fitScore` int;--> statement-breakpoint
ALTER TABLE `outreach_leads` ADD `urgencyScore` int;--> statement-breakpoint
ALTER TABLE `outreach_leads` ADD `sentimentScore` int;--> statement-breakpoint
ALTER TABLE `outreach_leads` ADD `leadHeat` enum('cold','warm','hot','on_fire');--> statement-breakpoint
ALTER TABLE `outreach_leads` ADD `roastInsight` text;--> statement-breakpoint
ALTER TABLE `outreach_leads` ADD `intentType` enum('hiring','buying','seeking_advice','venting','unknown') DEFAULT 'unknown';--> statement-breakpoint
ALTER TABLE `outreach_leads` ADD `roastReplyDraft` text;--> statement-breakpoint
ALTER TABLE `outreach_leads` ADD `pipelineStage` enum('new','replied','interested','converted','skipped') DEFAULT 'new' NOT NULL;