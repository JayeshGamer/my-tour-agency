import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tours } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get only tours created by the current user
    const userTours = await db
      .select()
      .from(tours)
      .where(eq(tours.createdBy, session.user.id))
      .orderBy(desc(tours.createdAt));

    // Transform the data to match the expected format
    const transformedTours = userTours.map((tour) => ({
      id: tour.id,
      name: tour.name,
      title: tour.title,
      location: tour.location,
      duration: tour.duration,
      pricePerPerson: tour.pricePerPerson,
      status: tour.status,
      category: tour.category,
      difficulty: tour.difficulty,
      maxGroupSize: tour.maxGroupSize,
      createdAt: tour.createdAt,
      updatedAt: tour.updatedAt,
    }));

    return NextResponse.json(transformedTours);
  } catch (error) {
    console.error('Error fetching user tours:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tours' },
      { status: 500 }
    );
  }
}
