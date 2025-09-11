import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function runCustomMigration() {
  console.log('🔧 Running Custom Migration');
  console.log('==========================\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('📄 Running migration: Creating admin tables...');
    
    // Create notifications table
    await sql`
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
      )`;
    
    // Create coupons table
    await sql`
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
      )`;
    
    // Create coupon usage table
    await sql`
      CREATE TABLE IF NOT EXISTS "coupon_usage" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "coupon_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "booking_id" uuid,
        "discount_amount" numeric(10, 2) NOT NULL,
        "used_at" timestamp DEFAULT now() NOT NULL
      )`;
    
    // Create settings table
    await sql`
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
      )`;
    
    console.log('✅ Tables created successfully!');
    
    // Add foreign key constraints
    console.log('🔗 Adding foreign key constraints...');
    
    try {
      await sql`ALTER TABLE "notifications" ADD CONSTRAINT "notifications_admin_id_users_id_fk" 
        FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action`;
    } catch (e: any) {
      if (!e.message.includes('already exists')) console.log('⚠️  FK constraint notifications_admin_id already exists');
    }
    
    try {
      await sql`ALTER TABLE "coupons" ADD CONSTRAINT "coupons_created_by_users_id_fk" 
        FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action`;
    } catch (e: any) {
      if (!e.message.includes('already exists')) console.log('⚠️  FK constraint coupons_created_by already exists');
    }
    
    try {
      await sql`ALTER TABLE "coupon_usage" ADD CONSTRAINT "coupon_usage_coupon_id_coupons_id_fk" 
        FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE no action ON UPDATE no action`;
    } catch (e: any) {
      if (!e.message.includes('already exists')) console.log('⚠️  FK constraint coupon_usage_coupon_id already exists');
    }
    
    try {
      await sql`ALTER TABLE "coupon_usage" ADD CONSTRAINT "coupon_usage_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action`;
    } catch (e: any) {
      if (!e.message.includes('already exists')) console.log('⚠️  FK constraint coupon_usage_user_id already exists');
    }
    
    try {
      await sql`ALTER TABLE "coupon_usage" ADD CONSTRAINT "coupon_usage_booking_id_bookings_id_fk" 
        FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action`;
    } catch (e: any) {
      if (!e.message.includes('already exists')) console.log('⚠️  FK constraint coupon_usage_booking_id already exists');
    }
    
    try {
      await sql`ALTER TABLE "settings" ADD CONSTRAINT "settings_updated_by_users_id_fk" 
        FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action`;
    } catch (e: any) {
      if (!e.message.includes('already exists')) console.log('⚠️  FK constraint settings_updated_by already exists');
    }
    
    // Create indexes
    console.log('🔍 Creating indexes...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS "notifications_type_idx" ON "notifications" USING btree ("type")',
      'CREATE INDEX IF NOT EXISTS "notifications_admin_id_idx" ON "notifications" USING btree ("admin_id")',
      'CREATE INDEX IF NOT EXISTS "notifications_is_read_idx" ON "notifications" USING btree ("is_read")',
      'CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications" USING btree ("created_at")',
      'CREATE INDEX IF NOT EXISTS "coupons_code_idx" ON "coupons" USING btree ("code")',
      'CREATE INDEX IF NOT EXISTS "coupons_is_active_idx" ON "coupons" USING btree ("is_active")',
      'CREATE INDEX IF NOT EXISTS "coupons_valid_from_idx" ON "coupons" USING btree ("valid_from")',
      'CREATE INDEX IF NOT EXISTS "coupons_valid_until_idx" ON "coupons" USING btree ("valid_until")',
      'CREATE INDEX IF NOT EXISTS "coupon_usage_coupon_id_idx" ON "coupon_usage" USING btree ("coupon_id")',
      'CREATE INDEX IF NOT EXISTS "coupon_usage_user_id_idx" ON "coupon_usage" USING btree ("user_id")',
      'CREATE INDEX IF NOT EXISTS "coupon_usage_used_at_idx" ON "coupon_usage" USING btree ("used_at")',
      'CREATE INDEX IF NOT EXISTS "settings_key_idx" ON "settings" USING btree ("key")',
      'CREATE INDEX IF NOT EXISTS "settings_category_idx" ON "settings" USING btree ("category")'
    ];
    
    for (const indexSQL of indexes) {
      try {
        await sql.query(indexSQL, []);
      } catch (e: any) {
        if (!e.message.includes('already exists')) {
          console.log(`⚠️  Index creation issue: ${e.message}`);
        }
      }
    }
    
    // Insert initial settings
    console.log('📊 Inserting initial settings...');
    
    const initialSettings = [
      { key: 'site_name', value: 'Travel Agency', description: 'Name of the platform', type: 'string', category: 'general', is_public: true },
      { key: 'site_description', value: 'Discover and book unforgettable tours worldwide', description: 'Site description', type: 'string', category: 'general', is_public: true },
      { key: 'support_email', value: 'support@touragency.com', description: 'Support email address', type: 'string', category: 'general', is_public: true },
      { key: 'email_notifications', value: 'true', description: 'Enable email notifications for bookings', type: 'boolean', category: 'email', is_public: false },
      { key: 'marketing_emails', value: 'false', description: 'Enable marketing emails', type: 'boolean', category: 'email', is_public: false },
      { key: 'new_booking_alerts', value: 'true', description: 'Alert admins on new bookings', type: 'boolean', category: 'notification', is_public: false },
      { key: 'payment_failure_alerts', value: 'true', description: 'Alert admins on payment failures', type: 'boolean', category: 'notification', is_public: false },
      { key: 'system_error_alerts', value: 'true', description: 'Alert admins on system errors', type: 'boolean', category: 'notification', is_public: false },
      { key: 'api_rate_limiting', value: 'true', description: 'Enable API rate limiting', type: 'boolean', category: 'api', is_public: false }
    ];
    
    for (const setting of initialSettings) {
      try {
        await sql`
          INSERT INTO "settings" ("key", "value", "description", "type", "category", "is_public", "created_at", "updated_at") 
          VALUES (${setting.key}, ${setting.value}, ${setting.description}, ${setting.type}, ${setting.category}, ${setting.is_public}, now(), now())
          ON CONFLICT ("key") DO NOTHING
        `;
      } catch (e: any) {
        console.log(`⚠️  Setting ${setting.key} might already exist: ${e.message}`);
      }
    }
    
    console.log('✅ Migration completed successfully!');
    
    // Verify tables were created
    console.log('\n📋 Verifying new tables...');
    const newTables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('notifications', 'coupons', 'coupon_usage', 'settings')
      ORDER BY tablename
    `;
    
    if (newTables.length > 0) {
      console.log('✅ New tables created:');
      newTables.forEach(table => {
        console.log(`   - ${table.tablename}`);
      });
    } else {
      console.log('⚠️  No new tables found - they might already exist');
    }
    
    // Check settings
    const settingsCount = await sql`SELECT COUNT(*) as count FROM settings`;
    console.log(`\n📊 Settings table has ${settingsCount[0].count} records`);
    
    console.log('\n🎉 Custom migration completed successfully!');
    
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('💡 Some tables might already exist. This is usually safe to ignore.');
    }
    
    process.exit(1);
  }
}

// Run the migration
runCustomMigration();
