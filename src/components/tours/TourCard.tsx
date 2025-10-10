"use client";

import { useState } from "react";
// Use regular <img> to avoid next/image srcset/sizes for desktop-only project
import Link from "next/link";
import { MapPin, Clock, Users, Heart, Star, TrendingUp, Sparkles } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/ui/rating-stars";
import toast from "react-hot-toast";
import { formatCurrency } from "@/lib/currency";

// Tour interface that matches database schema
interface Tour {
  id: string;
  name: string;
  title: string;
  description: string;
  pricePerPerson: string;
  price: string;
  duration: number;
  maxGroupSize: number;
  difficulty: string;
  location: string;
  category: string;
  startDates: string[];
  images: string[];
  imageUrl: string | null;
  included: string[];
  notIncluded: string[];
  itinerary: Array<{day: number; title: string; description: string}>;
  featured: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  discount?: number;
  isNew?: boolean;
  isPopular?: boolean;
}

interface TourCardProps {
  tour: Tour;
}

export function TourCard({ tour }: TourCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const newValue = !isWishlisted;
      
      const response = await fetch('/api/wishlist', {
        method: newValue ? 'POST' : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tourId: tour.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to update wishlist');
      }

      setIsWishlisted(newValue);
      toast.success(
        newValue 
          ? `${tour.name} added to wishlist` 
          : `${tour.name} removed from wishlist`
      );
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error("Could not update wishlist. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 group relative cursor-pointer border-2 border-gray-200 dark:border-gray-800 hover:border-gray-900 dark:hover:border-white bg-white dark:bg-gray-900">
      {/* Labels/Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {tour.featured && (
          <Badge className="bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 border-0 shadow-lg font-semibold">
            <Star className="h-3 w-3 mr-1 fill-current" />
            Featured
          </Badge>
        )}
        {tour.discount && (
          <Badge className="bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 border-0 shadow-lg font-bold">
            {tour.discount}% OFF
          </Badge>
        )}
        {tour.isNew && (
          <Badge className="bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 border-0 shadow-lg font-semibold">
            <Sparkles className="h-3 w-3 mr-1 fill-current" />
            New
          </Badge>
        )}
        {tour.isPopular && (
          <Badge className="bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 border-0 shadow-lg font-semibold">
            <TrendingUp className="h-3 w-3 mr-1" />
            Popular
          </Badge>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        disabled={isUpdating}
        className="absolute top-4 right-4 z-10 p-2.5 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 shadow-lg group/heart disabled:opacity-50"
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          className={`h-5 w-5 transition-all duration-200 ${
            isWishlisted
              ? "fill-gray-900 text-gray-900 dark:fill-white dark:text-white"
              : "text-gray-700 dark:text-gray-300 group-hover/heart:text-gray-900 dark:group-hover/heart:text-white"
          }`}
        />
      </button>

      {/* Tour Image - Clickable to view details */}
      <Link href={`/tours/${tour.id}`} className="block">
        <div className="relative h-64 overflow-hidden">
          <img
            src={tour.imageUrl || (tour.images && tour.images[0]) || "/placeholder-tour.svg"}
            alt={tour.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-tour.svg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Difficulty Badge on Image */}
          <div className="absolute bottom-4 left-4">
            <Badge
              className="bg-white/90 text-gray-900 dark:bg-gray-900/90 dark:text-white border-0 shadow-lg font-semibold backdrop-blur-sm"
            >
              {tour.difficulty}
            </Badge>
          </div>
        </div>
      </Link>

      <CardContent className="p-6">
        {/* Tour Name - Clickable */}
        <Link href={`/tours/${tour.id}`} className="block">
          <h3 className="font-bold text-xl mb-3 line-clamp-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors min-h-[3.5rem] text-gray-900 dark:text-white">
            {tour.name}
          </h3>
        </Link>

        {/* Rating Stars */}
        <div className="mb-4">
          <RatingStars rating={4.8} size="sm" showValue={true} />
        </div>

        {/* Tour Details with improved spacing */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Clock className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            </div>
            <span className="text-sm font-medium">{tour.duration} days</span>
          </div>

          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            </div>
            <span className="text-sm font-medium">{tour.location}</span>
          </div>

          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Users className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            </div>
            <span className="text-sm font-medium">Max {tour.maxGroupSize} people</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between w-full gap-4">
          {/* Price */}
          <div className="flex flex-col">
            {tour.discount && (
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                {formatCurrency(parseFloat(tour.pricePerPerson || tour.price))}
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(
                  tour.discount
                    ? parseFloat(tour.pricePerPerson || tour.price) * (1 - tour.discount / 100)
                    : parseFloat(tour.pricePerPerson || tour.price)
                )}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">/ person</span>
            </div>
          </div>

          {/* View Details Button */}
          <Link href={`/tours/${tour.id}`}>
            <Button
              className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold shadow-lg hover:shadow-xl transition-all border-0"
              size="default"
            >
              View Details
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
