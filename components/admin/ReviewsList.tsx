"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Star, 
  MoreHorizontal,
  Check,
  X,
  Eye,
  Trash2,
  MessageSquare
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ReviewData {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  status: "pending" | "approved" | "rejected";
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  tour: {
    id: string;
    title: string;
  };
}

interface ReviewsListProps {
  reviews: ReviewData[];
}

const getStatusBadge = (status: string) => {
  const variants = {
    pending: { variant: "secondary" as const, label: "Pending" },
    approved: { variant: "default" as const, label: "Approved" },
    rejected: { variant: "destructive" as const, label: "Rejected" }
  };
  
  const config = variants[status as keyof typeof variants] || variants.pending;
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">{rating}/5</span>
    </div>
  );
};

const getUserInitials = (name: string | null, email: string) => {
  if (name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
  return email[0].toUpperCase();
};

export default function ReviewsList({ reviews }: ReviewsListProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleUpdateStatus = async (reviewId: string, status: "approved" | "rejected") => {
    setIsProcessing(reviewId);
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update review status');
      }

      toast.success(`Review ${status} successfully`);
      router.refresh();
    } catch (error: any) {
      console.error('Error updating review status:', error);
      toast.error(error.message || 'Failed to update review status');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    setIsProcessing(reviewId);
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      toast.success('Review deleted successfully');
      router.refresh();
    } catch (error: any) {
      console.error('Error deleting review:', error);
      toast.error(error.message || 'Failed to delete review');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Reviews ({reviews.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Tour</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={review.user.image || ""} alt={review.user.name || review.user.email} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getUserInitials(review.user.name, review.user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium text-sm">
                          {review.user.name || review.user.email.split('@')[0]}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {review.user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm truncate max-w-32" title={review.tour.title}>
                      {review.tour.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StarRating rating={review.rating} />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm max-w-48 truncate" title={review.comment}>
                      {review.comment}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(review.status)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          disabled={isProcessing === review.id}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        
                        {review.status !== "approved" && (
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(review.id, "approved")}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                        )}
                        
                        {review.status !== "rejected" && (
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(review.id, "rejected")}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Reject
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteReview(review.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Review
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600">No reviews found</h3>
                  <p className="text-gray-500 mt-2">Customer reviews will appear here when submitted.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
