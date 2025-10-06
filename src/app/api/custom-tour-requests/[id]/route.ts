import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customTourRequests, users, tourRequestCommunications } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Fetch single custom tour request details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: requestId } = await params;
    const isAdmin = session.user.role === 'Admin';

    // Base query for the request
    let whereClause = eq(customTourRequests.id, requestId);

    // Non-admin users can only see their own requests
    if (!isAdmin) {
      whereClause = and(
        eq(customTourRequests.id, requestId),
        eq(customTourRequests.userId, session.user.id)
      );
    }

    const [tourRequest] = await db
      .select({
        id: customTourRequests.id,
        userId: customTourRequests.userId,
        destination: customTourRequests.destination,
        preferredDates: customTourRequests.preferredDates,
        alternativeDates: customTourRequests.alternativeDates,
        groupSize: customTourRequests.groupSize,
        groupComposition: customTourRequests.groupComposition,
        budgetRange: customTourRequests.budgetRange,
        accommodationPreference: customTourRequests.accommodationPreference,
        activityPreferences: customTourRequests.activityPreferences,
        transportationPreference: customTourRequests.transportationPreference,
        mealPreferences: customTourRequests.mealPreferences,
        specialRequirements: customTourRequests.specialRequirements,
        status: customTourRequests.status,
        priority: customTourRequests.priority,
        adminNotes: isAdmin ? customTourRequests.adminNotes : undefined,
        quoteDetails: customTourRequests.quoteDetails,
        quotedAt: customTourRequests.quotedAt,
        quotedBy: customTourRequests.quotedBy,
        specialOccasion: customTourRequests.specialOccasion,
        previousTravelExperience: customTourRequests.previousTravelExperience,
        preferredContactMethod: customTourRequests.preferredContactMethod,
        bestTimeToContact: customTourRequests.bestTimeToContact,
        additionalNotes: customTourRequests.additionalNotes,
        createdAt: customTourRequests.createdAt,
        updatedAt: customTourRequests.updatedAt,
        reviewedAt: customTourRequests.reviewedAt,
        reviewedBy: customTourRequests.reviewedBy,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName
        }
      })
      .from(customTourRequests)
      .leftJoin(users, eq(customTourRequests.userId, users.id))
      .where(whereClause);

    if (!tourRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Fetch communications if admin or owner
    const communications = await db
      .select({
        id: tourRequestCommunications.id,
        message: tourRequestCommunications.message,
        isInternal: tourRequestCommunications.isInternal,
        attachments: tourRequestCommunications.attachments,
        createdAt: tourRequestCommunications.createdAt,
        sender: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role
        }
      })
      .from(tourRequestCommunications)
      .leftJoin(users, eq(tourRequestCommunications.senderId, users.id))
      .where(
        and(
          eq(tourRequestCommunications.requestId, requestId),
          // Hide internal messages from non-admin users
          isAdmin ? undefined : eq(tourRequestCommunications.isInternal, false)
        )
      )
      .orderBy(tourRequestCommunications.createdAt);

    // Sanitize the response data to prevent null/undefined issues with Object.entries
    const sanitizedRequest = {
      ...tourRequest,
      quoteDetails: tourRequest.quoteDetails ? {
        ...tourRequest.quoteDetails,
        breakdown: tourRequest.quoteDetails.breakdown || {}
      } : null
    };

    return NextResponse.json({
      request: sanitizedRequest,
      communications
    });

  } catch (error) {
    console.error('Error fetching custom tour request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch request' },
      { status: 500 }
    );
  }
}

// PATCH - Update custom tour request (admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user || session.user.role !== 'Admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id: requestId } = await params;
    const body = await request.json();

    const updateSchema = z.object({
      status: z.enum(['submitted', 'under_review', 'quoted', 'approved', 'rejected', 'converted_to_booking']).optional(),
      priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
      adminNotes: z.string().optional(),
      quoteDetails: z.object({
        totalAmount: z.number(),
        breakdown: z.record(z.number()),
        validity: z.string(),
        currency: z.string(),
        terms: z.string().optional()
      }).optional()
    });

    const validatedData = updateSchema.parse(body);

    // Check if request exists
    const [existingRequest] = await db
      .select()
      .from(customTourRequests)
      .where(eq(customTourRequests.id, requestId));

    if (!existingRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Update the request
    const updateData: any = {
      ...validatedData,
      updatedAt: new Date()
    };

    // Set review information when status changes
    if (validatedData.status && validatedData.status !== existingRequest.status) {
      updateData.reviewedAt = new Date();
      updateData.reviewedBy = session.user.id;
    }

    // Set quote information when providing quote
    if (validatedData.quoteDetails) {
      updateData.quotedAt = new Date();
      updateData.quotedBy = session.user.id;
    }

    await db
      .update(customTourRequests)
      .set(updateData)
      .where(eq(customTourRequests.id, requestId));

    return NextResponse.json({ message: 'Request updated successfully' });

  } catch (error) {
    console.error('Error updating custom tour request:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}
