import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tours, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userRow = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
    const isAdmin = userRow[0]?.role === 'Admin';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch all tours for admin review with creator information
    const allTours = await db
      .select({
        id: tours.id,
        name: tours.name,
        title: tours.title,
        description: tours.description,
        location: tours.location,
        duration: tours.duration,
        pricePerPerson: tours.pricePerPerson,
        status: tours.status,
        category: tours.category,
        difficulty: tours.difficulty,
        maxGroupSize: tours.maxGroupSize,
        startDates: tours.startDates,
        included: tours.included,
        notIncluded: tours.notIncluded,
        createdAt: tours.createdAt,
        createdBy: tours.createdBy,
        createdByName: users.name,
        createdByEmail: users.email,
      })
      .from(tours)
      .leftJoin(users, eq(tours.createdBy, users.id))
      .orderBy(desc(tours.createdAt));

    return NextResponse.json(allTours);
  } catch (error) {
    console.error('Error fetching tours for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tours' },
      { status: 500 }
    );
  }
}
