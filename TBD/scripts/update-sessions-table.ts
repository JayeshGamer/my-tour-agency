import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function updateSessionsTable() {
  console.log('🔧 Updating Sessions Table');
  console.log('==========================\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Add missing columns to sessions table
    console.log('Adding missing columns to sessions table...');
    
    // Add ip_address column if it doesn't exist
    await sql`
      ALTER TABLE sessions 
      ADD COLUMN IF NOT EXISTS ip_address text;
    `;
    console.log('✅ Added ip_address column');
    
    // Add user_agent column if it doesn't exist
    await sql`
      ALTER TABLE sessions 
      ADD COLUMN IF NOT EXISTS user_agent text;
    `;
    console.log('✅ Added user_agent column');
    
    // Verify the columns were added
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'sessions' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 Sessions table columns:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    
    console.log('\n🎉 Sessions table updated successfully!');
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.detail) {
      console.error('Details:', error.detail);
    }
    process.exit(1);
  }
}

// Run the update
updateSessionsTable();
