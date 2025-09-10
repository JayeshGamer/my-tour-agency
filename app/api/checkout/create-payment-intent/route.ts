import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('STRIPE_SECRET_KEY is not set.');
  throw new Error('STRIPE_SECRET_KEY is not set.');
}

const stripe = new Stripe(stripeSecretKey, {
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
    const { amount } = body; // Amount should be in cents

    if (!amount || amount < 50) { // Minimum $0.50
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        metadata: {
          userId: session.user.id,
          userEmail: session.user.email || '',
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error: unknown) {
      console.error('Stripe payment intent error:', error);
      const message = error instanceof Error ? error.message : 'Failed to create payment intent';
      return NextResponse.json(
        { error: message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Payment intent API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
