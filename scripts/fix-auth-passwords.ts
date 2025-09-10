import * as dotenv from 'dotenv';
// Load environment variables FIRST
dotenv.config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as bcrypt from 'bcryptjs';
import * as schema from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function fixAuthPasswords() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });
  
  try {
    console.log('🔧 Fixing Better Auth password setup...\n');
    
    // Define users with their passwords
    const usersWithPasswords = [
      { email: 'admin@travelagency.com', password: 'admin123' },
      { email: 'john.doe@example.com', password: 'password123' },
      { email: 'jane.smith@example.com', password: 'password123' },
      { email: 'mike.wilson@example.com', password: 'password123' },
      { email: 'sarah.johnson@example.com', password: 'password123' },
    ];
    
    for (const userData of usersWithPasswords) {
      console.log(`Processing ${userData.email}...`);
      
      // Find the user
      const users = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, userData.email));
      
      if (users.length === 0) {
        console.log(`  ⚠️  User not found, skipping...`);
        continue;
      }
      
      const user = users[0];
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Check if a credential account already exists
      const existingAccounts = await db
        .select()
        .from(schema.accounts)
        .where(eq(schema.accounts.userId, user.id))
        .where(eq(schema.accounts.providerId, 'credential'));
      
      if (existingAccounts.length > 0) {
        // Update existing account
        await db
          .update(schema.accounts)
          .set({
            password: hashedPassword,
            updatedAt: new Date(),
          })
          .where(eq(schema.accounts.id, existingAccounts[0].id));
        console.log(`  ✅ Updated password for existing credential account`);
      } else {
        // Create new credential account
        await db.insert(schema.accounts).values({
          userId: user.id,
          accountId: user.email,
          providerId: 'credential',
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`  ✅ Created new credential account with password`);
      }
    }
    
    console.log('\n✅ Password fix completed successfully!');
    console.log('\n📋 Users can now log in with:');
    console.log('   Admin: admin@travelagency.com / admin123');
    console.log('   Users: john.doe@example.com / password123');
    console.log('          jane.smith@example.com / password123');
    console.log('          mike.wilson@example.com / password123');
    console.log('          sarah.johnson@example.com / password123');
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.detail) {
      console.error('Details:', error.detail);
    }
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the fix
fixAuthPasswords();
