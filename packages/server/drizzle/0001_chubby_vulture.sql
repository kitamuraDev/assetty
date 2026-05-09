CREATE TABLE `asset_categories` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `asset_categories_name_unique` ON `asset_categories` (`name`);--> statement-breakpoint
CREATE TABLE `monthly_assets` (
	`id` integer PRIMARY KEY NOT NULL,
	`date` text DEFAULT (strftime('%Y-%m-01', CURRENT_TIMESTAMP)) NOT NULL,
	`amount` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`user_id` text NOT NULL,
	`asset_category_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`asset_category_id`) REFERENCES `asset_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `monthly_assets_unique_idx` ON `monthly_assets` (`user_id`,`date`,`asset_category_id`);