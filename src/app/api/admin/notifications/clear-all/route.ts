import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

// DELETE /api/admin/notifications/clear-all - Delete all notifications for the current admin
export async function DELETE(request: NextRequest) {
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

    // Delete all notifications for the admin (or system-wide notifications)
    const result = await db
      .delete(notifications)
      .where(
        sql`${notifications.adminId} = ${adminId} OR ${notifications.adminId} IS NULL`
      )
      .returning();

    return NextResponse.json(
      { 
        success: true, 
        message: `Deleted ${result.length} notifications`,
        deletedCount: result.length
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error clearing all notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
