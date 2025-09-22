import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../lib/auth';
import { db } from '../../../lib/db';
import { bookings } from '../../../lib/db/schema';
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
      paymentMethod,
      cardDetails,
      travelerInfo
    } = body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart items are required' },
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
          paymentStatus: 'Paid',
          paymentMethod: paymentMethod || 'card',
          paymentReference,
          paymentDate,
          travelerInfo: travelerInfo || {
            firstName: session.user.name?.split(' ')[0] || 'Unknown',
            lastName: session.user.name?.split(' ').slice(1).join(' ') || 'User',
            email: session.user.email || '',
            phone: '',
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
      
      return NextResponse.json({
        success: true,
        bookings: createdBookings,
        paymentReference,
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

  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: 'Internal server error during checkout' },
      { status: 500 }
    );
  }
}
