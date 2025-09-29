import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reviews, users, tours } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    // Fetch featured reviews with high ratings (4-5 stars) for testimonials
    const testimonials = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        title: reviews.title,
        createdAt: reviews.createdAt,
        user: {
          name: users.name,
          firstName: users.firstName,
          lastName: users.lastName,
        },
        tour: {
          name: tours.name,
          location: tours.location,
        },
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .innerJoin(tours, eq(reviews.tourId, tours.id))
      .where(eq(reviews.rating, 5)) // Only 5-star reviews for testimonials
      .orderBy(desc(reviews.createdAt))
      .limit(3); // Get top 3 testimonials

    // If no reviews in database, return mock testimonials (only 3 for better layout)
    if (testimonials.length === 0) {
      const mockTestimonials = [
        {
          id: '1',
          rating: 5,
          comment: 'The best trip experience I have ever had! The guide was knowledgeable and the scenery was breathtaking. Every moment was perfect.',
          title: 'Absolutely Amazing Adventure',
          createdAt: new Date(),
          user: {
            name: 'Sarah Johnson',
            firstName: 'Sarah',
            lastName: 'Johnson',
          },
          tour: {
            name: 'Swiss Alps Adventure',
            location: 'Switzerland',
          },
        },
        {
          id: '2',
          rating: 5,
          comment: 'Outstanding service and unforgettable memories! The cultural immersion was exactly what I was looking for. Highly recommend!',
          title: 'Cultural Journey of a Lifetime',
          createdAt: new Date(),
          user: {
            name: 'Michael Chen',
            firstName: 'Michael',
            lastName: 'Chen',
          },
          tour: {
            name: 'Japanese Cultural Journey',
            location: 'Japan',
          },
        },
        {
          id: '3',
          rating: 5,
          comment: 'Incredible wildlife and professional guides made this safari unforgettable. Saw the Big Five and learned so much about conservation.',
          title: 'Safari Dreams Come True',
          createdAt: new Date(),
          user: {
            name: 'Emma Thompson',
            firstName: 'Emma',
            lastName: 'Thompson',
          },
          tour: {
            name: 'Kenya Safari Adventure',
            location: 'Kenya',
          },
        },
      ];
      
      return NextResponse.json(mockTestimonials);
    }

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}
