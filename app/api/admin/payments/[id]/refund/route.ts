import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "Admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Admin access required" }),
        { status: 401 }
      );
    }

    const { amount } = await request.json();

    // Find the payment in our database
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        booking: {
          include: {
            user: true,
            tour: true
          }
        }
      }
    });

    if (!payment) {
      return new Response(
        JSON.stringify({ error: "Payment not found" }),
        { status: 404 }
      );
    }

    if (payment.status !== 'succeeded') {
      return new Response(
        JSON.stringify({ error: "Can only refund successful payments" }),
        { status: 400 }
      );
    }

    // Create refund in Stripe
    const refundData: Stripe.RefundCreateParams = {
      payment_intent: payment.paymentIntentId,
    };

    // If amount is specified, do partial refund
    if (amount && amount < payment.amount) {
      refundData.amount = amount;
    }

    const stripeRefund = await stripe.refunds.create(refundData);

    // Update payment status in our database
    await prisma.payment.update({
      where: { id: params.id },
      data: {
        status: stripeRefund.status === 'succeeded' ? 'refunded' : stripeRefund.status,
        refundAmount: stripeRefund.amount,
        refundId: stripeRefund.id,
        refundedAt: new Date()
      }
    });

    // Update booking status if full refund
    if (stripeRefund.amount === payment.amount && payment.booking) {
      await prisma.booking.update({
        where: { id: payment.booking.id },
        data: { status: 'cancelled' }
      });
    }

    return new Response(
      JSON.stringify({
        message: "Refund processed successfully",
        refund: {
          id: stripeRefund.id,
          amount: stripeRefund.amount,
          status: stripeRefund.status,
          reason: stripeRefund.reason
        }
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error processing refund:", error);
    
    if (error.type === 'StripeError') {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400 }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "Failed to process refund" }),
      { status: 500 }
    );
  }
}
