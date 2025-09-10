import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from 'dotenv';
import { migrate } from 'drizzle-orm/neon-http/migrator';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function setupDatabase() {
  console.log('🔧 Database Setup Script');
  console.log('========================\n');

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env.local');
    console.log('\nPlease ensure your .env.local file contains:');
    console.log('DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"');
    process.exit(1);
  }

  console.log('✅ DATABASE_URL found');
  
  // Mask the connection string for security
  const maskedUrl = process.env.DATABASE_URL.replace(
    /postgresql:\/\/([^:]+):([^@]+)@/,
    'postgresql://***:***@'
  );
  console.log(`📍 Connecting to: ${maskedUrl}\n`);

  try {
    // Test connection
    console.log('🔌 Testing database connection...');
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);
    
    // Try a simple query
    const result = await sql`SELECT current_database(), current_user, version()`;
    console.log('✅ Connection successful!');
    console.log(`📊 Database: ${result[0].current_database}`);
    console.log(`👤 User: ${result[0].current_user}\n`);
    
    // Check existing tables first
    console.log('📋 Checking existing tables...');
    const existingTables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `;
    
    if (existingTables.length > 0) {
      console.log('Found existing tables:');
      existingTables.forEach(table => {
        console.log(`   - ${table.tablename}`);
      });
    } else {
      console.log('No existing tables found.\n');
    }
    
    // Run migrations
    console.log('\n🚀 Running migrations...');
    try {
      await migrate(db, { migrationsFolder: './lib/db/migrations' });
      console.log('✅ Migrations completed successfully!\n');
    } catch (migrationError: any) {
      if (migrationError.message.includes('already exists')) {
        console.log('⚠️  Some tables already exist. Attempting to continue...\n');
      } else {
        throw migrationError;
      }
    }
    
    // Verify tables were created
    console.log('📋 Verifying tables...');
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `;
    
    console.log('✅ Tables created:');
    tables.forEach(table => {
      console.log(`   - ${table.tablename}`);
    });
    
    console.log('\n🎉 Database setup completed successfully!');
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 'ETIMEDOUT') {
      console.log('\n🔍 Connection timeout. Possible causes:');
      console.log('   1. Database server is not running');
      console.log('   2. Network connectivity issues');
      console.log('   3. Incorrect host/port in DATABASE_URL');
      console.log('   4. Firewall blocking the connection');
      console.log('   5. Database is paused (if using Neon free tier)');
      console.log('\n💡 If using Neon:');
      console.log('   - Check if your database is active at https://console.neon.tech');
      console.log('   - Ensure the database is not paused');
      console.log('   - Verify the connection string is correct');
    } else if (error.message.includes('password authentication failed')) {
      console.log('\n🔐 Authentication failed. Please check:');
      console.log('   - Username and password in DATABASE_URL');
      console.log('   - Database user permissions');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('\n📁 Database does not exist. Please:');
      console.log('   - Create the database first');
      console.log('   - Verify the database name in DATABASE_URL');
    }
    
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
