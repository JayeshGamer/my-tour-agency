import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function setupAuthTables() {
  console.log('🔧 Better Auth Tables Setup');
  console.log('===========================\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('📋 Creating/updating Better Auth tables...\n');

    // Drop existing tables if needed (be careful with this in production!)
    // Uncomment if you want to reset:
    // await sql`DROP TABLE IF EXISTS sessions CASCADE`;
    // await sql`DROP TABLE IF EXISTS accounts CASCADE`;
    // await sql`DROP TABLE IF EXISTS verifications CASCADE`;
    
    // Check if users table exists
    const userTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'users'
      );
    `;

    if (!userTableExists[0].exists) {
      console.log('Creating users table...');
      await sql`
        CREATE TABLE users (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          email varchar(255) UNIQUE NOT NULL,
          name varchar(255),
          email_verified boolean,
          image text,
          role varchar(50) DEFAULT 'customer' NOT NULL,
          created_at timestamp DEFAULT now() NOT NULL,
          updated_at timestamp DEFAULT now() NOT NULL
        );
      `;
      console.log('✅ Users table created');
    } else {
      console.log('✅ Users table already exists');
      
      // Ensure email_verified column exists (was renamed from password)
      try {
        await sql`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS email_verified boolean;
        `;
        console.log('✅ Ensured email_verified column exists');
      } catch (e) {
        // Column might already exist
      }
    }

    // Create accounts table
    const accountsTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'accounts'
      );
    `;

    if (!accountsTableExists[0].exists) {
      console.log('Creating accounts table...');
      await sql`
        CREATE TABLE accounts (
          id uuid DEFAULT gen_random_uuid() NOT NULL,
          user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          account_id text NOT NULL,
          provider_id text NOT NULL,
          access_token text,
          refresh_token text,
          expires_at timestamp,
          password text,
          created_at timestamp DEFAULT now() NOT NULL,
          updated_at timestamp DEFAULT now() NOT NULL,
          PRIMARY KEY (provider_id, account_id)
        );
      `;
      console.log('✅ Accounts table created');
    } else {
      console.log('✅ Accounts table already exists');
    }

    // Create sessions table
    const sessionsTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'sessions'
      );
    `;

    if (!sessionsTableExists[0].exists) {
      console.log('Creating sessions table...');
      await sql`
        CREATE TABLE sessions (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          expires_at timestamp NOT NULL,
          token text UNIQUE NOT NULL,
          created_at timestamp DEFAULT now() NOT NULL,
          updated_at timestamp DEFAULT now() NOT NULL
        );
      `;
      console.log('✅ Sessions table created');
    } else {
      console.log('✅ Sessions table already exists');
    }

    // Create verifications table
    const verificationsTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'verifications'
      );
    `;

    if (!verificationsTableExists[0].exists) {
      console.log('Creating verifications table...');
      await sql`
        CREATE TABLE verifications (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          identifier text NOT NULL,
          value text NOT NULL,
          expires_at timestamp NOT NULL,
          created_at timestamp DEFAULT now(),
          updated_at timestamp DEFAULT now()
        );
      `;
      console.log('✅ Verifications table created');
    } else {
      console.log('✅ Verifications table already exists');
    }

    // Create other application tables if they don't exist
    const toursTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'tours'
      );
    `;

    if (!toursTableExists[0].exists) {
      console.log('Creating tours table...');
      await sql`
        CREATE TABLE tours (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          title varchar(255) NOT NULL,
          description text NOT NULL,
          price numeric(10, 2) NOT NULL,
          duration integer NOT NULL,
          max_group_size integer NOT NULL,
          difficulty varchar(50) NOT NULL,
          location varchar(255) NOT NULL,
          start_dates json NOT NULL,
          images json NOT NULL,
          included json NOT NULL,
          not_included json NOT NULL,
          itinerary json NOT NULL,
          featured boolean DEFAULT false NOT NULL,
          created_at timestamp DEFAULT now() NOT NULL,
          updated_at timestamp DEFAULT now() NOT NULL
        );
      `;
      console.log('✅ Tours table created');
    } else {
      console.log('✅ Tours table already exists');
    }

    // Create bookings table
    const bookingsTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'bookings'
      );
    `;

    if (!bookingsTableExists[0].exists) {
      console.log('Creating bookings table...');
      await sql`
        CREATE TABLE bookings (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL REFERENCES users(id),
          tour_id uuid NOT NULL REFERENCES tours(id),
          start_date timestamp NOT NULL,
          number_of_people integer NOT NULL,
          total_price numeric(10, 2) NOT NULL,
          status varchar(50) DEFAULT 'pending' NOT NULL,
          payment_intent_id varchar(255),
          created_at timestamp DEFAULT now() NOT NULL,
          updated_at timestamp DEFAULT now() NOT NULL
        );
      `;
      console.log('✅ Bookings table created');
    } else {
      console.log('✅ Bookings table already exists');
    }

    // Create reviews table
    const reviewsTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'reviews'
      );
    `;

    if (!reviewsTableExists[0].exists) {
      console.log('Creating reviews table...');
      await sql`
        CREATE TABLE reviews (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL REFERENCES users(id),
          tour_id uuid NOT NULL REFERENCES tours(id),
          booking_id uuid REFERENCES bookings(id),
          rating integer NOT NULL,
          title varchar(255) NOT NULL,
          comment text NOT NULL,
          created_at timestamp DEFAULT now() NOT NULL,
          updated_at timestamp DEFAULT now() NOT NULL
        );
      `;
      console.log('✅ Reviews table created');
    } else {
      console.log('✅ Reviews table already exists');
    }

    // Create wishlists table
    const wishlistsTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'wishlists'
      );
    `;

    if (!wishlistsTableExists[0].exists) {
      console.log('Creating wishlists table...');
      await sql`
        CREATE TABLE wishlists (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL REFERENCES users(id),
          tour_id uuid NOT NULL REFERENCES tours(id),
          created_at timestamp DEFAULT now() NOT NULL
        );
      `;
      console.log('✅ Wishlists table created');
    } else {
      console.log('✅ Wishlists table already exists');
    }

    console.log('\n📋 Final table verification...');
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `;
    
    console.log('\n✅ All tables in database:');
    tables.forEach(table => {
      console.log(`   - ${table.tablename}`);
    });
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('You can now run your application with: npm run dev');
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.detail) {
      console.error('Details:', error.detail);
    }
    process.exit(1);
  }
}

// Run the setup
setupAuthTables();
