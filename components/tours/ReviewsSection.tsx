'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Star, User, ThumbsUp, MessageSquare, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { DateDisplay } from '@/components/ui/DateDisplay';

interface Review {
  id: string;
  rating: number;
  comment: string;
  title: string | null;
  createdAt: Date;
  userName: string | null;
  userEmail: string | null;
}

interface ReviewsSectionProps {
  tourId: string;
  reviews: Review[];
  avgRating: number;
  totalReviews: number;
}

export default function ReviewsSection({ tourId, reviews: initialReviews, avgRating, totalReviews }: ReviewsSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sort and filter reviews
  const processedReviews = reviews
    .filter(review => filterRating === 'all' || review.rating === parseInt(filterRating))
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  const handleSubmitReview = async () => {
    if (!session) {
      toast.error('Please login to submit a review');
      router.push('/login');
      return;
    }

    if (!newReview.comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tourId,
          rating: newReview.rating,
          title: newReview.title || null,
          comment: newReview.comment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      const createdReview = await response.json();
      
      // Add the new review to the list
      const reviewWithUser: Review = {
        ...createdReview,
        userName: session.user?.name || 'Anonymous',
        userEmail: session.user?.email || '',
      };
      
      setReviews([reviewWithUser, ...reviews]);
      setNewReview({ rating: 5, title: '', comment: '' });
      setIsDialogOpen(false);
      toast.success('Review submitted successfully!');
      
      // Refresh the page to update average rating
      router.refresh();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Customer Reviews
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Write a Review</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Share Your Experience</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {/* Rating Selection */}
                <div>
                  <Label>Rating</Label>
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= newReview.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {newReview.rating} star{newReview.rating !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Review Title */}
                <div>
                  <Label htmlFor="review-title">Title (optional)</Label>
                  <Input
                    id="review-title"
                    value={newReview.title}
                    onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                    placeholder="Summarize your experience"
                    className="mt-1"
                  />
                </div>

                {/* Review Comment */}
                <div>
                  <Label htmlFor="review-comment">Your Review</Label>
                  <Textarea
                    id="review-comment"
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Tell us about your experience..."
                    className="mt-1 min-h-[120px]"
                    required
                  />
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || !newReview.comment.trim()}
                  className="w-full"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</div>
            <div className="flex items-center justify-center mt-2">
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
            <p className="text-sm text-gray-600 mt-1">
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="col-span-2 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm w-8">{rating}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full transition-all"
                    style={{
                      width: `${totalReviews > 0 ? (ratingDistribution[rating as keyof typeof ratingDistribution] / totalReviews) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {ratingDistribution[rating as keyof typeof ratingDistribution]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap gap-4 items-center border-t border-b py-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Label htmlFor="filter-rating" className="text-sm">Filter by:</Label>
            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger id="filter-rating" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="sort-reviews" className="text-sm">Sort by:</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id="sort-reviews" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Rating</SelectItem>
                <SelectItem value="lowest">Lowest Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {processedReviews.length > 0 ? (
            processedReviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-0">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {review.userName ? review.userName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{review.userName || 'Anonymous'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <DateDisplay 
                            date={review.createdAt} 
                            format="long" 
                            className="text-sm text-gray-500" 
                          />
                        </div>
                      </div>
                    </div>
                    {review.title && (
                      <h4 className="font-semibold mt-2">{review.title}</h4>
                    )}
                    <p className="text-gray-700 mt-2">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {filterRating === 'all' 
                ? 'No reviews yet. Be the first to share your experience!'
                : `No ${filterRating}-star reviews found.`}
            </div>
          )}
        </div>

        {/* Load More Button */}
        {processedReviews.length > 5 && (
          <div className="text-center">
            <Button variant="outline">
              See All {processedReviews.length} Reviews
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
