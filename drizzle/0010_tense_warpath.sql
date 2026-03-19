CREATE TABLE `waitlist_signups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(200),
	`source` enum('header','footer','home_header','home_footer') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `waitlist_signups_id` PRIMARY KEY(`id`)
);
