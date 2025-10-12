import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';

async function checkTours() {
  const sql = neon(process.env.DATABASE_URL!);
  
  const tours = await sql`
    SELECT id, name, title 
    FROM tours 
    LIMIT 10
  `;
  
  console.log('Tours in database:');
  tours.forEach(tour => {
    console.log(`- ID: ${tour.id}, Name: ${tour.name}`);
  });
}

checkTours();
