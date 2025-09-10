import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tours } from '@/lib/db/schema';
import { eq, and, gte, lte, like, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const difficulty = searchParams.get('difficulty');
    const location = searchParams.get('location');
    const featured = searchParams.get('featured');

    let query = db.select().from(tours);
    const conditions = [];

    // Search filter
    if (search) {
      conditions.push(
        or(
          like(tours.title, `%${search}%`),
          like(tours.description, `%${search}%`),
          like(tours.location, `%${search}%`)
        )
      );
    }

    // Price filter
    if (minPrice) {
      conditions.push(gte(tours.price, minPrice));
    }
    if (maxPrice) {
      conditions.push(lte(tours.price, maxPrice));
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'all') {
      conditions.push(eq(tours.difficulty, difficulty));
    }

    // Location filter
    if (location && location !== 'all') {
      conditions.push(like(tours.location, `%${location}%`));
    }

    // Featured filter
    if (featured === 'true') {
      conditions.push(eq(tours.featured, true));
    }

    // Apply conditions if any
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching tours:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tours' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newTour = await db.insert(tours).values({
      title: body.title,
      description: body.description,
      price: body.price,
      duration: body.duration,
      maxGroupSize: body.maxGroupSize,
      difficulty: body.difficulty,
      location: body.location,
      startDates: body.startDates,
      images: body.images,
      included: body.included,
      notIncluded: body.notIncluded,
      itinerary: body.itinerary,
      featured: body.featured || false,
    }).returning();

    return NextResponse.json(newTour[0], { status: 201 });
  } catch (error) {
    console.error('Error creating tour:', error);
    return NextResponse.json(
      { error: 'Failed to create tour' },
      { status: 500 }
    );
  }
}
