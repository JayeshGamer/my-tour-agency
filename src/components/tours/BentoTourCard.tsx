"use client";

import { useState } from "react";
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
  images: string[];
  imageUrl?: string | null;
  featured: boolean;
  difficulty: string;
  discount?: number;
  isNew?: boolean;
  isPopular?: boolean;
}

interface BentoTourCardProps {
  tour: Tour;
  featured?: boolean;
  large?: boolean;
}

export function BentoTourCard({ tour, large = false }: BentoTourCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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
    } catch {
      toast.error("Could not update wishlist");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Link href={`/tours/${tour.id}`}>
      <Card className={cn(
        "overflow-hidden hover:shadow-2xl transition-all duration-300 group relative cursor-pointer border-2 border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-400 bg-white dark:bg-gray-900 h-full",
        large ? "md:row-span-2" : ""
      )}>
        <div className={cn(
          "relative overflow-hidden",
          large ? "h-96" : "h-56"
        )}>
          <img
            src={imageUrl}
            alt={tourName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

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

          {/* Price & Rating */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div className="bg-white dark:bg-gray-900 rounded-xl px-4 py-2 shadow-xl backdrop-blur-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400">From</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(parseFloat(price))}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl px-3 py-2 shadow-xl backdrop-blur-sm">
              <RatingStars rating={4.7} size="sm" />
            </div>
          </div>
        </div>

        <CardContent className={cn("p-5 space-y-3", large ? "space-y-4" : "")}>
          <div>
            <h3 className={cn(
              "font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors",
              large ? "text-xl" : "text-lg"
            )}>
              {tourName}
            </h3>
            <p className={cn(
              "text-gray-600 dark:text-gray-400 mt-2",
              large ? "text-sm line-clamp-3" : "text-sm line-clamp-2"
            )}>
              {tour.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-blue-500" />
              <span>{tour.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-green-500" />
              <span>{tour.duration} Days</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-purple-500" />
              <span>Max {tour.maxGroupSize}</span>
            </div>
          </div>

          <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 font-semibold group/btn">
            View Details
            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}

