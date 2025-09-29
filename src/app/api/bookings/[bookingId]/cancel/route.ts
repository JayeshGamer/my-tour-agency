import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bookings, adminLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params; // Await the params promise

    // Authenticate user
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the booking to verify ownership and current status
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking.length) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const bookingData = booking[0];

    // Check if user owns this booking
    if (bookingData.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if booking is already cancelled
    if (bookingData.status === 'Canceled') {
      return NextResponse.json({ error: 'Booking is already cancelled' }, { status: 400 });
    }

    // Check if booking can be cancelled (e.g., not within 24 hours of travel date)
    const travelDate = new Date(bookingData.startDate); // Use startDate from database
    const now = new Date();
    const hoursDifference = (travelDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDifference < 24) {
      return NextResponse.json({
        error: 'Cannot cancel booking within 24 hours of travel date'
      }, { status: 400 });
    }

    // Update booking status to cancelled
    await db
      .update(bookings)
      .set({
        status: 'Canceled',
        updatedAt: new Date()
      })
      .where(eq(bookings.id, bookingId));

    // Log the cancellation (only if adminLogs table exists)
    try {
      await db.insert(adminLogs).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: 'BOOKING_CANCELLED',
        details: `User cancelled booking ${bookingId}`,
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        createdAt: new Date(),
      });
    } catch (logError) {
      console.warn('Failed to log cancellation, but booking was cancelled successfully:', logError);
    }

    return NextResponse.json({
      message: 'Booking cancelled successfully',
      bookingId
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
