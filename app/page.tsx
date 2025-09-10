"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TourCard } from "@/components/tours/TourCard";
import Testimonials from "@/components/Testimonials";

interface FeaturedTour {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  location: string;
  maxGroupSize: number;
  difficulty: string;
  images: string[];
  rating: number;
  reviewCount: number;
  featured: boolean;
}

export default function HomePage() {
  const [featuredTours, setFeaturedTours] = useState<FeaturedTour[]>([]);

  // Mock data - replace with API call
  useEffect(() => {
    setFeaturedTours([
      {
        id: "1",
        title: "Explore the Swiss Alps",
        description: "Experience breathtaking mountain views and charming alpine villages in this unforgettable Swiss adventure.",
        price: 2499,
        duration: 7,
        location: "Switzerland",
        maxGroupSize: 12,
        difficulty: "Moderate",
        images: ["/api/placeholder/400/300"],
        rating: 4.8,
        reviewCount: 124,
        featured: true,
      },
      {
        id: "2",
        title: "Japanese Cultural Journey",
        description: "Immerse yourself in the rich culture and traditions of Japan, from ancient temples to modern Tokyo.",
        price: 3299,
        duration: 10,
        location: "Japan",
        maxGroupSize: 15,
        difficulty: "Easy",
        images: ["/api/placeholder/400/300"],
        rating: 4.9,
        reviewCount: 89,
        featured: true,
      },
      {
        id: "3",
        title: "Safari Adventure in Kenya",
        description: "Witness the incredible wildlife of the African savanna on this thrilling safari expedition.",
        price: 3999,
        duration: 8,
        location: "Kenya",
        maxGroupSize: 10,
        difficulty: "Moderate",
        images: ["/api/placeholder/400/300"],
        rating: 4.7,
        reviewCount: 156,
        featured: true,
      },
    ]);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 space-y-20">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/600')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 text-center space-y-8 px-8 max-w-4xl mx-auto">
          <h1 className="text-7xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-tight">
            Discover Your Next Adventure
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore the world with our expertly crafted tours. From mountain peaks to tropical beaches, 
            we have the perfect journey waiting for you.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/tours">
                Browse All Tours
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/destinations">
                Popular Destinations
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Featured Tours */}
      <section className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Featured Tours</h2>
            <p className="text-muted-foreground">
              Handpicked adventures for unforgettable experiences
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/tours">
              View All Tours
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-16 text-center space-y-8 shadow-lg">
        <h2 className="text-4xl font-bold">Ready to Start Your Journey?</h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Join thousands of satisfied travelers who have discovered their perfect adventure with us.
        </p>
        <div className="flex gap-6 justify-center">
          <Button size="lg" className="px-8 py-3 text-lg" asChild>
            <Link href="/tours">
              Find Your Tour
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="px-8 py-3 text-lg" asChild>
            <Link href="/contact">
              Contact Us
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
