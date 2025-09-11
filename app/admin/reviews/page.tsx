import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { reviews, users, tours } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ReviewsList from "@/components/admin/ReviewsList";
import { MessageSquare, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";

async function getReviewsData() {
  const reviewsData = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      status: reviews.status,
      createdAt: reviews.createdAt,
      userId: reviews.userId,
      tourId: reviews.tourId,
      userName: users.name,
      userEmail: users.email,
      userImage: users.image,
      tourTitle: tours.title
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .leftJoin(tours, eq(reviews.tourId, tours.id))
    .orderBy(desc(reviews.createdAt))
    .limit(100);

  // Get statistics - now using real status column
  const totalReviews = reviewsData.length;
  const pendingReviews = reviewsData.filter(r => r.status === 'pending').length;
  const approvedReviews = reviewsData.filter(r => r.status === 'approved').length;
  const rejectedReviews = reviewsData.filter(r => r.status === 'rejected').length;
  const averageRating = reviewsData.length > 0 ? 
    reviewsData.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewsData.length : 0;

  // Transform data to match expected format
  const transformedReviews = reviewsData.map(review => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    status: review.status,
    createdAt: review.createdAt,
    user: {
      id: review.userId,
      name: review.userName,
      email: review.userEmail,
      image: review.userImage
    },
    tour: {
      id: review.tourId,
      title: review.tourTitle
    }
  }));

  return {
    reviews: transformedReviews,
    stats: {
      total: totalReviews,
      pending: pendingReviews,
      approved: approvedReviews,
      rejected: rejectedReviews,
      averageRating: Math.round(averageRating * 10) / 10
    }
  };
}

export default async function ReviewsPage() {
  // Check authentication and admin role
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== 'Admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
          <p className="text-gray-600 mb-4">You do not have permission to access this area.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const data = await getReviewsData();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            Review Moderation
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and moderate customer reviews • {data.stats.pending} pending approval
          </p>
        </div>
        <Button variant="outline">
          Moderation Settings
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold">{data.stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{data.stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{data.stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{data.stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-blue-600">{data.stats.averageRating}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <ReviewsList reviews={data.reviews} />
    </div>
  );
}
