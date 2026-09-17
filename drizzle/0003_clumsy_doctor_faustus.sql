ALTER TABLE `siteSettings` ADD `serviceDuration` int DEFAULT 60 NOT NULL;--> statement-breakpoint
ALTER TABLE `siteSettings` ADD `simultaneousCapacity` int DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE `siteSettings` ADD `blockedDates` text;