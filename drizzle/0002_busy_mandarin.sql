CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int,
	`productName` varchar(180) NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`quantity` int NOT NULL,
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `siteSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeName` varchar(160) NOT NULL DEFAULT 'Power Pet',
	`logoUrl` text,
	`whatsapp` varchar(40),
	`phone` varchar(40),
	`email` varchar(320),
	`address` text,
	`openingHours` text,
	`instagram` varchar(160),
	`deliveryRegions` text,
	`deliveryFee` decimal(10,2) NOT NULL DEFAULT '0.00',
	`paymentMode` enum('manual','stripe','pix') NOT NULL DEFAULT 'manual',
	`stripeEnabled` int NOT NULL DEFAULT 0,
	`whatsappEnabled` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `stripePaymentIntentId` varchar(120);--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(120);