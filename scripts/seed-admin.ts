import * as dotenv from 'dotenv';
// Load environment variables FIRST
dotenv.config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import * as bcrypt from 'bcryptjs';

async function seedAdmin() {
  console.log('🔧 Creating Admin User with Better Auth');
  console.log('========================================\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // First, check if admin user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = 'admin@travelagency.com'
    `;

    let userId: string;

    if (existingUser.length > 0) {
      userId = existingUser[0].id;
      console.log('✅ Admin user already exists in users table');
    } else {
      // Create admin user
      console.log('Creating admin user...');
      const newUser = await sql`
        INSERT INTO users (
          id, 
          email, 
          first_name, 
          last_name, 
          name, 
          role, 
          email_verified,
          created_at,
          updated_at
        )
        VALUES (
          gen_random_uuid(),
          'admin@travelagency.com',
          'Admin',
          'User',
          'Admin User',
          'Admin',
          true,
          now(),
          now()
        )
        RETURNING id
      `;
      userId = newUser[0].id;
      console.log('✅ Admin user created in users table');
    }

    // Check if account already exists for this user
    const existingAccount = await sql`
      SELECT id FROM accounts 
      WHERE user_id = ${userId} 
      AND provider_id = 'credential'
    `;

    if (existingAccount.length > 0) {
      // Update existing account with new password
      console.log('Updating admin password in accounts table...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await sql`
        UPDATE accounts 
        SET 
          password = ${hashedPassword},
          updated_at = now()
        WHERE user_id = ${userId} 
        AND provider_id = 'credential'
      `;
      console.log('✅ Admin password updated');
    } else {
      // Create new account entry for credential provider
      console.log('Creating admin account entry for Better Auth...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await sql`
        INSERT INTO accounts (
          id,
          user_id,
          account_id,
          provider_id,
          password,
          created_at,
          updated_at
        )
        VALUES (
          gen_random_uuid(),
          ${userId},
          'admin@travelagency.com',
          'credential',
          ${hashedPassword},
          now(),
          now()
        )
      `;
      console.log('✅ Admin account created in accounts table');
    }

    // Create demo regular users as well
    console.log('\nCreating demo regular users...');
    const demoUsers = [
      {
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        password: 'password123',
        role: 'User'
      },
      {
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        name: 'Jane Smith',
        password: 'password123',
        role: 'User'
      }
    ];

    for (const user of demoUsers) {
      // Check if user exists
      const existing = await sql`
        SELECT id FROM users WHERE email = ${user.email}
      `;

      let userIdDemo: string;

      if (existing.length > 0) {
        userIdDemo = existing[0].id;
        console.log(`✅ User ${user.email} already exists`);
      } else {
        // Create user
        const newUser = await sql`
          INSERT INTO users (
            id, 
            email, 
            first_name, 
            last_name, 
            name, 
            role, 
            email_verified,
            created_at,
            updated_at
          )
          VALUES (
            gen_random_uuid(),
            ${user.email},
            ${user.firstName},
            ${user.lastName},
            ${user.name},
            ${user.role},
            true,
            now(),
            now()
          )
          RETURNING id
        `;
        userIdDemo = newUser[0].id;
        console.log(`✅ User ${user.email} created`);
      }

      // Check if account exists
      const existingAcc = await sql`
        SELECT id FROM accounts 
        WHERE user_id = ${userIdDemo} 
        AND provider_id = 'credential'
      `;

      if (existingAcc.length === 0) {
        // Create account
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        await sql`
          INSERT INTO accounts (
            id,
            user_id,
            account_id,
            provider_id,
            password,
            created_at,
            updated_at
          )
          VALUES (
            gen_random_uuid(),
            ${userIdDemo},
            ${user.email},
            'credential',
            ${hashedPassword},
            now(),
            now()
          )
        `;
        console.log(`✅ Account created for ${user.email}`);
      } else {
        // Update password
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await sql`
          UPDATE accounts 
          SET 
            password = ${hashedPassword},
            updated_at = now()
          WHERE user_id = ${userIdDemo} 
          AND provider_id = 'credential'
        `;
        console.log(`✅ Password updated for ${user.email}`);
      }
    }

    console.log('\n🎉 User setup completed successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('=====================================');
    console.log('Admin: admin@travelagency.com / admin123');
    console.log('User: john.doe@example.com / password123');
    console.log('User: jane.smith@example.com / password123');
    console.log('=====================================\n');
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.detail) {
      console.error('Details:', error.detail);
    }
    process.exit(1);
  }
}

// Run the setup
seedAdmin();
