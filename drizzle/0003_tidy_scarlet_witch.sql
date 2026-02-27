ALTER TABLE `users` ADD `stripeCustomerId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `stripeSubscriptionId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `plan` enum('trial','starter','growth','none') DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `trialStartAt` bigint;--> statement-breakpoint
ALTER TABLE `users` ADD `trialEndsAt` bigint;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` enum('active','trialing','past_due','canceled','none') DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `trialReminderSentAt` bigint;