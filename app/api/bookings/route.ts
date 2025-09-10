import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bookings, tours, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    let query = db
      .select({
        booking: bookings,
        tour: tours,
        user: users,
      })
      .from(bookings)
      .leftJoin(tours, eq(bookings.tourId, tours.id))
      .leftJoin(users, eq(bookings.userId, users.id));

    if (userId) {
      query = query.where(eq(bookings.userId, userId));
    }

    const result = await query;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate tour exists and get price
    const tour = await db
      .select()
      .from(tours)
      .where(eq(tours.id, body.tourId))
      .limit(1);

    if (!tour || tour.length === 0) {
      return NextResponse.json(
        { error: 'Tour not found' },
        { status: 404 }
      );
    }

    // Calculate total price
    const totalPrice = Number(tour[0].price) * body.numberOfPeople;

    const newBooking = await db.insert(bookings).values({
      userId: body.userId,
      tourId: body.tourId,
      startDate: new Date(body.startDate),
      numberOfPeople: body.numberOfPeople,
      totalPrice: totalPrice.toString(),
      status: 'pending',
      paymentIntentId: body.paymentIntentId,
    }).returning();

    return NextResponse.json(newBooking[0], { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, status, paymentIntentId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentIntentId) updateData.paymentIntentId = paymentIntentId;
    updateData.updatedAt = new Date();

    const updatedBooking = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, bookingId))
      .returning();

    if (!updatedBooking || updatedBooking.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBooking[0]);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
