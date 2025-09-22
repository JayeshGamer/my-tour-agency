import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { tours, reviews, users } from '@/lib/db/schema';
import { eq, sql, and, ne } from 'drizzle-orm';
import ImageGallery from '@/components/tours/ImageGallery';
import BookingSection from '@/components/tours/BookingSection';
import ReviewsSection from '@/components/tours/ReviewsSection';
import RelatedTours from '@/components/tours/RelatedTours';
import { Star, MapPin, Clock, Users, IndianRupee, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface TourDetailsPageProps {
  params: Promise<{
    tourId: string;
  }>;
}

async function getTourDetails(tourId: string) {
  try {
    const tour = await db
      .select()
      .from(tours)
      .where(eq(tours.id, tourId))
      .limit(1);

    if (tour.length === 0) {
      return null;
    }

    // Get reviews with user information
    const tourReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        title: reviews.title,
        createdAt: reviews.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.tourId, tourId))
      .orderBy(sql`${reviews.createdAt} DESC`);

    // Calculate average rating
    const avgRating = tourReviews.length > 0
      ? tourReviews.reduce((acc, review) => acc + review.rating, 0) / tourReviews.length
      : 0;

    // Get related tours (same category, different tour)
    const relatedTours = await db
      .select()
      .from(tours)
      .where(
        and(
          eq(tours.category, tour[0].category),
          ne(tours.id, tourId),
          eq(tours.status, 'Active')
        )
      )
      .limit(3);

    return {
      tour: tour[0],
      reviews: tourReviews,
      avgRating,
      totalReviews: tourReviews.length,
      relatedTours,
    };
  } catch (error) {
    console.error('Error fetching tour details:', error);
    return null;
  }
}

export default async function TourDetailsPage({ params }: TourDetailsPageProps) {
  const { tourId } = await params;
  const tourData = await getTourDetails(tourId);

  if (!tourData) {
    notFound();
  }

  const { tour, reviews: tourReviews, avgRating, totalReviews, relatedTours } = tourData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Image Gallery and Tour Info */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="w-full">
              <ImageGallery images={tour.images as string[]} mainImage={tour.imageUrl} />
            </div>

            {/* Tour Information */}
            <div className="space-y-6">
              {/* Tour Name and Basic Info */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{tour.name}</h1>
                <h2 className="text-xl text-gray-600 mb-4">{tour.title}</h2>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{tour.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{tour.duration} days</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>Max {tour.maxGroupSize} people</span>
                  </div>
                </div>

                {/* Rating */}
                {totalReviews > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(avgRating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {avgRating.toFixed(1)} ({totalReviews} reviews)
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-2 mb-6">
                  <IndianRupee className="w-6 h-6 text-green-600" />
                  <span className="text-3xl font-bold text-gray-900">
                    {formatCurrency(tour.pricePerPerson)}
                  </span>
                  <span className="text-gray-600">per person</span>
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-6">{tour.description}</p>

                {/* Tour Highlights */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900">Tour Highlights</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {(tour.itinerary as Array<{day: number; title: string; description: string}>).slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <span className="font-medium">Day {item.day}:</span> {item.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Section */}
      <div className="bg-white mt-8 shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <BookingSection tour={tour} />
        </div>
      </div>

      {/* Detailed Information Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* What's Included */}
            <div>
              <h3 className="text-xl font-semibold mb-4">What&apos;s Included</h3>
              <ul className="space-y-2">
                {(tour.included as string[]).map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What's Not Included */}
            <div>
              <h3 className="text-xl font-semibold mb-4">What&apos;s Not Included</h3>
              <ul className="space-y-2">
                {(tour.notIncluded as string[]).map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Full Itinerary */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Full Itinerary</h3>
            <div className="space-y-4">
              {(tour.itinerary as Array<{day: number; title: string; description: string}>).map((day, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold">Day {day.day}: {day.title}</span>
                  </div>
                  <p className="text-gray-600">{day.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="container mx-auto px-4 py-8">
        <ReviewsSection 
          tourId={tourId}
          reviews={tourReviews}
          avgRating={avgRating}
          totalReviews={totalReviews}
        />
      </div>

      {/* Related Tours */}
      {relatedTours.length > 0 && (
        <div className="bg-gray-100 py-12">
          <div className="container mx-auto px-4">
            <RelatedTours tours={relatedTours} />
          </div>
        </div>
      )}
    </div>
  );
}
