"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Star, Check, X, MessageSquare } from "lucide-react";
import { toast } from "react-hot-toast";

interface ReviewModerationProps {
  reviews: Array<{
    review: {
      id: string;
      rating: number;
      title: string | null;
      comment: string;
      createdAt: Date;
    };
    user: {
      id: string;
      email: string;
      name: string | null;
    };
    tour: {
      id: string;
      name: string;
    };
  }>;
}

export default function ReviewModeration({ reviews }: ReviewModerationProps) {
  const [processingReviews, setProcessingReviews] = useState<Set<string>>(new Set());

  const handleApprove = async (reviewId: string) => {
    setProcessingReviews(prev => new Set(prev).add(reviewId));
    
    try {
      // In production, call API to approve review
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Review approved successfully");
    } catch (error) {
      toast.error("Failed to approve review");
    } finally {
      setProcessingReviews(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }
  };

  const handleReject = async (reviewId: string) => {
    setProcessingReviews(prev => new Set(prev).add(reviewId));
    
    try {
      // In production, call API to reject review
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Review rejected");
    } catch (error) {
      toast.error("Failed to reject review");
    } finally {
      setProcessingReviews(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-3 w-3 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            📝 Review Moderation
          </CardTitle>
          <Badge variant="secondary">{reviews.length} Pending</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {reviews.map((item) => {
              const isProcessing = processingReviews.has(item.review.id);
              
              return (
                <div
                  key={item.review.id}
                  className="p-4 border rounded-lg bg-gray-50 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {item.user.name || item.user.email.split("@")[0]}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <div className="flex items-center">{renderStars(item.review.rating)}</div>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Tour: <span className="font-medium">{item.tour.name}</span>
                      </p>
                      {item.review.title && (
                        <h4 className="font-medium text-sm mb-1">{item.review.title}</h4>
                      )}
                      <p className="text-sm text-gray-700">{item.review.comment}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => handleApprove(item.review.id)}
                      disabled={isProcessing}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => handleReject(item.review.id)}
                      disabled={isProcessing}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {reviews.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No pending reviews
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
