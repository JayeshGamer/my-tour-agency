import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function migratePaymentSchema() {
  try {
    console.log('🔄 Starting payment schema migration...');

    // Add payment status enum if it doesn't exist
    await sql`
      DO $$ BEGIN
        CREATE TYPE payment_status AS ENUM ('Pending', 'Paid', 'Failed', 'Refunded');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    console.log('✅ Payment status enum created/verified');

    // Add payment-related columns to bookings table
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT 'Pending' NOT NULL,
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
      ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255),
      ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS traveler_info JSONB;
    `;
    console.log('✅ Payment columns added to bookings table');

    // Create index on payment_status for better query performance
    await sql`
      CREATE INDEX IF NOT EXISTS bookings_payment_status_idx 
      ON bookings(payment_status);
    `;
    console.log('✅ Payment status index created');

    // Remove the old paymentIntentId column if it exists
    await sql`
      ALTER TABLE bookings 
      DROP COLUMN IF EXISTS payment_intent_id;
    `;
    console.log('✅ Old payment_intent_id column removed');

    console.log('🎉 Payment schema migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migratePaymentSchema();