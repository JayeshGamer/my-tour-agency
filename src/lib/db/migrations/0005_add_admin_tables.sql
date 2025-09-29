-- Add new tables for admin functionality
-- Creating in order of dependencies

-- Create notifications table
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"priority" varchar(20) DEFAULT 'normal' NOT NULL,
	"admin_id" uuid,
	"related_entity_type" varchar(50),
	"related_entity_id" uuid,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create coupons table
CREATE TABLE IF NOT EXISTS "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"discount_type" varchar(20) NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"minimum_amount" numeric(10, 2),
	"maximum_discount" numeric(10, 2),
	"usage_limit" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"valid_from" timestamp NOT NULL,
	"valid_until" timestamp NOT NULL,
	"applicable_to_tours" json,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);

-- Create coupon usage table
CREATE TABLE IF NOT EXISTS "coupon_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coupon_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"booking_id" uuid,
	"discount_amount" numeric(10, 2) NOT NULL,
	"used_at" timestamp DEFAULT now() NOT NULL
);

-- Create settings table
CREATE TABLE IF NOT EXISTS "settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text,
	"description" text,
	"type" varchar(50) NOT NULL,
	"category" varchar(50) NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);

-- Add foreign key constraints
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_admin_id_users_id_fk" 
	FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "coupons" ADD CONSTRAINT "coupons_created_by_users_id_fk" 
	FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "coupon_usage" ADD CONSTRAINT "coupon_usage_coupon_id_coupons_id_fk" 
	FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "coupon_usage" ADD CONSTRAINT "coupon_usage_user_id_users_id_fk" 
	FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "coupon_usage" ADD CONSTRAINT "coupon_usage_booking_id_bookings_id_fk" 
	FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "settings" ADD CONSTRAINT "settings_updated_by_users_id_fk" 
	FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "notifications_type_idx" ON "notifications" USING btree ("type");
CREATE INDEX IF NOT EXISTS "notifications_admin_id_idx" ON "notifications" USING btree ("admin_id");
CREATE INDEX IF NOT EXISTS "notifications_is_read_idx" ON "notifications" USING btree ("is_read");
CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications" USING btree ("created_at");

CREATE INDEX IF NOT EXISTS "coupons_code_idx" ON "coupons" USING btree ("code");
CREATE INDEX IF NOT EXISTS "coupons_is_active_idx" ON "coupons" USING btree ("is_active");
CREATE INDEX IF NOT EXISTS "coupons_valid_from_idx" ON "coupons" USING btree ("valid_from");
CREATE INDEX IF NOT EXISTS "coupons_valid_until_idx" ON "coupons" USING btree ("valid_until");

CREATE INDEX IF NOT EXISTS "coupon_usage_coupon_id_idx" ON "coupon_usage" USING btree ("coupon_id");
CREATE INDEX IF NOT EXISTS "coupon_usage_user_id_idx" ON "coupon_usage" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "coupon_usage_used_at_idx" ON "coupon_usage" USING btree ("used_at");

CREATE INDEX IF NOT EXISTS "settings_key_idx" ON "settings" USING btree ("key");
CREATE INDEX IF NOT EXISTS "settings_category_idx" ON "settings" USING btree ("category");

-- Insert some initial settings
INSERT INTO "settings" ("key", "value", "description", "type", "category", "is_public", "created_at", "updated_at") VALUES
('site_name', 'Travel Agency', 'Name of the platform', 'string', 'general', true, now(), now()),
('site_description', 'Discover and book unforgettable tours worldwide', 'Site description', 'string', 'general', true, now(), now()),
('support_email', 'support@touragency.com', 'Support email address', 'string', 'general', true, now(), now()),
('email_notifications', 'true', 'Enable email notifications for bookings', 'boolean', 'email', false, now(), now()),
('marketing_emails', 'false', 'Enable marketing emails', 'boolean', 'email', false, now(), now()),
('new_booking_alerts', 'true', 'Alert admins on new bookings', 'boolean', 'notification', false, now(), now()),
('payment_failure_alerts', 'true', 'Alert admins on payment failures', 'boolean', 'notification', false, now(), now()),
('system_error_alerts', 'true', 'Alert admins on system errors', 'boolean', 'notification', false, now(), now()),
('api_rate_limiting', 'true', 'Enable API rate limiting', 'boolean', 'api', false, now(), now())
ON CONFLICT ("key") DO NOTHING;
