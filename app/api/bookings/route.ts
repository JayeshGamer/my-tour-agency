import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bookings, tours, users, adminLogs } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Enforce server-side session
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Determine if user is admin
    const userRow = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
    const isAdmin = userRow[0]?.role === 'Admin';

    // Build booking query
    const query = db
      .select({
        id: bookings.id,
        numberOfPeople: bookings.numberOfPeople,
        totalPrice: bookings.totalPrice,
        bookingDate: bookings.bookingDate,
        startDate: bookings.startDate,
        status: bookings.status,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        tour: {
          id: tours.id,
          name: tours.name,
          location: tours.location,
          duration: tours.duration,
          pricePerPerson: tours.pricePerPerson,
        },
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(bookings)
      .leftJoin(tours, eq(bookings.tourId, tours.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .orderBy(desc(bookings.createdAt));

    const data = isAdmin ? await query : await query.where(eq(bookings.userId, session.user.id));

    return NextResponse.json(data);
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
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tourId, numberOfPeople, startDate } = body;

    if (!tourId || !numberOfPeople || !startDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate tour exists and get price
    const tour = await db.select().from(tours).where(eq(tours.id, tourId)).limit(1);

    if (!tour[0]) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    if (tour[0].status !== 'Active') {
      return NextResponse.json({ error: 'Tour is not available for booking' }, { status: 400 });
    }

    // Calculate total price using pricePerPerson
    const totalPrice = parseFloat(tour[0].pricePerPerson) * numberOfPeople;

    const newBooking = await db.insert(bookings).values({
      userId: session.user.id,
      tourId,
      startDate: new Date(startDate),
      numberOfPeople,
      totalPrice: totalPrice.toString(),
      bookingDate: new Date(),
      status: 'Pending',
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
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role for status updates
    const userRow = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
    const isAdmin = userRow[0]?.role === 'Admin';

    const body = await request.json();
    const { bookingId, status, paymentIntentId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Status changes require admin privileges
    if (status && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    if (status && !['Pending', 'Confirmed', 'Canceled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const updateData: {
      updatedAt: Date;
      status?: 'Pending' | 'Confirmed' | 'Canceled';
      paymentIntentId?: string;
    } = { updatedAt: new Date() };
    if (status) updateData.status = status as 'Pending' | 'Confirmed' | 'Canceled';
    if (paymentIntentId) updateData.paymentIntentId = paymentIntentId;

    const updatedBooking = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, bookingId))
      .returning();

    if (!updatedBooking[0]) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Log admin action if status was changed
    if (status && isAdmin) {
      await db.insert(adminLogs).values({
        adminId: session.user.id,
        action: `Updated booking status to ${status}`,
        affectedEntity: 'Booking',
        entityId: bookingId,
      });
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
