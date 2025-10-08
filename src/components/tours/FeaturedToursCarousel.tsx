"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { RatingStars } from "@/components/ui/rating-stars";

interface Tour {
  id: string;
  name?: string;
  title?: string;
  description: string;
  price?: string;
  pricePerPerson?: string;
  duration: number;
  location: string;
  images: string[];
  imageUrl?: string | null;
  featured: boolean;
  discount?: number;
  isNew?: boolean;
  isPopular?: boolean;
}

interface FeaturedToursCarouselProps {
  tours: Tour[];
}

export function FeaturedToursCarousel({ tours }: FeaturedToursCarouselProps) {
  const featuredTours = tours.filter((tour) => tour.featured).slice(0, 5);

  if (featuredTours.length === 0) return null;

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 rounded-3xl p-8 border-2 border-blue-200 dark:border-purple-800 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Featured Tours
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Handpicked adventures just for you
            </p>
          </div>
        </div>
        <Badge className="bg-yellow-500 text-white border-0 px-4 py-2 text-sm font-bold">
          <Star className="h-4 w-4 mr-1 fill-current" />
          Top Picks
        </Badge>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {featuredTours.map((tour) => {
            const tourName = tour.name || tour.title || "Unnamed Tour";
            const price = tour.pricePerPerson || tour.price || "0";
            const imageUrl = tour.images?.[0] || tour.imageUrl || "/images/tours/placeholder-tour.svg";

            return (
              <CarouselItem key={tour.id} className="md:basis-1/2 lg:basis-1/3">
                <Link href={`/tours/${tour.id}`}>
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 group border-2 border-transparent hover:border-purple-500 dark:hover:border-purple-400 bg-white dark:bg-gray-800">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={tourName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                      {/* Badges */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        {tour.discount && (
                          <Badge className="bg-red-500 text-white border-0 font-bold shadow-lg">
                            {tour.discount}% OFF
                          </Badge>
                        )}
                        {tour.isNew && (
                          <Badge className="bg-green-500 text-white border-0 shadow-lg">
                            New
                          </Badge>
                        )}
                      </div>

                      {/* Price */}
                      <div className="absolute bottom-4 left-4">
                        <div className="bg-white dark:bg-gray-900 rounded-xl px-4 py-2 shadow-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400">From</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(parseFloat(price))}
                          </p>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-5 space-y-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {tourName}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {tour.description}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{tour.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{tour.duration}D</span>
                          </div>
                        </div>
                        <RatingStars rating={4.8} size="sm" showValue={false} />
                      </div>

                      <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 font-semibold group/btn">
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-2 bg-white dark:bg-gray-800 border-2 hover:bg-gray-100 dark:hover:bg-gray-700" />
        <CarouselNext className="right-2 bg-white dark:bg-gray-800 border-2 hover:bg-gray-100 dark:hover:bg-gray-700" />
      </Carousel>
    </div>
  );
}

