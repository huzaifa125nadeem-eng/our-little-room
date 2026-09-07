CREATE TABLE `chat_budget` (
	`id` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `chats` (
	`id` text PRIMARY KEY NOT NULL,
	`messages` text DEFAULT '[]' NOT NULL,
	`busy_until` integer DEFAULT 0 NOT NULL,
	`request_id` text DEFAULT '' NOT NULL
);
