import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user || session.user.role !== 'Admin') {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reason } = await request.json();

    // Get booking details
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, params.id))
      .limit(1);

    if (!booking.length) {
      return Response.json({ error: "Booking not found" }, { status: 404 });
    }

    const bookingData = booking[0];

    if (bookingData.paymentStatus === 'Refunded') {
      return Response.json({ error: "Booking already refunded" }, { status: 400 });
    }

    // Process refund with Stripe
    if (bookingData.paymentReference) {
      try {
        await stripe.refunds.create({
          payment_intent: bookingData.paymentReference,
          reason: 'requested_by_customer',
        });
      } catch (stripeError) {
        console.error('Stripe refund error:', stripeError);
        return Response.json({ error: "Failed to process refund with payment provider" }, { status: 500 });
      }
    }

    // Update booking status
    await db
      .update(bookings)
      .set({
        paymentStatus: 'Refunded',
        status: 'Canceled'
      })
      .where(eq(bookings.id, params.id));

    return Response.json({
      message: "Refund processed successfully",
      bookingId: params.id
    });
  } catch (error) {
    console.error("Error processing refund:", error);
    return Response.json(
      { error: "Failed to process refund" },
      { status: 500 }
    );
  }
}
