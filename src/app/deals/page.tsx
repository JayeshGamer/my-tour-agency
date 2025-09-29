"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Star, Percent } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";

interface Deal {
  id: string;
  title: string;
  originalPrice: number;
  discountPrice: number;
  discount: number;
  location: string;
  duration: number;
  maxGroupSize: number;
  validUntil: string;
  description: string;
  image: string;
  rating: number;
  featured: boolean;
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call - replace with actual API
    setTimeout(() => {
      const mockDeals: Deal[] = [
        {
          id: "cm123abc", // Actual tour ID from database
          title: "Early Bird Swiss Alps Adventure",
          originalPrice: 199900, // ₹1,99,900
          discountPrice: 159900, // ₹1,59,900
          discount: 20,
          location: "Switzerland",
          duration: 7,
          maxGroupSize: 12,
          validUntil: "2024-12-31",
          description: "Book early and save on this breathtaking mountain adventure with professional guides.",
          image: "/api/placeholder/400/250",
          rating: 4.9,
          featured: true,
        },
        {
          id: "cm234def", // Actual tour ID from database
          title: "Last Minute Japan Cultural Tour",
          originalPrice: 264900, // ₹2,64,900
          discountPrice: 198700, // ₹1,98,700
          discount: 25,
          location: "Japan",
          duration: 10,
          maxGroupSize: 15,
          validUntil: "2024-11-30",
          description: "Experience authentic Japanese culture with this limited-time offer.",
          image: "/api/placeholder/400/250",
          rating: 4.8,
          featured: true,
        },
        {
          id: "cm345ghi", // Actual tour ID from database
          title: "Group Discount Safari Kenya",
          originalPrice: 319900, // ₹3,19,900
          discountPrice: 223900, // ₹2,23,900
          discount: 30,
          location: "Kenya",
          duration: 8,
          maxGroupSize: 10,
          validUntil: "2024-12-15",
          description: "Bring friends and save more! Perfect for groups seeking wildlife adventure.",
          image: "/api/placeholder/400/250",
          rating: 4.7,
          featured: false,
        },
        {
          id: "cm456jkl", // Actual tour ID from database
          title: "Mediterranean Summer Special",
          originalPrice: 175900, // ₹1,75,900
          discountPrice: 140700, // ₹1,40,700
          discount: 20,
          location: "Italy & Greece",
          duration: 12,
          maxGroupSize: 20,
          validUntil: "2024-10-31",
          description: "Limited summer special combining the best of Italy and Greece.",
          image: "/api/placeholder/400/250",
          rating: 4.6,
          featured: false,
        },
      ];
      setDeals(mockDeals);
      setLoading(false);
    }, 1000);
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "fill-gray-200 text-gray-200"
        }`}
      />
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 space-y-12">
      {/* Page Header */}
      <section className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Exclusive Travel Deals
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Don't miss out on these limited-time offers! Save big on your next adventure with our exclusive deals and early bird specials.
        </p>
      </section>

      {/* Deals Grid */}
      <section>
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-gray-200 rounded-lg h-96 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {deals.map((deal) => (
              <Card key={deal.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                {/* Deal Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Discount Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-red-500 text-white text-lg px-3 py-1">
                      <Percent className="h-4 w-4 mr-1" />
                      {deal.discount}% OFF
                    </Badge>
                  </div>
                  {deal.featured && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                    {deal.title}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {deal.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Tour Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{deal.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{deal.duration} days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Max {deal.maxGroupSize}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Valid until {formatDate(deal.validUntil)}</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {renderStars(deal.rating)}
                    </div>
                    <span className="text-sm font-medium">{deal.rating}</span>
                  </div>

                  {/* Pricing and CTA */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(deal.discountPrice)}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          {formatCurrency(deal.originalPrice)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">per person</p>
                    </div>
                    <Button asChild>
                      <Link href={`/tours/${deal.id}`}>
                        Book Now
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-12 text-center space-y-6">
        <h2 className="text-3xl font-bold">Don't Miss These Amazing Deals!</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          These exclusive offers won't last long. Book now and save on your dream vacation.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/tours">View All Tours</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/contact">Get Custom Deal</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
