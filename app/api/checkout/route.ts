import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../lib/auth';
import { db } from '../../../lib/db';
import { bookings } from '../../../lib/db/schema';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      paymentIntentId,
      cartItems,
      // specialNotes, // Reserved for future use
      // couponCode,   // Reserved for future use
      // discount,     // Reserved for future use
      // totalAmount   // Reserved for future use
    } = body;

    // Verify payment intent with Stripe
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return NextResponse.json(
          { error: 'Payment not completed successfully' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Stripe verification error:', error);
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Create bookings for each cart item
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
          paymentIntentId: paymentIntentId,
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
      
      return NextResponse.json({
        success: true,
        bookings: createdBookings,
        paymentIntentId,
        message: 'Bookings created successfully'
      });
    } catch (error) {
      console.error('Error creating bookings:', error);
      
      // If bookings fail, we should ideally refund the payment
      // For now, we'll just log the error and return a response
      return NextResponse.json(
        { 
          error: 'Booking creation failed. Please contact support with your payment confirmation.',
          paymentIntentId 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: 'Internal server error during checkout' },
      { status: 500 }
    );
  }
}
