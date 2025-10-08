"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Heart, Star, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { RatingStars } from "@/components/ui/rating-stars";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Tour {
  id: string;
  name?: string;
  title?: string;
  description: string;
  price?: string;
  pricePerPerson?: string;
  duration: number;
  maxGroupSize: number;
  location: string;
  difficulty: string;
  images: string[];
  imageUrl?: string | null;
  featured: boolean;
  discount?: number;
  isNew?: boolean;
  isPopular?: boolean;
}

interface TourListCardProps {
  tour: Tour;
}

export function TourListCard({ tour }: TourListCardProps) {
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const tourName = tour.name || tour.title || "Unnamed Tour";
  const price = tour.pricePerPerson || tour.price || "0";
  const imageUrl = tour.images?.[0] || tour.imageUrl || "/images/tours/placeholder-tour.svg";

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const newValue = !isWishlisted;
      const response = await fetch('/api/wishlist', {
        method: newValue ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourId: tour.id }),
      });

      if (!response.ok) throw new Error('Failed to update wishlist');

      setIsWishlisted(newValue);
      toast.success(newValue ? `Added to wishlist` : `Removed from wishlist`);
    } catch (error) {
      toast.error("Could not update wishlist");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Link href={`/tours/${tour.id}`}>
      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 group border-2 border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-400 bg-white dark:bg-gray-900">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="relative w-full md:w-80 h-64 md:h-auto overflow-hidden flex-shrink-0">
            <img
              src={imageUrl}
              alt={tourName}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {tour.featured && (
                <Badge className="bg-yellow-500 text-white hover:bg-yellow-600 border-0 shadow-lg">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Featured
                </Badge>
              )}
              {tour.discount && (
                <Badge className="bg-red-500 text-white hover:bg-red-600 border-0 shadow-lg font-bold">
                  {tour.discount}% OFF
                </Badge>
              )}
              {tour.isNew && (
                <Badge className="bg-green-500 text-white hover:bg-green-600 border-0 shadow-lg">
                  <Sparkles className="h-3 w-3 mr-1" />
                  New
                </Badge>
              )}
              {tour.isPopular && (
                <Badge className="bg-blue-500 text-white hover:bg-blue-600 border-0 shadow-lg">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              )}
            </div>

            {/* Wishlist Button */}
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 shadow-lg backdrop-blur-sm"
              onClick={handleWishlistToggle}
              disabled={isUpdating}
            >
              <Heart className={cn(
                "h-5 w-5 transition-colors",
                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-900 dark:text-white"
              )} />
            </Button>
          </div>

          {/* Content Section */}
          <CardContent className="flex-1 p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {tourName}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <RatingStars rating={4.7} size="sm" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    (128 reviews)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">From</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(parseFloat(price))}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">per person</p>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
              {tour.description}
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span>{tour.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                <span>{tour.duration} Days</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span>Max {tour.maxGroupSize} people</span>
              </div>
              <Badge variant="outline" className="font-semibold">
                {tour.difficulty}
              </Badge>
            </div>

            <div className="flex gap-3 pt-2">
              <Button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 font-semibold group/btn">
                View Details
                <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" className="border-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                Quick Book
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}