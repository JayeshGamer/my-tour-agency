// This file provides compatibility for API routes expecting Prisma
// Since this project uses Drizzle ORM, we'll export the db instance as prisma for compatibility

import { db } from './db';

// Export db as prisma for compatibility with existing API routes
export const prisma = db;
export { db };
export default db;
