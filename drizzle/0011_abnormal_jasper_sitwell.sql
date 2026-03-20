ALTER TABLE `waitlist_signups` MODIFY COLUMN `source` enum('header','footer','home_header','home_footer','home_modal') NOT NULL;--> statement-breakpoint
ALTER TABLE `outreach_leads` ADD `isFavorited` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `onboardingStep` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `onboardingCompletedAt` bigint;--> statement-breakpoint
ALTER TABLE `users` ADD `currentTool` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `currentToolOther` varchar(256);--> statement-breakpoint
ALTER TABLE `users` ADD `painPoints` text;--> statement-breakpoint
ALTER TABLE `users` ADD `painPointsOther` varchar(512);--> statement-breakpoint
ALTER TABLE `users` ADD `successDefinition` text;--> statement-breakpoint
ALTER TABLE `users` ADD `willingnessToPay` enum('yes','maybe','no');--> statement-breakpoint
ALTER TABLE `users` ADD `additionalNotes` text;