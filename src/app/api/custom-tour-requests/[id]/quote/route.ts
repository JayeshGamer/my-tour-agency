import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customTourRequests, notifications } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const quoteSchema = z.object({
  totalAmount: z.number().min(0, 'Total amount must be positive'),
  breakdown: z.record(z.string(), z.number()),
  validity: z.string().min(1, 'Validity date is required'),
  currency: z.string().default('INR'),
  terms: z.string().optional(),
  adminNotes: z.string().optional()
});

// POST - Create or update quote for custom tour request
export async function POST(request: NextRequest, context: any) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user || session.user.role !== 'Admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id: requestId } = await context.params;
    const body = await request.json();

    // Basic validation
    if (!body.totalAmount || body.totalAmount <= 0) {
      return NextResponse.json({ error: 'Valid total amount is required' }, { status: 400 });
    }

    if (!body.validity) {
      return NextResponse.json({ error: 'Validity date is required' }, { status: 400 });
    }

    // Check if request exists
    const [existingRequest] = await db
      .select()
      .from(customTourRequests)
      .where(eq(customTourRequests.id, requestId));

    if (!existingRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Prepare quote details
    const quoteDetails = {
      totalAmount: body.totalAmount,
      breakdown: body.breakdown || {},
      validity: body.validity,
      currency: body.currency || 'INR',
      terms: body.terms || '',
      adminNotes: body.adminNotes || ''
    };

    // Update the request with quote details and change status to 'quoted'
    await db
      .update(customTourRequests)
      .set({
        status: 'quoted',
        quoteDetails: quoteDetails,
        quotedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(customTourRequests.id, requestId));

    // Create notification for the user
    await db.insert(notifications).values({
      adminId: existingRequest.userId,
      title: 'Quote Ready for Your Custom Tour',
      message: `Your custom tour quote for ${existingRequest.destination} is ready! Total amount: ${body.currency || 'INR'} ${body.totalAmount.toLocaleString()}`,
      type: 'quote_ready',
      priority: 'high',
      relatedEntityType: 'custom_tour_request',
      relatedEntityId: requestId,
      metadata: {
        requestId: requestId,
        quoteAmount: body.totalAmount,
        currency: body.currency || 'INR',
        validity: body.validity
      }
    });

    console.log('Quote generated successfully for request:', requestId);

    return NextResponse.json({
      message: 'Quote generated successfully',
      quoteAmount: body.totalAmount,
      currency: body.currency || 'INR',
      requestId: requestId
    });

  } catch (error) {
    console.error('Error generating quote:', error);
    return NextResponse.json(
      { error: 'Failed to generate quote', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PATCH - Update existing quote
export async function PATCH(request: NextRequest, context: any) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user || session.user.role !== 'Admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id: requestId } = await context.params;
    const body = await request.json();
    const validatedData = quoteSchema.parse(body);

    // Check if request exists and has an existing quote
    const [existingRequest] = await db
      .select()
      .from(customTourRequests)
      .where(eq(customTourRequests.id, requestId));

    if (!existingRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (!existingRequest.quoteDetails) {
      return NextResponse.json(
        { error: 'No existing quote found to update' },
        { status: 400 }
      );
    }

    // Update the quote
    await db
      .update(customTourRequests)
      .set({
        quoteDetails: {
          totalAmount: validatedData.totalAmount,
          breakdown: validatedData.breakdown,
          validity: validatedData.validity,
          currency: validatedData.currency,
          terms: validatedData.terms
        },
        adminNotes: validatedData.adminNotes,
        quotedAt: new Date(),
        quotedBy: session.user.id,
        updatedAt: new Date()
      })
      .where(eq(customTourRequests.id, requestId));

    // Notify customer of quote update
    await db.insert(notifications).values({
      title: 'Quote Updated for Your Custom Tour Request',
      message: `Your quote for ${existingRequest.destination} has been updated. New amount: ${validatedData.currency} ${validatedData.totalAmount}`,
      type: 'quote_updated',
      priority: 'normal',
      adminId: existingRequest.userId,
      relatedEntityType: 'custom_tour_request',
      relatedEntityId: requestId,
      metadata: {
        requestId,
        previousAmount: existingRequest.quoteDetails.totalAmount,
        newAmount: validatedData.totalAmount,
        currency: validatedData.currency
      }
    });

    return NextResponse.json({
      message: 'Quote updated successfully',
      quoteAmount: validatedData.totalAmount,
      currency: validatedData.currency
    });

  } catch (error) {
    console.error('Error updating quote:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid quote data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update quote' },
      { status: 500 }
    );
  }
}

// GET - Retrieve quote for a custom tour request
export async function GET(request: NextRequest, context: any) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: requestId } = await context.params;

    // TODO: Implement actual database query when schema is confirmed
    return NextResponse.json({
      message: 'Quote retrieval not yet implemented',
      requestId
    });

  } catch (error) {
    console.error('Error retrieving quote:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve quote' },
      { status: 500 }
    );
  }
}
