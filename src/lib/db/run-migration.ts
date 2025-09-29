import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function runMigration() {
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    console.log('Running migration to add Better Auth required fields...');
    
    // Add missing columns to the accounts table
    await sql`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS id_token text`;
    await sql`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS access_token_expires_at timestamp`;
    await sql`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS refresh_token_expires_at timestamp`;
    await sql`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS scope text`;
    
    // Also add the ip_address and user_agent columns to sessions table if they don't exist
    await sql`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ip_address text`;
    await sql`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_agent text`;
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
