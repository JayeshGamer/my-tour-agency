import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { tours } from '@/lib/db/schema';
import { z } from 'zod';

const TourSchema = z.object({
  name: z.string().min(2),
  title: z.string().min(2),
  description: z.string().min(10),
  location: z.string().min(2),
  duration: z.number().int().positive(),
  pricePerPerson: z.number().positive(),
  price: z.number().positive(),
  category: z.string().min(2),
  difficulty: z.string().min(2),
  maxGroupSize: z.number().int().positive(),
  imageUrl: z.string().url().optional().nullable(),
  images: z.array(z.string()).default([]),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  startDates: z.array(z.string()).default([]),
  included: z.array(z.string()).default([]),
  notIncluded: z.array(z.string()).default([]),
  itinerary: z.array(z.object({
    day: z.number(),
    title: z.string(),
    description: z.string(),
  })).default([]),
  featured: z.boolean().default(false),
});

// POST /api/admin/tours - Create a new tour
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = TourSchema.parse(body);

    // Create the tour
    const result = await db
      .insert(tours)
      .values({
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(
      { 
        success: true, 
        message: 'Tour created successfully',
        tour: result[0]
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating tour:', error);
    
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

// GET /api/admin/tours - Get all tours for admin
export async function GET(request: NextRequest) {
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

    const toursData = await db
      .select()
      .from(tours)
      .orderBy(tours.createdAt);

    return NextResponse.json({
      success: true,
      tours: toursData
    });

  } catch (error) {
    console.error('Error fetching tours:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
