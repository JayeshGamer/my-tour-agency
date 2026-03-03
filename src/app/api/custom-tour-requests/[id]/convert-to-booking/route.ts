import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customTourRequests, tours, bookings, notifications } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

interface RouteParams {
  params: {
    id: string;
  };
}

const convertToBookingSchema = z.object({
  tourId: z.string().uuid().optional(), // If converting to existing tour
  createNewTour: z.boolean().default(false), // If creating new custom tour
  tourDetails: z.object({
    name: z.string(),
    title: z.string(),
    description: z.string(),
    location: z.string(),
    duration: z.number(),
    category: z.string(),
    difficulty: z.string(),
    maxGroupSize: z.number(),
    imageUrl: z.string().optional(),
    images: z.array(z.string()).default([]),
    startDates: z.array(z.string()),
    included: z.array(z.string()),
    notIncluded: z.array(z.string()),
    itinerary: z.array(z.object({
      day: z.number(),
      title: z.string(),
      description: z.string()
    }))
  }).optional(),
  travelerInfo: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    phone: z.string(),
    emergencyContact: z.string().optional(),
    specialRequirements: z.string().optional()
  }),
  startDate: z.string(), // Tour start date
  paymentMethod: z.string().optional()
});

// POST - Convert approved custom tour request to booking
export async function POST(request: NextRequest, context: any) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user || session.user.role !== 'Admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id: requestId } = await context.params;
    const body = await request.json();
    const validatedData = convertToBookingSchema.parse(body);

    // Check if request exists and is in approved state with a quote
    const [existingRequest] = await db
      .select()
      .from(customTourRequests)
      .where(eq(customTourRequests.id, requestId));

    if (!existingRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (existingRequest.status !== 'approved') {
      return NextResponse.json(
        { error: 'Only approved requests can be converted to bookings' },
        { status: 400 }
      );
    }

    if (!existingRequest.quoteDetails) {
      return NextResponse.json(
        { error: 'Request must have a quote before conversion' },
        { status: 400 }
      );
    }

    let tourId = validatedData.tourId;

    // Create new tour if requested
    if (validatedData.createNewTour && validatedData.tourDetails) {
      const perPerson = existingRequest.quoteDetails.totalAmount / existingRequest.groupSize;
      const tourInsertData: any = {
        ...validatedData.tourDetails,
        pricePerPerson: perPerson,
        price: perPerson, // Keep compatibility
        tourType: 'custom_created',
        sourceRequestId: requestId,
        createdBy: null, // Admin-created
        status: 'Active'
      };

      const [newTour] = (await db
        .insert(tours)
        .values(tourInsertData)
        .returning()) as any;

      tourId = newTour.id;
    }

    if (!tourId) {
      return NextResponse.json(
        { error: 'Tour ID is required or tour details must be provided for new tour creation' },
        { status: 400 }
      );
    }

    // Create the booking
    const [newBooking] = await db
      .insert(bookings)
      .values({
        tourId: tourId,
        userId: existingRequest.userId,
        numberOfPeople: existingRequest.groupSize,
        totalPrice: String(existingRequest.quoteDetails.totalAmount),
        startDate: new Date(validatedData.startDate),
        status: 'Confirmed',
        paymentStatus: 'Pending',
        paymentMethod: validatedData.paymentMethod,
        bookingSource: 'custom_request',
        sourceRequestId: requestId,
        travelerInfo: validatedData.travelerInfo
      })
      .returning();

    // Update the request status to converted
    await db
      .update(customTourRequests)
      .set({
        status: 'converted_to_booking',
        updatedAt: new Date(),
        reviewedAt: new Date(),
        reviewedBy: session.user.id
      })
      .where(eq(customTourRequests.id, requestId));

    // Create notification for customer
    await db.insert(notifications).values({
      title: 'Your Custom Tour Request Has Been Confirmed!',
      message: `Your custom tour to ${existingRequest.destination} has been confirmed and converted to booking #${newBooking.id.slice(0, 8)}. Please proceed with payment.`,
      type: 'booking_confirmed',
      priority: 'high',
      adminId: existingRequest.userId,
      relatedEntityType: 'booking',
      relatedEntityId: newBooking.id,
      metadata: {
        requestId,
        bookingId: newBooking.id,
        tourId,
        totalAmount: existingRequest.quoteDetails.totalAmount,
        startDate: validatedData.startDate
      }
    });

    return NextResponse.json({
      message: 'Request successfully converted to booking',
      bookingId: newBooking.id,
      tourId,
      totalAmount: existingRequest.quoteDetails.totalAmount
    });

  } catch (error) {
    console.error('Error converting request to booking:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid conversion data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to convert request to booking' },
      { status: 500 }
    );
  }
}
