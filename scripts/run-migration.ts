import * as dotenv from 'dotenv';
import { sql } from 'drizzle-orm';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  console.log('Please check your .env.local file and ensure DATABASE_URL is configured.');
  process.exit(1);
}

// Initialize database connection
const sql_client = neon(process.env.DATABASE_URL);
const db = drizzle(sql_client);

async function runLatestMigration() {
  try {
    console.log('🔄 Running latest migration...');
    
    // Create the review_status enum if it doesn't exist
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE review_status AS ENUM('pending', 'approved', 'rejected');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    // Create contact_submissions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        name varchar(255) NOT NULL,
        email varchar(255) NOT NULL,
        phone varchar(50),
        subject varchar(500) NOT NULL,
        message text NOT NULL,
        inquiry_type varchar(50) NOT NULL,
        status varchar(50) DEFAULT 'new' NOT NULL,
        priority varchar(20) DEFAULT 'normal' NOT NULL,
        ip_address varchar(45),
        user_agent text,
        responded_at timestamp,
        resolved_at timestamp,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `);
    
    // Create system_logs table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS system_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        type varchar(50) NOT NULL,
        message text NOT NULL,
        metadata json,
        user_id uuid,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);
    
    // Create admin_logs table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        admin_id uuid NOT NULL,
        action text NOT NULL,
        affected_entity varchar(100) NOT NULL,
        entity_id uuid NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);
    
    // Add status column to reviews table if it doesn't exist
    await db.execute(sql`
      DO $$ BEGIN
        ALTER TABLE reviews ADD COLUMN status review_status DEFAULT 'pending' NOT NULL;
      EXCEPTION
        WHEN duplicate_column THEN null;
      END $$;
    `);
    
    // Create indexes for contact_submissions
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS contact_submissions_email_idx ON contact_submissions USING btree (email);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS contact_submissions_status_idx ON contact_submissions USING btree (status);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS contact_submissions_inquiry_type_idx ON contact_submissions USING btree (inquiry_type);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS contact_submissions_created_at_idx ON contact_submissions USING btree (created_at);
    `);
    
    // Create index for reviews status
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS reviews_status_idx ON reviews USING btree (status);
    `);
    
    // Create indexes for system_logs
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS system_logs_type_idx ON system_logs USING btree (type);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS system_logs_created_at_idx ON system_logs USING btree (created_at);
    `);
    
    // Create indexes for admin_logs
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS admin_logs_admin_id_idx ON admin_logs USING btree (admin_id);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS admin_logs_entity_idx ON admin_logs USING btree (affected_entity, entity_id);
    `);
    
    // Add foreign key constraints if they don't exist
    await db.execute(sql`
      DO $$ BEGIN
        ALTER TABLE admin_logs ADD CONSTRAINT admin_logs_admin_id_users_id_fk 
          FOREIGN KEY (admin_id) REFERENCES users(id);
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await db.execute(sql`
      DO $$ BEGIN
        ALTER TABLE system_logs ADD CONSTRAINT system_logs_user_id_users_id_fk 
          FOREIGN KEY (user_id) REFERENCES users(id);
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    console.log('✅ Migration completed successfully!');
    console.log('📋 Tables created/updated:');
    console.log('  - contact_submissions (new)');
    console.log('  - system_logs (new)');
    console.log('  - admin_logs (new)');
    console.log('  - reviews (added status column)');
    console.log('  - Added indexes and foreign keys');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runLatestMigration().then(() => {
  console.log('🎉 All done!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
