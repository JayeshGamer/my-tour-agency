import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
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
    const { amount, cardDetails } = body;

    if (!amount || amount < 50) { // Minimum ₹50
      return NextResponse.json(
        { error: 'Invalid amount. Minimum ₹50 required.' },
        { status: 400 }
      );
    }

    // Validate card details for simulation
    if (cardDetails) {
      const { number, expiry, cvv } = cardDetails;
      
      if (!number || !expiry || !cvv) {
        return NextResponse.json(
          { error: 'Complete card details are required' },
          { status: 400 }
        );
      }

      // Basic validation
      const cardNumber = number.replace(/\s/g, '');
      if (cardNumber.length < 16 || cvv.length < 3) {
        return NextResponse.json(
          { error: 'Invalid card details' },
          { status: 400 }
        );
      }

      // Check for test card numbers that should fail
      const failureCards = ['4000000000000002', '4000000000000069', '4000000000000127'];
      if (failureCards.includes(cardNumber)) {
        return NextResponse.json(
          { error: 'Your card was declined. Please try a different payment method.' },
          { status: 400 }
        );
      }
    }

    // Generate simulated payment reference
    const paymentReference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      success: true,
      paymentReference,
      amount: amount,
      currency: 'INR',
      status: 'validated',
      message: 'Payment details validated successfully'
    });

  } catch (error) {
    console.error('Payment validation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
