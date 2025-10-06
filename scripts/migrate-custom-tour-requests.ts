import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;
const sql = neon(connectionString);
const db = drizzle(sql);

async function migrateCustomTourRequests() {
  try {
    console.log('🚀 Starting custom tour requests migration...');

    // Create new enums
    console.log('Creating new enums...');
    await sql`
      DO $$ BEGIN
        CREATE TYPE request_status AS ENUM ('submitted', 'under_review', 'quoted', 'approved', 'rejected', 'converted_to_booking');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE request_priority AS ENUM ('low', 'normal', 'high', 'urgent');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE accommodation_level AS ENUM ('budget', 'mid-range', 'luxury');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE transportation_type AS ENUM ('flight', 'train', 'car', 'mixed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Create custom_tour_requests table
    console.log('Creating custom_tour_requests table...');
    await sql`
      CREATE TABLE IF NOT EXISTS custom_tour_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        
        -- Travel Requirements
        destination TEXT NOT NULL,
        preferred_dates JSONB,
        alternative_dates JSONB,
        group_size INTEGER NOT NULL,
        group_composition JSONB NOT NULL,
        budget_range JSONB NOT NULL,
        
        -- Preferences
        accommodation_preference accommodation_level,
        activity_preferences JSONB,
        transportation_preference transportation_type,
        meal_preferences JSONB,
        special_requirements TEXT,
        
        -- Request Status
        status request_status DEFAULT 'submitted' NOT NULL,
        priority request_priority DEFAULT 'normal' NOT NULL,
        
        -- Admin Notes & Quote
        admin_notes TEXT,
        quote_details JSONB,
        quoted_at TIMESTAMP,
        quoted_by UUID REFERENCES users(id),
        
        -- Additional Details
        special_occasion TEXT,
        previous_travel_experience TEXT,
        preferred_contact_method VARCHAR(50),
        best_time_to_contact VARCHAR(100),
        additional_notes TEXT,
        
        -- Tracking
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        reviewed_at TIMESTAMP,
        reviewed_by UUID REFERENCES users(id)
      );
    `;

    // Create indexes for custom_tour_requests
    console.log('Creating indexes for custom_tour_requests...');
    await sql`CREATE INDEX IF NOT EXISTS custom_tour_requests_user_id_idx ON custom_tour_requests(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS custom_tour_requests_status_idx ON custom_tour_requests(status);`;
    await sql`CREATE INDEX IF NOT EXISTS custom_tour_requests_destination_idx ON custom_tour_requests(destination);`;
    await sql`CREATE INDEX IF NOT EXISTS custom_tour_requests_quoted_by_idx ON custom_tour_requests(quoted_by);`;

    // Create tour_request_communications table
    console.log('Creating tour_request_communications table...');
    await sql`
      CREATE TABLE IF NOT EXISTS tour_request_communications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        request_id UUID NOT NULL REFERENCES custom_tour_requests(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES users(id),
        message TEXT NOT NULL,
        is_internal BOOLEAN DEFAULT false NOT NULL,
        attachments JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // Create indexes for tour_request_communications
    console.log('Creating indexes for tour_request_communications...');
    await sql`CREATE INDEX IF NOT EXISTS tour_request_communications_request_id_idx ON tour_request_communications(request_id);`;
    await sql`CREATE INDEX IF NOT EXISTS tour_request_communications_sender_id_idx ON tour_request_communications(sender_id);`;

    // Add new columns to existing tours table
    console.log('Modifying tours table...');
    await sql`ALTER TABLE tours ADD COLUMN IF NOT EXISTS tour_type VARCHAR(50) DEFAULT 'standard' NOT NULL;`;
    await sql`ALTER TABLE tours ADD COLUMN IF NOT EXISTS source_request_id UUID REFERENCES custom_tour_requests(id);`;
    await sql`CREATE INDEX IF NOT EXISTS tours_tour_type_idx ON tours(tour_type);`;

    // Add new columns to existing bookings table
    console.log('Modifying bookings table...');
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_source VARCHAR(50) DEFAULT 'direct' NOT NULL;`;
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS source_request_id UUID REFERENCES custom_tour_requests(id);`;
    await sql`CREATE INDEX IF NOT EXISTS bookings_source_request_id_idx ON bookings(source_request_id);`;

    console.log('✅ Custom tour requests migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateCustomTourRequests()
    .then(() => {
      console.log('Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { migrateCustomTourRequests };
