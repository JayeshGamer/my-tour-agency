import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';

async function createMissingTables() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('🔧 Creating missing tables...\n');
    
    // Create system_logs table
    console.log('Creating system_logs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS system_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        type varchar(50) NOT NULL,
        message text NOT NULL,
        metadata json,
        user_id uuid REFERENCES users(id),
        created_at timestamp DEFAULT now() NOT NULL
      );
    `;
    console.log('✅ system_logs table created');
    
    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS system_logs_type_idx ON system_logs(type)`;
    await sql`CREATE INDEX IF NOT EXISTS system_logs_created_at_idx ON system_logs(created_at)`;
    console.log('✅ Indexes created');
    
    // Create admin_logs table if missing
    console.log('\nCreating admin_logs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_id uuid NOT NULL REFERENCES users(id),
        action text NOT NULL,
        affected_entity varchar(100) NOT NULL,
        entity_id uuid NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `;
    console.log('✅ admin_logs table created');
    
    // Create indexes for admin_logs
    await sql`CREATE INDEX IF NOT EXISTS admin_logs_admin_id_idx ON admin_logs(admin_id)`;
    await sql`CREATE INDEX IF NOT EXISTS admin_logs_entity_idx ON admin_logs(affected_entity, entity_id)`;
    console.log('✅ admin_logs indexes created');
    
    console.log('\n✅ All missing tables created successfully!');
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.detail) {
      console.error('Details:', error.detail);
    }
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the script
createMissingTables();
