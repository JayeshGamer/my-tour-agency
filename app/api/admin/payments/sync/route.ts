import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "Admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Admin access required" }),
        { status: 401 }
      );
    }

    let updatedCount = 0;
    let createdCount = 0;

    // Get recent payments from Stripe (last 30 days)
    const thirtyDaysAgo = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
    
    const stripePayments = await stripe.paymentIntents.list({
      created: { gte: thirtyDaysAgo },
      limit: 100,
      expand: ['data.payment_method']
    });

    for (const stripePayment of stripePayments.data) {
      try {
        // Check if payment already exists in our database
        const existingPayment = await prisma.payment.findUnique({
          where: { paymentIntentId: stripePayment.id }
        });

        // Try to find associated booking from metadata or description
        let bookingId = null;
        if (stripePayment.metadata?.booking_id) {
          bookingId = stripePayment.metadata.booking_id;
        }

        const paymentData = {
          paymentIntentId: stripePayment.id,
          amount: stripePayment.amount,
          currency: stripePayment.currency,
          status: stripePayment.status,
          paymentMethodType: stripePayment.payment_method?.type || 'unknown',
          cardBrand: stripePayment.payment_method?.card?.brand || null,
          cardLast4: stripePayment.payment_method?.card?.last4 || null,
          createdAt: new Date(stripePayment.created * 1000),
          bookingId: bookingId,
        };

        if (existingPayment) {
          // Update existing payment
          await prisma.payment.update({
            where: { id: existingPayment.id },
            data: {
              status: stripePayment.status,
              paymentMethodType: paymentData.paymentMethodType,
              cardBrand: paymentData.cardBrand,
              cardLast4: paymentData.cardLast4,
            }
          });
          updatedCount++;
        } else {
          // Create new payment record
          await prisma.payment.create({
            data: paymentData
          });
          createdCount++;
        }
      } catch (error) {
        console.error(`Error processing payment ${stripePayment.id}:`, error);
        // Continue with other payments even if one fails
      }
    }

    return new Response(
      JSON.stringify({
        message: "Stripe sync completed successfully",
        results: {
          processed: stripePayments.data.length,
          created: createdCount,
          updated: updatedCount
        }
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error syncing with Stripe:", error);
    
    if (error.type === 'StripeError') {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400 }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "Failed to sync with Stripe" }),
      { status: 500 }
    );
  }
}
