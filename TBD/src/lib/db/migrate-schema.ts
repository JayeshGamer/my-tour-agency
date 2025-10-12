import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function migrateSchema() {
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    console.log('🚀 Starting schema migration...');
    
    // Create enums if they don't exist
    console.log('Creating enums...');
    await sql`
      DO $$ BEGIN
        CREATE TYPE tour_status AS ENUM ('Active', 'Inactive');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    
    await sql`
      DO $$ BEGIN
        CREATE TYPE booking_status AS ENUM ('Pending', 'Confirmed', 'Canceled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    
    await sql`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('User', 'Admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    
    // Add new columns to users table if they don't exist
    console.log('Updating users table...');
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(255)`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(255)`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`;
    
    // Update role column to use enum (be careful with existing data)
    await sql`
      DO $$
      BEGIN
        -- Only try to alter if column type is not already user_role
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' 
          AND column_name = 'role' 
          AND udt_name = 'user_role'
        ) THEN
          -- First, update existing values to match enum values
          UPDATE users SET role = 'User' WHERE role = 'customer' OR role IS NULL;
          UPDATE users SET role = 'Admin' WHERE role = 'admin';
          
          -- Drop the default constraint temporarily
          ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
          
          -- Change the column type
          ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::user_role;
          
          -- Add the default back
          ALTER TABLE users ALTER COLUMN role SET DEFAULT 'User'::user_role;
        END IF;
      END $$;
    `;
    
    // Add new columns to tours table if they don't exist
    console.log('Updating tours table...');
    await sql`ALTER TABLE tours ADD COLUMN IF NOT EXISTS name VARCHAR(255)`;
    await sql`ALTER TABLE tours ADD COLUMN IF NOT EXISTS price_per_person DECIMAL(10, 2)`;
    await sql`ALTER TABLE tours ADD COLUMN IF NOT EXISTS category VARCHAR(100)`;
    await sql`ALTER TABLE tours ADD COLUMN IF NOT EXISTS image_url TEXT`;
    await sql`ALTER TABLE tours ADD COLUMN IF NOT EXISTS status tour_status DEFAULT 'Active'`;
    
    // Update existing data to ensure required fields have values
    await sql`UPDATE tours SET name = title WHERE name IS NULL`;
    await sql`UPDATE tours SET price_per_person = price WHERE price_per_person IS NULL`;
    await sql`UPDATE tours SET category = difficulty WHERE category IS NULL`;
    
    // Add indexes on tours table
    console.log('Creating indexes on tours table...');
    await sql`CREATE INDEX IF NOT EXISTS tours_category_idx ON tours(category)`;
    await sql`CREATE INDEX IF NOT EXISTS tours_location_idx ON tours(location)`;
    await sql`CREATE INDEX IF NOT EXISTS tours_status_idx ON tours(status)`;
    
    // Add new columns to bookings table if they don't exist
    console.log('Updating bookings table...');
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_date TIMESTAMP DEFAULT NOW()`;
    
    // Update status column to use enum
    await sql`
      DO $$
      BEGIN
        -- Only try to alter if column type is not already booking_status
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'bookings' 
          AND column_name = 'status' 
          AND udt_name = 'booking_status'
        ) THEN
          -- Update existing values to match enum values
          UPDATE bookings SET status = 'Pending' WHERE LOWER(status) = 'pending' OR status IS NULL;
          UPDATE bookings SET status = 'Confirmed' WHERE LOWER(status) = 'confirmed';
          UPDATE bookings SET status = 'Canceled' WHERE LOWER(status) IN ('canceled', 'cancelled');
          
          -- Drop the default constraint temporarily
          ALTER TABLE bookings ALTER COLUMN status DROP DEFAULT;
          
          -- Change the column type
          ALTER TABLE bookings ALTER COLUMN status TYPE booking_status USING status::booking_status;
          
          -- Add the default back
          ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'Pending'::booking_status;
        END IF;
      END $$;
    `;
    
    // Add indexes on bookings table
    console.log('Creating indexes on bookings table...');
    await sql`CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON bookings(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS bookings_tour_id_idx ON bookings(tour_id)`;
    await sql`CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status)`;
    
    // Add indexes on reviews table
    console.log('Creating indexes on reviews table...');
    await sql`CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON reviews(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS reviews_tour_id_idx ON reviews(tour_id)`;
    await sql`CREATE INDEX IF NOT EXISTS reviews_rating_idx ON reviews(rating)`;
    
    // Create admin_logs table if it doesn't exist
    console.log('Creating admin_logs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        admin_id UUID NOT NULL REFERENCES users(id),
        action TEXT NOT NULL,
        affected_entity VARCHAR(100) NOT NULL,
        entity_id UUID NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    // Add indexes on admin_logs table
    await sql`CREATE INDEX IF NOT EXISTS admin_logs_admin_id_idx ON admin_logs(admin_id)`;
    await sql`CREATE INDEX IF NOT EXISTS admin_logs_entity_idx ON admin_logs(affected_entity, entity_id)`;
    
    // Add index on users email if not exists
    console.log('Creating index on users email...');
    await sql`CREATE INDEX IF NOT EXISTS users_email_idx ON users(email)`;
    
    console.log('✅ Schema migration completed successfully!');
    
    // Display current table information
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('\n📊 Current tables in database:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateSchema();
