import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { bookings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { createBookingNotification } from '@/lib/notifications';

const StatusUpdateSchema = z.object({
  status: z.enum(['Pending', 'Confirmed', 'Canceled']),
});

// PATCH /api/admin/bookings/[id]/status - Update booking status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params as required by Next.js 15
    const { id: bookingId } = await params;
    
    // Check authentication and admin role
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user || session.user.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }
    const body = await request.json();
    const validatedData = StatusUpdateSchema.parse(body);

    // Get the current booking to check if it exists and get tour info
    const existingBooking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const currentBooking = existingBooking[0];

    // Update the booking status
    const result = await db
      .update(bookings)
      .set({
        status: validatedData.status,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    // Create notification for status change
    try {
      const actionMap: Record<string, 'confirmed' | 'cancelled'> = {
        'Confirmed': 'confirmed',
        'Canceled': 'cancelled',
      };

      if (actionMap[validatedData.status]) {
        await createBookingNotification(
          bookingId,
          currentBooking.userId,
          'Tour', // We'd need to fetch the actual tour name from the database
          actionMap[validatedData.status]
        );
      }
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the main operation if notification fails
    }

    return NextResponse.json({
      success: true,
      message: `Booking ${validatedData.status.toLowerCase()} successfully`,
      booking: result[0],
    });

  } catch (error) {
    console.error('Error updating booking status:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
