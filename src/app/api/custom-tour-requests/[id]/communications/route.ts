import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tourRequestCommunications, customTourRequests, users, notifications } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

interface RouteParams {
  params: {
    id: string;
  };
}

const messageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  isInternal: z.boolean().default(false),
  attachments: z.array(z.string()).optional()
});

// GET - Fetch communications for a request
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: requestId } = params;
    const isAdmin = session.user.role === 'Admin';

    // First check if user has access to this request
    const [tourRequest] = await db
      .select()
      .from(customTourRequests)
      .where(eq(customTourRequests.id, requestId));

    if (!tourRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Non-admin users can only access their own requests
    if (!isAdmin && tourRequest.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch communications without passing `undefined` into `and`.
    // Use `unknown[]` instead of `any[]` to satisfy eslint rule against `any`.
    const commConditions: unknown[] = [eq(tourRequestCommunications.requestId, requestId)];
    if (!isAdmin) commConditions.push(eq(tourRequestCommunications.isInternal, false));

    const commQuery = db
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
      communications = await commQuery.where(commConditions[0]).orderBy(desc(tourRequestCommunications.createdAt));
    } else {
      communications = await commQuery.where(and(...commConditions)).orderBy(desc(tourRequestCommunications.createdAt));
    }

    return NextResponse.json({ communications });

  } catch (error) {
    console.error('Error fetching communications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communications' },
      { status: 500 }
    );
  }
}

// POST - Add new communication message
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: requestId } = params;
    const isAdmin = session.user.role === 'Admin';
    const body = await request.json();
    const validatedData = messageSchema.parse(body);

    // Check if user has access to this request
    const [tourRequest] = await db
      .select()
      .from(customTourRequests)
      .where(eq(customTourRequests.id, requestId));

    if (!tourRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Non-admin users can only communicate on their own requests
    if (!isAdmin && tourRequest.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Only admins can send internal messages
    if (validatedData.isInternal && !isAdmin) {
      return NextResponse.json({ error: 'Only admins can send internal messages' }, { status: 403 });
    }

    // Create the communication
    const [newCommunication] = await db
      .insert(tourRequestCommunications)
      .values({
        requestId,
        senderId: session.user.id,
        message: validatedData.message,
        isInternal: validatedData.isInternal,
        attachments: validatedData.attachments
      })
      .returning();

    // Create notification for the other party (if not internal message)
    if (!validatedData.isInternal) {
      const notificationRecipient = isAdmin ? tourRequest.userId : null; // Send to customer if admin sent, to all admins if customer sent

      await db.insert(notifications).values({
        title: isAdmin ? 'New Message from Support' : 'New Customer Message',
        message: `${isAdmin ? 'Support team' : session.user.name || 'Customer'} sent a message regarding custom tour request for ${tourRequest.destination}`,
        type: 'communication',
        priority: 'normal',
        adminId: notificationRecipient,
        relatedEntityType: 'custom_tour_request',
        relatedEntityId: requestId,
        metadata: {
          requestId,
          messagePreview: validatedData.message.substring(0, 100),
          senderId: session.user.id,
          senderName: session.user.name || session.user.email
        }
      });
    }

    return NextResponse.json({
      message: 'Message sent successfully',
      communicationId: newCommunication.id
    });

  } catch (error) {
    console.error('Error sending message:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid message data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
