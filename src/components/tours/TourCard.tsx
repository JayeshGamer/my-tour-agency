"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Users, Heart, Star, TrendingUp, Sparkles } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group relative cursor-pointer">
      {/* Labels/Badges */}
      <div className="absolute top-3 left-3 z-10 space-y-2">
        {tour.featured && (
          <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
            <Star className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}
        {tour.discount && (
          <Badge className="bg-red-500 text-white hover:bg-red-600">
            {tour.discount}% OFF
          </Badge>
        )}
        {tour.isNew && (
          <Badge className="bg-green-500 text-white hover:bg-green-600">
            <Sparkles className="h-3 w-3 mr-1" />
            New
          </Badge>
        )}
        {tour.isPopular && (
          <Badge className="bg-blue-500 text-white hover:bg-blue-600">
            <TrendingUp className="h-3 w-3 mr-1" />
            Popular
          </Badge>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        disabled={isUpdating}
        className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur rounded-full hover:bg-white transition-all duration-200 group/heart disabled:opacity-50"
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          className={`h-5 w-5 transition-all duration-200 ${
            isWishlisted
              ? "fill-red-500 text-red-500"
              : "text-gray-600 group-hover/heart:text-red-500"
          }`}
        />
      </button>

      {/* Tour Image - Clickable to view details */}
      <Link href={`/tours/${tour.id}`} className="block">
        <div className="relative h-56 overflow-hidden">
        <Image
          src={tour.imageUrl || (tour.images && tour.images[0]) || "/placeholder-tour.svg"}
          alt={tour.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder-tour.svg";
          }}
        />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      </Link>

      <CardContent className="p-5">
        {/* Tour Name - Clickable */}
        <Link href={`/tours/${tour.id}`} className="block">
          <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {tour.name}
          </h3>
        </Link>

        {/* Tour Details */}
        <div className="space-y-2.5 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium">{tour.duration} days</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium">{tour.location}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium">Max {tour.maxGroupSize} people</span>
          </div>
        </div>

        {/* Difficulty Badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Difficulty:</span>
          <Badge
            variant={
              tour.difficulty === "Easy"
                ? "secondary"
                : tour.difficulty === "Moderate"
                ? "default"
                : "destructive"
            }
          >
            {tour.difficulty}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 border-t">
        <div className="flex items-center justify-between w-full">
          {/* Price */}
          <div className="flex flex-col">
            {tour.discount && (
              <span className="text-sm text-gray-500 line-through">
                {formatCurrency(parseFloat(tour.pricePerPerson || tour.price))}
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  tour.discount
                    ? parseFloat(tour.pricePerPerson || tour.price) * (1 - tour.discount / 100)
                    : parseFloat(tour.pricePerPerson || tour.price)
                )}
              </span>
              <span className="text-sm text-gray-500">pp</span>
            </div>
          </div>

          {/* View Details Button */}
          <Link href={`/tours/${tour.id}`}>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
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
