PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_monthly_assets` (
	`id` integer PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`amount` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`user_id` text NOT NULL,
	`asset_category_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`asset_category_id`) REFERENCES `asset_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_monthly_assets`("id", "date", "amount", "created_at", "updated_at", "user_id", "asset_category_id") SELECT "id", "date", "amount", "created_at", "updated_at", "user_id", "asset_category_id" FROM `monthly_assets`;--> statement-breakpoint
DROP TABLE `monthly_assets`;--> statement-breakpoint
ALTER TABLE `__new_monthly_assets` RENAME TO `monthly_assets`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `monthly_assets_unique_idx` ON `monthly_assets` (`user_id`,`date`,`asset_category_id`);