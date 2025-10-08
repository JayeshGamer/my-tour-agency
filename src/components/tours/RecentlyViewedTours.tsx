"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock as ClockIcon, Eye } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";

interface Tour {
  id: string;
  name?: string;
  title?: string;
  price?: string;
  pricePerPerson?: string;
  duration: number;
  location: string;
  images: string[];
  imageUrl?: string | null;
}

interface RecentlyViewedToursProps {
  tours?: Tour[];
}

export function RecentlyViewedTours({ tours = [] }: RecentlyViewedToursProps) {
  // Get recently viewed from localStorage
  const [recentTours, setRecentTours] = React.useState<Tour[]>([]);

  React.useEffect(() => {
    // In a real app, get from localStorage or API
    // For now, just show the first 4 tours
    if (tours.length > 0) {
      setRecentTours(tours.slice(0, 4));
    }
  }, [tours]);

  if (recentTours.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-3xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Eye className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Recently Viewed
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Continue exploring these tours
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recentTours.map((tour) => {
          const tourName = tour.name || tour.title || "Unnamed Tour";
          const price = tour.pricePerPerson || tour.price || "0";
          const imageUrl = tour.images?.[0] || tour.imageUrl || "/images/tours/placeholder-tour.svg";

          return (
            <Link key={tour.id} href={`/tours/${tour.id}`}>
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-2 border-transparent hover:border-purple-500 dark:hover:border-purple-400 bg-white dark:bg-gray-800 h-full">
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={tourName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge className="absolute top-2 right-2 bg-blue-500 text-white border-0 text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Viewed
                  </Badge>
                </div>
                <CardContent className="p-3 space-y-2">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {tourName}
                  </h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <ClockIcon className="h-3 w-3" />
                      <span>{tour.duration}D</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(parseFloat(price))}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

