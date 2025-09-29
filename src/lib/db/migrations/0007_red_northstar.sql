ALTER TABLE "tours" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "tours" ADD CONSTRAINT "tours_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tours_created_by_idx" ON "tours" USING btree ("created_by");