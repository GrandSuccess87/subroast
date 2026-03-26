CREATE TABLE `reddit_oauth_states` (
	`state` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`redirectUri` varchar(500) NOT NULL,
	`createdAt` bigint NOT NULL,
	CONSTRAINT `reddit_oauth_states_state` PRIMARY KEY(`state`)
);
