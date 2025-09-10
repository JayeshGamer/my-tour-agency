"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, MapPin, Users, Star, Heart } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "../../src/components/ui/card";
import { Button } from "../../src/components/ui/button";
import { Badge } from "../../src/components/ui/badge";

interface TourCardProps {
  tour: {
    id: string;
    title: string;
    description: string;
    price: number;
    duration: number;
    location: string;
    maxGroupSize: number;
    difficulty: string;
    images: string[];
    rating?: number;
    reviewCount?: number;
    featured?: boolean;
  };
}

export default function TourCard({ tour }: TourCardProps) {
  const difficultyColor = {
    easy: "bg-green-500",
    moderate: "bg-yellow-500",
    difficult: "bg-red-500",
  }[tour.difficulty.toLowerCase()] || "bg-gray-500";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 w-full">
        <Image
          src={tour.images[0] || "/placeholder-tour.svg"}
          alt={tour.title}
          fill
          className="object-cover"
        />
        {tour.featured && (
          <Badge className="absolute top-2 left-2" variant="destructive">
            Featured
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
        >
          <Heart className="h-4 w-4" />
        </Button>
        <Badge
          className={`absolute bottom-2 right-2 ${difficultyColor}`}
          variant="secondary"
        >
          {tour.difficulty}
        </Badge>
      </div>

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg line-clamp-1">{tour.title}</h3>
          {tour.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{tour.rating}</span>
              <span className="text-xs text-muted-foreground">
                ({tour.reviewCount})
              </span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {tour.description}
        </p>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{tour.location}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{tour.duration} days</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Max {tour.maxGroupSize}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Multiple dates</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <div>
          <span className="text-2xl font-bold">${tour.price}</span>
          <span className="text-sm text-muted-foreground">/person</span>
        </div>
        <Button asChild>
          <Link href={`/tours/${tour.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
