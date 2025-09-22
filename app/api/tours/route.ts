import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tours } from '@/lib/db/schema';
import { eq, and, gte, lte, like, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const difficulty = searchParams.get('difficulty');
    const location = searchParams.get('location');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const conditions = [];

    // Only get active tours
    conditions.push(eq(tours.status, 'Active'));

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

    // Price filter (using pricePerPerson as per schema)
    if (minPrice) {
      conditions.push(gte(tours.pricePerPerson, minPrice));
    }
    if (maxPrice) {
      conditions.push(lte(tours.pricePerPerson, maxPrice));
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

    // Execute optimized query with pagination and ordering
    const result = await db
      .select({
        id: tours.id,
        title: tours.title,
        name: tours.name,
        description: tours.description,
        price: tours.pricePerPerson, // Map to frontend expected field
        pricePerPerson: tours.pricePerPerson,
        duration: tours.duration,
        maxGroupSize: tours.maxGroupSize,
        difficulty: tours.difficulty,
        location: tours.location,
        category: tours.category,
        startDates: tours.startDates,
        images: tours.images,
        imageUrl: tours.imageUrl,
        included: tours.included,
        notIncluded: tours.notIncluded,
        itinerary: tours.itinerary,
        featured: tours.featured,
        status: tours.status,
        createdAt: tours.createdAt,
        updatedAt: tours.updatedAt,
      })
      .from(tours)
      .where(and(...conditions))
      .orderBy(desc(tours.featured), desc(tours.createdAt))
      .limit(limit)
      .offset(offset);

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
      name: body.name || body.title, // Required field
      title: body.title,
      description: body.description,
      pricePerPerson: body.pricePerPerson || body.price, // Required field  
      price: body.pricePerPerson || body.price, // Keep for compatibility
      duration: body.duration,
      maxGroupSize: body.maxGroupSize,
      difficulty: body.difficulty,
      location: body.location,
      category: body.category || 'Adventure', // Required field
      startDates: body.startDates || [],
      images: body.images || [],
      imageUrl: body.imageUrl,
      included: body.included || [],
      notIncluded: body.notIncluded || [],
      itinerary: body.itinerary || [],
      featured: body.featured || false,
      status: 'Active', // Default status
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
