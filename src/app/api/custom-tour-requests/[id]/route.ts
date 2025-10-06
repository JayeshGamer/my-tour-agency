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

    // Build where conditions without passing undefined into `and`.
    const whereConditions = [eq(customTourRequests.id, requestId) as any];
    if (!isAdmin) {
      whereConditions.push(eq(customTourRequests.userId, session.user.id));
    }

    // Build select fields conditionally to avoid undefined entries.
    const baseSelect: any = {
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
      reviewedBy: customTourRequests.reviewedBy
    };

    const selectFields = isAdmin
      ? {
          ...baseSelect,
          adminNotes: customTourRequests.adminNotes,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName
          }
        }
      : baseSelect;

    // Build the query and apply leftJoin only when needed.
    let query = db.select(selectFields).from(customTourRequests);
    if (isAdmin) {
      query = query.leftJoin(users, eq(customTourRequests.userId, users.id));
    }

    let tourRequest;
    if (whereConditions.length === 1) {
      [tourRequest] = await query.where(whereConditions[0]);
    } else {
      [tourRequest] = await query.where(and(...whereConditions));
    }

    if (!tourRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Fetch communications (hide internal messages for non-admins) without
    // passing undefined into `and`.
    const commConditions: any[] = [eq(tourRequestCommunications.requestId, requestId)];
    if (!isAdmin) commConditions.push(eq(tourRequestCommunications.isInternal, false));

    let communicationsQuery = db
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
      .leftJoin(users, eq(tourRequestCommunications.senderId, users.id));

    let communications;
    if (commConditions.length === 1) {
      communications = await communicationsQuery.where(commConditions[0]).orderBy(tourRequestCommunications.createdAt);
    } else {
      communications = await communicationsQuery.where(and(...commConditions)).orderBy(tourRequestCommunications.createdAt);
    }

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

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Debug logs to help trace why approvals might fail during development
    try {
      console.debug('[PATCH] custom-tour-requests called', {
        userId: session.user?.id,
        userRole: session.user?.role,
        params
      });
    } catch (logErr) {
      // ignore logging errors
    }

    const isAdmin = session.user.role === 'Admin';
    const { id: requestId } = await params;
    const body = await request.json();

    console.debug('[PATCH] payload', { body });

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

    console.debug('[PATCH] existingRequest', {
      id: existingRequest?.id,
      status: existingRequest?.status,
      userId: existingRequest?.userId
    });

    if (!existingRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Non-admin users are only allowed to *approve* their own quotes.
    if (!isAdmin) {
      // Only allow a status change to 'approved' from the request owner
      if (!validatedData.status || validatedData.status !== 'approved') {
        return NextResponse.json({ error: 'Admin access required for this operation' }, { status: 403 });
      }

      if (existingRequest.userId !== session.user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      if (existingRequest.status !== 'quoted') {
        return NextResponse.json({ error: 'Only quoted requests can be approved' }, { status: 400 });
      }

      // Perform the limited update (approve)
      const updateData: any = {
        status: 'approved',
        updatedAt: new Date()
      };

      await db
        .update(customTourRequests)
        .set(updateData)
        .where(eq(customTourRequests.id, requestId));

      return NextResponse.json({ message: 'Request approved successfully' });
    }

    // Admin flow: allow broader updates
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
