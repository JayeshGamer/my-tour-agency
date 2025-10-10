import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { reviews, users, tours } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { RainbowButton } from "@/components/ui/rainbow-button";
import ReviewsList from "@/components/admin/ReviewsList";
import { MessageSquare, CheckCircle, XCircle, Clock, TrendingUp, Sparkles, Star, Download, Filter } from "lucide-react";
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
      title: review.tourTitle || "Unknown Tour"
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Unauthorized Access</h1>
          <p className="text-muted-foreground mb-4">You do not have permission to access this area.</p>
          <Link href="/" className="text-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const data = await getReviewsData();

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Enhanced Page Header with gradient */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-sky-500/5 to-transparent rounded-3xl blur-3xl" />
        <div className="relative space-y-3 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />
                  <div className="relative bg-gradient-to-br from-cyan-500/10 to-sky-500/10 p-3 rounded-2xl border border-cyan-500/20 backdrop-blur-sm">
                    <Star className="h-8 w-8 text-cyan-600 fill-cyan-600" />
                  </div>
                </div>
                <div>
                  <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-cyan-600 to-sky-600 bg-clip-text text-transparent">
                    Reviews & Ratings
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Sparkles className="h-4 w-4 text-cyan-600" />
                    <p className="text-muted-foreground font-medium">
                      Manage customer feedback • {data.stats.pending} awaiting approval
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <RainbowButton variant="purple" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </RainbowButton>
              <RainbowButton variant="green" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </RainbowButton>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Stats with Animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Reviews Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Reviews</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-foreground">{data.stats.total}</p>
                </div>
                <p className="text-xs text-muted-foreground">All feedback</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full" />
                <div className="relative bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                  <MessageSquare className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Pending Reviews Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pending</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-orange-600">{data.stats.pending}</p>
                </div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/20 blur-lg rounded-full" />
                <div className="relative bg-orange-500/10 p-3 rounded-xl border border-orange-500/20">
                  <Clock className="h-7 w-7 text-orange-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Approved Reviews Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Approved</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-green-600">{data.stats.approved}</p>
                </div>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 blur-lg rounded-full" />
                <div className="relative bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                  <CheckCircle className="h-7 w-7 text-green-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Rejected Reviews Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Rejected</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-red-600">{data.stats.rejected}</p>
                </div>
                <p className="text-xs text-muted-foreground">Declined</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 blur-lg rounded-full" />
                <div className="relative bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  <XCircle className="h-7 w-7 text-red-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Average Rating Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Avg Rating</p>
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold bg-gradient-to-br from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {data.stats.averageRating}
                  </p>
                  <span className="text-sm text-muted-foreground">/5.0</span>
                </div>
                <p className="text-xs text-muted-foreground">Overall rating</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/20 blur-lg rounded-full" />
                <div className="relative bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                  <TrendingUp className="h-7 w-7 text-amber-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <div className="pb-8">
        <ReviewsList reviews={data.reviews} />
      </div>
    </div>
  );
}
