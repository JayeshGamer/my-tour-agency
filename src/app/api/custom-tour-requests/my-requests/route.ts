import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { customTourRequests } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET - Fetch current user's custom tour requests (REAL DATA ONLY)
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
      // Fetch REAL data from database - NO MOCK DATA
      const userRequests = await db
        .select()
        .from(customTourRequests)
        .where(eq(customTourRequests.userId, session.user.id))
        .orderBy(customTourRequests.createdAt);

      return NextResponse.json({
        requests: userRequests || [],
        total: userRequests?.length || 0
      });

    } catch (dbError) {
      console.error('Database error fetching requests:', dbError);

      // Return empty array if database error - NO MOCK DATA FALLBACK
      return NextResponse.json({
        requests: [],
        total: 0,
        error: 'Database connection issue'
      });
    }

  } catch (error) {
    console.error('Error fetching user requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}
