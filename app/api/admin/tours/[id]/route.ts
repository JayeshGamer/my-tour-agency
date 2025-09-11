import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { tours } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const TourUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  title: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  location: z.string().min(2).optional(),
  duration: z.number().int().positive().optional(),
  pricePerPerson: z.number().positive().optional(),
  price: z.number().positive().optional(),
  category: z.string().min(2).optional(),
  difficulty: z.string().min(2).optional(),
  maxGroupSize: z.number().int().positive().optional(),
  imageUrl: z.string().url().optional().nullable(),
  images: z.array(z.string()).optional(),
  status: z.enum(["Active", "Inactive"]).optional(),
  startDates: z.array(z.string()).optional(),
  included: z.array(z.string()).optional(),
  notIncluded: z.array(z.string()).optional(),
  itinerary: z.array(z.object({
    day: z.number(),
    title: z.string(),
    description: z.string(),
  })).optional(),
  featured: z.boolean().optional(),
});

// GET /api/admin/tours/[id] - Get a specific tour
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const tourId = params.id;

    const tour = await db
      .select()
      .from(tours)
      .where(eq(tours.id, tourId))
      .limit(1);

    if (tour.length === 0) {
      return NextResponse.json(
        { error: 'Tour not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      tour: tour[0]
    });

  } catch (error) {
    console.error('Error fetching tour:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/tours/[id] - Update a specific tour
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const tourId = params.id;
    const body = await request.json();
    const validatedData = TourUpdateSchema.parse(body);

    // Update the tour
    const result = await db
      .update(tours)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(tours.id, tourId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Tour not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tour updated successfully',
      tour: result[0]
    });

  } catch (error) {
    console.error('Error updating tour:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/tours/[id] - Delete a specific tour
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const tourId = params.id;

    // Delete the tour
    const result = await db
      .delete(tours)
      .where(eq(tours.id, tourId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Tour not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tour deleted successfully',
      deletedTour: result[0]
    });

  } catch (error) {
    console.error('Error deleting tour:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
