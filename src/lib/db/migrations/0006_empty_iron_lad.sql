CREATE TYPE "public"."payment_status" AS ENUM('Pending', 'Paid', 'Failed', 'Refunded');--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "payment_status" "payment_status" DEFAULT 'Pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "payment_method" varchar(50);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "payment_reference" varchar(255);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "payment_date" timestamp;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "traveler_info" json;--> statement-breakpoint
CREATE INDEX "bookings_payment_status_idx" ON "bookings" USING btree ("payment_status");--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "payment_intent_id";