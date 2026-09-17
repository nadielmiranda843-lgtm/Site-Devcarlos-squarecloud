CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`petId` int,
	`serviceId` int NOT NULL,
	`startsAt` timestamp NOT NULL,
	`status` enum('requested','confirmed','in_service','completed','cancelled') NOT NULL DEFAULT 'requested',
	`transport` enum('store','pickup') NOT NULL DEFAULT 'store',
	`pickupAddress` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`slug` varchar(140) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('pending','paid','preparing','out_for_delivery','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`total` decimal(10,2) NOT NULL,
	`paymentMethod` varchar(40),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`species` varchar(50) NOT NULL,
	`breed` varchar(120),
	`size` varchar(40),
	`birthDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int,
	`name` varchar(180) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`promoPrice` decimal(10,2),
	`stock` int NOT NULL DEFAULT 0,
	`imageUrl` text,
	`brand` varchar(100),
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`durationMinutes` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`active` int NOT NULL DEFAULT 1,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
