import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function addCreatedByColumn() {
  try {
    console.log('🔄 Adding created_by column to tours table...');
    
    // Check if column already exists
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='tours' AND column_name='created_by'
    `;
    
    if (checkColumn.length > 0) {
      console.log('✅ Column created_by already exists');
      return;
    }
    
    // Add the created_by column
    await sql`ALTER TABLE tours ADD COLUMN created_by uuid`;
    console.log('✅ Added created_by column');
    
    // Add foreign key constraint
    await sql`
      ALTER TABLE tours 
      ADD CONSTRAINT tours_created_by_users_id_fk 
      FOREIGN KEY (created_by) 
      REFERENCES users(id) 
      ON DELETE SET NULL
      ON UPDATE CASCADE
    `;
    console.log('✅ Added foreign key constraint');
    
    // Add index
    await sql`CREATE INDEX IF NOT EXISTS tours_created_by_idx ON tours USING btree (created_by)`;
    console.log('✅ Added index on created_by');
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

addCreatedByColumn()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));