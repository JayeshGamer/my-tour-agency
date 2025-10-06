import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { customTourRequests, users, notifications } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema for custom tour request
const customTourRequestSchema = z.object({
  destination: z.string().min(1, 'Destination is required'),
  preferredDates: z.array(z.object({
    start: z.string(),
    end: z.string(),
    flexible: z.boolean()
  })).min(1, 'At least one preferred date is required'),
  alternativeDates: z.array(z.object({
    start: z.string(),
    end: z.string(),
    flexible: z.boolean()
  })).optional(),
  groupSize: z.number().min(1, 'Group size must be at least 1').max(50, 'Group size cannot exceed 50'),
  groupComposition: z.object({
    adults: z.number().min(1),
    children: z.number().min(0),
    ages: z.array(z.number())
  }),
  budgetRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    perPerson: z.boolean(),
    currency: z.string().default('INR')
  }),
  accommodationPreference: z.enum(['budget', 'mid-range', 'luxury']).optional(),
  activityPreferences: z.array(z.string()).optional(),
  transportationPreference: z.enum(['flight', 'train', 'car', 'mixed']).optional(),
  mealPreferences: z.array(z.string()).optional(),
  specialRequirements: z.string().optional(),
  specialOccasion: z.string().optional(),
  previousTravelExperience: z.string().optional(),
  preferredContactMethod: z.enum(['email', 'phone', 'whatsapp']).default('email'),
  bestTimeToContact: z.string().optional(),
  additionalNotes: z.string().optional()
});

// GET - Fetch user's custom tour requests or all requests for admin
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isAdmin = session.user.role === 'Admin';
    const status = searchParams.get('status');

    let query = db
      .select({
        id: customTourRequests.id,
        destination: customTourRequests.destination,
        preferredDates: customTourRequests.preferredDates,
        groupSize: customTourRequests.groupSize,
        budgetRange: customTourRequests.budgetRange,
        status: customTourRequests.status,
        priority: customTourRequests.priority,
        createdAt: customTourRequests.createdAt,
        updatedAt: customTourRequests.updatedAt,
        quotedAt: customTourRequests.quotedAt,
        quoteDetails: customTourRequests.quoteDetails,
        // Include user details for admin
        user: isAdmin ? {
          id: users.id,
          name: users.name,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName
        } : undefined
      })
      .from(customTourRequests);

    if (isAdmin) {
      query = query.leftJoin(users, eq(customTourRequests.userId, users.id));
    } else {
      query = query.where(eq(customTourRequests.userId, session.user.id));
    }

    if (status) {
      query = query.where(
        isAdmin
          ? eq(customTourRequests.status, status as any)
          : and(
              eq(customTourRequests.userId, session.user.id),
              eq(customTourRequests.status, status as any)
            )
      );
    }

    let requests;
    try {
      requests = await query.orderBy(desc(customTourRequests.createdAt));
    } catch (queryError) {
      console.error('Database query error:', queryError);
      // Return empty result for now
      return NextResponse.json({ requests: [] });
    }
    
    // Sanitize the response data to prevent null/undefined issues with Object.entries
    const sanitizedRequests = requests.map((request) => {
      const safeRequest = {
        ...request,
        quoteDetails: null // Start with null
      };
      
      // Safely process quoteDetails if it exists
      if (request.quoteDetails && typeof request.quoteDetails === 'object') {
        try {
          safeRequest.quoteDetails = {
            totalAmount: request.quoteDetails.totalAmount || 0,
            breakdown: (request.quoteDetails.breakdown && typeof request.quoteDetails.breakdown === 'object') 
              ? request.quoteDetails.breakdown 
              : {},
            validity: request.quoteDetails.validity || '',
            currency: request.quoteDetails.currency || 'INR',
            terms: request.quoteDetails.terms || ''
          };
        } catch (sanitizeError) {
          console.error('Error sanitizing quoteDetails:', sanitizeError);
          // Keep quoteDetails as null
        }
      }
      
      return safeRequest;
    });

    return NextResponse.json({ requests: sanitizedRequests });

  } catch (error) {
    console.error('Error fetching custom tour requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

// POST - Create new custom tour request
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = customTourRequestSchema.parse(body);

    // Validate budget range
    if (validatedData.budgetRange.min > validatedData.budgetRange.max) {
      return NextResponse.json(
        { error: 'Minimum budget cannot be greater than maximum budget' },
        { status: 400 }
      );
    }

    // Validate group composition
    const totalPeople = validatedData.groupComposition.adults + validatedData.groupComposition.children;
    if (totalPeople !== validatedData.groupSize) {
      return NextResponse.json(
        { error: 'Group composition (adults + children) must match total group size' },
        { status: 400 }
      );
    }

    if (validatedData.groupComposition.ages.length !== totalPeople) {
      return NextResponse.json(
        { error: 'Number of ages must match total group size' },
        { status: 400 }
      );
    }

    // Create the request
    const [newRequest] = await db
      .insert(customTourRequests)
      .values({
        userId: session.user.id,
        ...validatedData
      })
      .returning();

    // Create notification for admins
    await db.insert(notifications).values({
      title: 'New Custom Tour Request',
      message: `${session.user.name || session.user.email} has submitted a new custom tour request for ${validatedData.destination}`,
      type: 'custom_tour_request',
      priority: 'normal',
      relatedEntityType: 'custom_tour_request',
      relatedEntityId: newRequest.id,
      metadata: {
        userId: session.user.id,
        destination: validatedData.destination,
        groupSize: validatedData.groupSize,
        budgetRange: validatedData.budgetRange
      }
    });

    return NextResponse.json(
      {
        message: 'Custom tour request submitted successfully',
        requestId: newRequest.id
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating custom tour request:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create request' },
      { status: 500 }
    );
  }
}
