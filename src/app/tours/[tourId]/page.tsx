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

// Helper function to generate complete itinerary based on tour duration
function generateCompleteItinerary(storedItinerary: Array<{day: number; title: string; description: string}>, tourDuration: number) {
  const completeItinerary: Array<{day: number; title: string; description: string}> = [];

  for (let day = 1; day <= tourDuration; day++) {
    // Find existing itinerary item for this day
    const existingDay = storedItinerary.find(item => item.day === day);

    if (existingDay) {
      completeItinerary.push(existingDay);
    } else {
      // Generate a default itinerary item for missing days
      completeItinerary.push({
        day: day,
        title: `Day ${day} Activities`,
        description: `Experience amazing activities and exploration on day ${day} of your tour. Details will be provided upon booking confirmation.`
      });
    }
  }

  return completeItinerary;
}

export default async function TourDetailsPage({ params }: TourDetailsPageProps) {
  const { tourId } = await params;

  const tourData = await getTourDetails(tourId);

  if (!tourData) {
    notFound();
  }

  const { tour, reviews, avgRating, totalReviews, relatedTours } = tourData;

  // Generate complete itinerary
  const completeItinerary = generateCompleteItinerary(tour.itinerary || [], tour.duration);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative">
        <ImageGallery images={tour.images || [tour.imageUrl].filter(Boolean)} />

        {/* Tour Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{tour.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {tour.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {tour.duration} days
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Max {tour.maxGroupSize} people
                  </div>
                </div>

                {/* Rating */}
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
                  <span className="text-sm font-medium text-gray-700">
                    {avgRating.toFixed(1)} ({totalReviews} reviews)
                  </span>
                </div>

                {/* Category and Difficulty */}
                <div className="flex gap-2 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {tour.category}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    tour.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    tour.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {tour.difficulty}
                  </span>
                </div>
              </div>

              {/* Price and Booking */}
              <div className="lg:w-80">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-gray-900 flex items-center justify-center">
                      <IndianRupee className="w-8 h-8" />
                      {formatCurrency(tour.pricePerPerson || tour.price)}
                    </div>
                    <div className="text-sm text-gray-600">per person</div>
                  </div>

                  {tour.startDates && tour.startDates.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Available Dates
                      </h3>
                      <div className="space-y-1">
                        {tour.startDates.slice(0, 3).map((date, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            {new Date(date).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        ))}
                        {tour.startDates.length > 3 && (
                          <div className="text-sm text-gray-500">
                            +{tour.startDates.length - 3} more dates
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <BookingSection tour={tour} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tour Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Tour</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">{tour.description}</p>
              </div>
            </section>

            {/* Itinerary */}
            {completeItinerary.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Day by Day Itinerary</h2>
                <div className="space-y-4">
                  {completeItinerary.map((day) => (
                    <div key={day.day} className="bg-white rounded-lg border p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Day {day.day}: {day.title}
                      </h3>
                      <p className="text-gray-700">{day.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* What's Included/Not Included */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tour.included && tour.included.length > 0 && (
                  <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      Included
                    </h3>
                    <ul className="space-y-2">
                      {tour.included.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {tour.notIncluded && tour.notIncluded.length > 0 && (
                  <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <XCircle className="w-5 h-5 text-red-600 mr-2" />
                      Not Included
                    </h3>
                    <ul className="space-y-2">
                      {tour.notIncluded.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <XCircle className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>

            {/* Reviews */}
            <ReviewsSection tourId={tourId} reviews={reviews} avgRating={avgRating} totalReviews={totalReviews} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Tour Highlights */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tour Highlights</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-700">{tour.location}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-700">{tour.duration} days</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-700">Max {tour.maxGroupSize} people</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-700">{tour.difficulty} difficulty</span>
                </div>
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Have questions about this tour? Our travel experts are here to help.
              </p>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Contact Us
              </button>
            </div>
          </div>
        </div>

        {/* Related Tours */}
        {relatedTours.length > 0 && (
          <div className="mt-12">
            <RelatedTours tours={relatedTours} />
          </div>
        )}
      </div>
    </div>
  );
}
