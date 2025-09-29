import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user || session.user.role !== 'Admin') {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all bookings with payment references
    const allBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.paymentStatus, 'Pending'));

    let syncedCount = 0;
    const errors: string[] = [];

    for (const booking of allBookings) {
      if (booking.paymentReference) {
        try {
          // Retrieve payment intent from Stripe
          const paymentIntent = await stripe.paymentIntents.retrieve(booking.paymentReference);

          let newStatus = booking.paymentStatus;
          if (paymentIntent.status === 'succeeded') {
            newStatus = 'Paid';
          } else if (paymentIntent.status === 'canceled') {
            newStatus = 'Failed';
          }

          // Update booking if status changed
          if (newStatus !== booking.paymentStatus) {
            await db
              .update(bookings)
              .set({
                paymentStatus: newStatus as any,
                status: newStatus === 'Paid' ? 'Confirmed' : booking.status
              })
              .where(eq(bookings.id, booking.id));

            syncedCount++;
          }
        } catch (stripeError) {
          console.error(`Stripe sync error for booking ${booking.id}:`, stripeError);
          errors.push(`Booking ${booking.id}: ${stripeError}`);
        }
      }
    }

    return Response.json({
      message: `Synced ${syncedCount} payments successfully`,
      syncedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("Error syncing payments:", error);
    return Response.json(
      { error: "Failed to sync payments" },
      { status: 500 }
    );
  }
}
