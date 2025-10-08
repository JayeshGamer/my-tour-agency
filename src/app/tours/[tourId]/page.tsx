import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { tours, reviews, users } from '@/lib/db/schema';
import { eq, sql, and, ne } from 'drizzle-orm';
import ImageGallery from '@/components/tours/ImageGallery';
import BookingSection from '@/components/tours/BookingSection';
import ReviewsSection from '@/components/tours/ReviewsSection';
import RelatedTours from '@/components/tours/RelatedTours';
import { Star, MapPin, Clock, Users, IndianRupee, Calendar, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Main Content Container - Efficient Desktop Grid */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">

          {/* Left Column - Main Content (8 columns - wider for content) */}
          <div className="col-span-8 space-y-6">

            {/* Image Gallery - Now integrated into main content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <ImageGallery images={tour.images || [tour.imageUrl].filter(Boolean)} />
            </div>

            {/* Title and Tags Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                {tour.name}
              </h1>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  {tour.category}
                </span>
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${
                  tour.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border-green-200' :
                  tour.difficulty === 'Moderate' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {tour.difficulty}
                </span>
                <span className="inline-flex items-center px-3 py-1 bg-gray-50 text-gray-700 text-sm font-medium rounded-full border border-gray-200">
                  <Users className="w-4 h-4 mr-2" />
                  Max {tour.maxGroupSize} people
                </span>
              </div>

              {/* Description */}
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-base">
                  {tour.description}
                </p>
              </div>
            </div>

            {/* Day by Day Itinerary */}
            {completeItinerary.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-6 h-6 text-blue-600 mr-2" />
                  Day by Day Itinerary
                </h2>
                <div className="space-y-3">
                  {completeItinerary.map((day, index) => (
                    <div
                      key={day.day}
                      className="relative pl-6 pb-6 border-l-2 border-blue-100 last:border-l-0 last:pb-0"
                    >
                      {/* Day number badge */}
                      <div className="absolute -left-4 top-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                        {day.day}
                      </div>

                      <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {day.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {day.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What's Included Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                What's Included
              </h2>
              <div className="grid grid-cols-2 gap-4">

                {/* Included Items */}
                {tour.included && tour.included.length > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-2">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Included</h3>
                    </div>
                    <ul className="space-y-2">
                      {tour.included.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Not Included Items */}
                {tour.notIncluded && tour.notIncluded.length > 0 && (
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-2">
                        <XCircle className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Not Included</h3>
                    </div>
                    <ul className="space-y-2">
                      {tour.notIncluded.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <XCircle className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <ReviewsSection tourId={tourId} reviews={reviews} avgRating={avgRating} totalReviews={totalReviews} />
          </div>

          {/* Right Column - Compact Booking Sidebar (4 columns - narrower) */}
          <div className="col-span-4">
            <div className="space-y-4 sticky top-4">

              {/* Booking Card - Compact */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Price Header - Compact */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
                  <div className="text-center">
                    <div className="text-xs font-medium mb-1 opacity-90">From</div>
                    <div className="text-3xl font-bold flex items-center justify-center">
                      <IndianRupee className="w-7 h-7" />
                      {formatCurrency(tour.pricePerPerson || tour.price)}
                    </div>
                    <div className="text-xs mt-1 opacity-90">per person</div>
                  </div>
                </div>

                {/* Available Dates - Compact */}
                {tour.startDates && tour.startDates.length > 0 && (
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-blue-600" />
                      Available Dates
                    </h3>
                    <div className="space-y-1">
                      {tour.startDates.slice(0, 2).map((date, index) => (
                        <div
                          key={index}
                          className="flex items-center text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded"
                        >
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                          {new Date(date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      ))}
                      {tour.startDates.length > 2 && (
                        <div className="text-xs text-blue-600 font-medium pl-3">
                          +{tour.startDates.length - 2} more dates
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Booking Form - Compact */}
                <div className="p-4">
                  <div className="text-xs text-gray-600 mb-2">Choose date and options</div>
                  <BookingSection tour={tour} noCard />
                </div>
              </div>

              {/* Quick Info Card - Compact */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                  <Star className="w-4 h-4 text-blue-600 mr-1" />
                  Quick Info
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-2 shadow-sm">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Location</div>
                      <div className="text-sm font-semibold text-gray-900">{tour.location}</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-2 shadow-sm">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Duration</div>
                      <div className="text-sm font-semibold text-gray-900">{tour.duration} days</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-2 shadow-sm">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Group Size</div>
                      <div className="text-sm font-semibold text-gray-900">Max {tour.maxGroupSize}</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-2 shadow-sm">
                      <Star className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Difficulty</div>
                      <div className="text-sm font-semibold text-gray-900">{tour.difficulty}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Help Card - Compact */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Need Help?</h3>
                  <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                    Questions? Our experts are here 24/7.
                  </p>
                  <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg">
                    Contact Us
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Tours Section */}
        {relatedTours.length > 0 && (
          <div className="mt-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  You Might Also Like
                </h2>
              <p className="text-gray-600">
                  Explore similar experiences that match your interests
                </p>
            </div>
            <RelatedTours tours={relatedTours} />
          </div>
        )}
      </div>
    </div>
  );
}
