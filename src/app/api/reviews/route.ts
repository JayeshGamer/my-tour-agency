import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reviews, tours, users, bookings, adminLogs } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// GET /api/reviews - Fetch reviews (public for reading, filtered by tour if specified)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tourId = searchParams.get('tourId');
    const userId = searchParams.get('userId');

    // Build query
    const query = db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        title: reviews.title,
        createdAt: reviews.createdAt,
        tour: {
          id: tours.id,
          name: tours.name,
          location: tours.location,
        },
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(reviews)
      .leftJoin(tours, eq(reviews.tourId, tours.id))
      .leftJoin(users, eq(reviews.userId, users.id))
      .orderBy(desc(reviews.createdAt));

    // Apply filters
    let result;
    if (tourId && userId) {
      result = await query.where(and(eq(reviews.tourId, tourId), eq(reviews.userId, userId)));
    } else if (tourId) {
      result = await query.where(eq(reviews.tourId, tourId));
    } else if (userId) {
      result = await query.where(eq(reviews.userId, userId));
    } else {
      result = await query;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a review (authenticated users only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tourId, rating, comment, title, bookingId } = body;

    // Validate required fields
    if (!tourId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields (tourId, rating, comment)' },
        { status: 400 }
      );
    }

    // Validate rating range (1-5)
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Verify tour exists
    const tour = await db
      .select()
      .from(tours)
      .where(eq(tours.id, tourId))
      .limit(1);

    if (!tour[0]) {
      return NextResponse.json(
        { error: 'Tour not found' },
        { status: 404 }
      );
    }

    // If bookingId provided, verify it belongs to the user
    if (bookingId) {
      const booking = await db
        .select()
        .from(bookings)
        .where(and(
          eq(bookings.id, bookingId),
          eq(bookings.userId, session.user.id)
        ))
        .limit(1);

      if (!booking[0]) {
        return NextResponse.json(
          { error: 'Invalid booking or booking does not belong to user' },
          { status: 400 }
        );
      }
    }

    // Check if user already reviewed this tour
    const existingReview = await db
      .select()
      .from(reviews)
      .where(and(
        eq(reviews.userId, session.user.id),
        eq(reviews.tourId, tourId)
      ))
      .limit(1);

    if (existingReview[0]) {
      return NextResponse.json(
        { error: 'You have already reviewed this tour' },
        { status: 400 }
      );
    }

    // Create review
    const newReview = await db
      .insert(reviews)
      .values({
        userId: session.user.id,
        tourId,
        rating,
        comment,
        title: title || null,
        bookingId: bookingId || null,
      })
      .returning();

    return NextResponse.json(newReview[0], { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews - Delete a review (user's own review or admin)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reviewId } = body;

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Check if user is admin
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    const isAdmin = user[0]?.role === 'Admin';

    // Get the review
    const review = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (!review[0]) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check authorization (own review or admin)
    if (review[0].userId !== session.user.id && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own reviews' },
        { status: 403 }
      );
    }

    // Delete the review
    await db.delete(reviews).where(eq(reviews.id, reviewId));

    // Log admin action if admin deleted someone else's review
    if (isAdmin && review[0].userId !== session.user.id) {
      await db.insert(adminLogs).values({
        adminId: session.user.id,
        action: 'Deleted review',
        affectedEntity: 'Review',
        entityId: reviewId,
      });
    }

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
