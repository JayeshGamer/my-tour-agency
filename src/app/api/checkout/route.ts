import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../lib/auth';
import { db } from '../../../lib/db';
import { bookings, tours, customTourRequests, coupons } from '../../../lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      cartItems,
      customTourData,
      paymentMethod,
      cardDetails,
      travelerInfo,
      totalAmount,
      couponId // Add couponId to track which coupon was used
    } = body;

    // Validate that we have either cart items OR custom tour data
    const hasCartItems = cartItems && Array.isArray(cartItems) && cartItems.length > 0;
    const hasCustomTour = customTourData && customTourData.type === 'custom_tour';

    if (!hasCartItems && !hasCustomTour) {
      return NextResponse.json(
        { error: 'Either cart items or custom tour data is required' },
        { status: 400 }
      );
    }

    // Validate payment information
    if (paymentMethod === 'card') {
      if (!cardDetails || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
        return NextResponse.json(
          { error: 'Complete card details are required' },
          { status: 400 }
        );
      }
      
      // Basic card validation
      if (cardDetails.number.replace(/\s/g, '').length < 16 || cardDetails.cvv.length < 3) {
        return NextResponse.json(
          { error: 'Invalid card details' },
          { status: 400 }
        );
      }
    }

    // Simulate payment processing (95% success rate for demo)
    const simulatePaymentSuccess = Math.random() > 0.05;
    
    if (!simulatePaymentSuccess) {
      return NextResponse.json(
        { error: 'Payment processing failed. Please try again.' },
        { status: 400 }
      );
    }

    // Generate payment reference
    const paymentReference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const paymentDate = new Date();

    // Handle different booking types
    if (hasCustomTour) {
      // Handle custom tour booking - SIMPLIFIED APPROACH
      try {
        // Instead of creating a complex tour record, let's use a simpler approach
        // We'll create a minimal tour record that definitely works

        const [customTourRecord] = await db.insert(tours).values({
          name: `Custom Tour - ${customTourData.destination}`,
          title: `Custom Tour to ${customTourData.destination}`,
          description: `Custom tour package for ${customTourData.destination}. This is a personalized itinerary created based on customer requirements.`,
          location: customTourData.destination,
          duration: 7, // Default duration
          pricePerPerson: (customTourData.amount / customTourData.groupSize).toFixed(2),
          price: customTourData.amount.toFixed(2),
          category: 'Custom',
          difficulty: 'Moderate',
          maxGroupSize: customTourData.groupSize,
          imageUrl: '/images/tours/placeholder-tour.svg',
          images: ['/images/tours/placeholder-tour.svg'],
          status: 'Active',
          tourType: 'custom_created',
          startDates: [customTourData.dates[0].start],
          included: ['Accommodation', 'Transportation', 'Activities'],
          notIncluded: ['Personal expenses', 'Tips'],
          itinerary: [
            {
              day: 1,
              title: 'Arrival',
              description: 'Arrive at destination and check-in'
            }
          ],
          featured: false,
          sourceRequestId: customTourData.requestId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }).returning();

        // Now create the booking with the created tour ID
        const [booking] = await db.insert(bookings).values({
          userId: session.user.id,
          tourId: customTourRecord.id,
          numberOfPeople: customTourData.groupSize,
          totalPrice: totalAmount.toString(),
          startDate: new Date(customTourData.dates[0].start),
          status: 'Confirmed',
          paymentStatus: 'Paid',
          paymentMethod: paymentMethod || 'card',
          paymentReference,
          paymentDate,
          bookingSource: 'custom_request',
          sourceRequestId: customTourData.requestId,
          travelerInfo: {
            firstName: travelerInfo?.fullName?.split(' ')[0] || session.user.name?.split(' ')[0] || 'Unknown',
            lastName: travelerInfo?.fullName?.split(' ').slice(1).join(' ') || session.user.name?.split(' ').slice(1).join(' ') || 'User',
            email: travelerInfo?.email || session.user.email || '',
            phone: travelerInfo?.phone || '',
            specialRequirements: travelerInfo?.specialNotes || ''
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        }).returning();

        // Update the custom tour request status to 'converted_to_booking'
        await db
          .update(customTourRequests)
          .set({
            status: 'converted_to_booking',
            updatedAt: new Date()
          })
          .where(eq(customTourRequests.id, customTourData.requestId));

        return NextResponse.json({
          success: true,
          bookings: [booking],
          paymentReference,
          bookingType: 'custom_tour',
          message: 'Custom tour payment completed successfully!'
        });

      } catch (error) {
        console.error('Error creating custom tour booking:', error);
        return NextResponse.json(
          {
            error: 'Custom tour booking failed. Please try again.',
            details: error instanceof Error ? error.message : 'Unknown error'
          },
          { status: 500 }
        );
      }
    } else {
      // Handle regular cart item bookings
      const bookingPromises = cartItems.map(async (item: {
        tourId: string;
        tourName: string;
        numberOfPeople: number;
        totalPrice: number;
        date: string;
      }) => {
        try {
          const [booking] = await db.insert(bookings).values({
            userId: session.user.id,
            tourId: item.tourId,
            numberOfPeople: item.numberOfPeople,
            totalPrice: item.totalPrice.toString(),
            startDate: new Date(item.date),
            status: 'Confirmed',
            paymentStatus: 'Paid',
            paymentMethod: paymentMethod || 'card',
            paymentReference,
            paymentDate,
            bookingSource: 'direct', // Use existing bookingSource field
            travelerInfo: {
              firstName: travelerInfo?.fullName?.split(' ')[0] || session.user.name?.split(' ')[0] || 'Unknown',
              lastName: travelerInfo?.fullName?.split(' ').slice(1).join(' ') || session.user.name?.split(' ').slice(1).join(' ') || 'User',
              email: travelerInfo?.email || session.user.email || '',
              phone: travelerInfo?.phone || '',
              specialRequirements: travelerInfo?.specialNotes || ''
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          }).returning();

          return booking;
        } catch (error) {
          console.error('Error creating booking for tour:', item.tourId, error);
          throw new Error(`Failed to create booking for tour: ${item.tourName}`);
        }
      });

      try {
        const createdBookings = await Promise.all(bookingPromises);

        // If a coupon was used, increment its usage count
        if (couponId) {
          await db
            .update(coupons)
            .set(sql`usage_count = usage_count + 1`)
            .where(eq(coupons.id, couponId));
        }

        return NextResponse.json({
          success: true,
          bookings: createdBookings,
          paymentReference,
          bookingType: 'regular_tour',
          message: 'Bookings created successfully'
        });
      } catch (error) {
        console.error('Error creating bookings:', error);

        return NextResponse.json(
          {
            error: 'Booking creation failed. Please try again.',
            paymentReference
          },
          { status: 500 }
        );
      }
    }

  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: 'Internal server error during checkout' },
      { status: 500 }
    );
  }
}
