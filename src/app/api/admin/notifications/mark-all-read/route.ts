import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { sql, eq } from 'drizzle-orm';

// PATCH /api/admin/notifications/mark-all-read - Mark all notifications as read for the current admin
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user || session.user.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const adminId = session.user.id;

    // Update all unread notifications for the admin (or system-wide notifications)
    const result = await db
      .update(notifications)
      .set({ 
        isRead: true,
        updatedAt: new Date()
      })
      .where(
        sql`${notifications.isRead} = false AND (${notifications.adminId} = ${adminId} OR ${notifications.adminId} IS NULL)`
      )
      .returning();

    return NextResponse.json(
      { 
        success: true, 
        message: `Marked ${result.length} notifications as read`,
        updatedCount: result.length
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
