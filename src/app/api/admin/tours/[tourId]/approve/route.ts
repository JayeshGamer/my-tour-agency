import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tours, notifications, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tourId: string }> }
) {
  try {
    const { tourId } = await params; // Await the params promise

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userRow = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
    const isAdmin = userRow[0]?.role === 'Admin';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { action, reason } = body; // action: 'approve' | 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get the tour to find the creator
    const tour = await db
      .select()
      .from(tours)
      .where(eq(tours.id, tourId))
      .limit(1);

    if (!tour[0]) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    const tourData = tour[0];

    // Update tour status
    const newStatus = action === 'approve' ? 'Active' : 'Inactive';
    await db
      .update(tours)
      .set({
        status: newStatus,
        updatedAt: new Date()
      })
      .where(eq(tours.id, tourId));

    // Create notification for the tour creator
    const notificationTitle = action === 'approve'
      ? 'Tour Approved!'
      : 'Tour Submission Update';

    const notificationMessage = action === 'approve'
      ? `Great news! Your custom tour "${tourData.name}" has been approved and is now live. Users can start booking your tour.`
      : `Your custom tour "${tourData.name}" requires some changes. ${reason || 'Please contact support for more details.'}`;

    await db.insert(notifications).values({
      title: notificationTitle,
      message: notificationMessage,
      type: action === 'approve' ? 'tour_approved' : 'tour_rejected',
      priority: action === 'approve' ? 'normal' : 'high',
      relatedEntityType: 'tour',
      relatedEntityId: tourId,
      metadata: {
        tourName: tourData.name,
        action,
        reason: reason || null,
        reviewedBy: session.user.email,
      },
    });

    return NextResponse.json({
      message: `Tour ${action}d successfully`,
      tourId,
      status: newStatus
    });

  } catch (error) {
    console.error('Error updating tour status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
