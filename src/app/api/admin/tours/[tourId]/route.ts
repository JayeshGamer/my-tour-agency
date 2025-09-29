import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { tours } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Allow decimals as string or number and normalize later
const DecimalSchema = z.union([z.string(), z.number()]).optional();

const TourUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  title: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  location: z.string().min(2).optional(),
  duration: z.number().int().positive().optional(),
  pricePerPerson: DecimalSchema,
  price: DecimalSchema,
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

function normalizeDecimal(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return value.toFixed(2);
  return value; // assume already string like "123.45"
}

// GET /api/admin/tours/[tourId] - Get a specific tour
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tourId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user || session.user.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { tourId } = await params;

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

// PUT /api/admin/tours/[tourId] - Update a specific tour
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tourId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user || session.user.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { tourId } = await params;
    const body = await request.json();
    const validatedData = TourUpdateSchema.parse(body);

    const updatePayload = {
      ...validatedData,
      // normalize decimal fields to strings for Drizzle decimal columns
      pricePerPerson: normalizeDecimal(validatedData.pricePerPerson),
      price: normalizeDecimal(validatedData.price),
      updatedAt: new Date(),
    } as const;

    const result = await db
      .update(tours)
      .set(updatePayload)
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
        { error: 'Validation error', issues: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/tours/[tourId] - Delete a specific tour
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tourId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user || session.user.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { tourId } = await params;

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
