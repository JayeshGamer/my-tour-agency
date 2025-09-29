import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tours, notifications } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      title,
      description,
      location,
      duration,
      pricePerPerson,
      price,
      category,
      difficulty,
      maxGroupSize,
      startDates,
      included,
      notIncluded,
      itinerary
    } = body;

    // Validation
    if (!name || !title || !description || !location || !duration || !pricePerPerson) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!startDates || startDates.length === 0) {
      return NextResponse.json({ error: 'At least one start date is required' }, { status: 400 });
    }

    if (!included || included.length === 0) {
      return NextResponse.json({ error: 'Please specify what is included in the tour' }, { status: 400 });
    }

    // Create the tour with Inactive status (pending approval)
    const newTour = await db.insert(tours).values({
      name,
      title,
      description,
      location,
      duration,
      pricePerPerson: pricePerPerson.toString(),
      price: (price || pricePerPerson).toString(),
      category: category || 'Adventure',
      difficulty: difficulty || 'Moderate',
      maxGroupSize: maxGroupSize || 10,
      imageUrl: '/placeholder-tour.svg', // Default placeholder
      images: ['/placeholder-tour.svg'], // Default placeholder
      status: 'Inactive', // Pending approval
      startDates,
      included,
      notIncluded: notIncluded || [],
      itinerary: itinerary || [],
      featured: false,
      createdBy: session.user.id, // Track who created this tour
    }).returning();

    // Create notification for admins
    await db.insert(notifications).values({
      title: 'New Custom Tour Submission',
      message: `A new custom tour "${name}" has been submitted by ${session.user.email} and requires approval.`,
      type: 'tour_submission',
      priority: 'normal',
      relatedEntityType: 'tour',
      relatedEntityId: newTour[0].id,
      metadata: {
        tourName: name,
        location,
        submittedBy: session.user.email,
        submittedById: session.user.id,
      },
    });

    return NextResponse.json(newTour[0], { status: 201 });
  } catch (error) {
    console.error('Error creating custom tour:', error);
    return NextResponse.json(
      { error: 'Failed to create tour' },
      { status: 500 }
    );
  }
}
