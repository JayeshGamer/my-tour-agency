"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TourCard } from "@/components/tours/TourCard";

export default function HomePage() {
  const [featuredTours, setFeaturedTours] = useState([]);

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
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/600')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 text-center space-y-6 px-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Discover Your Next Adventure
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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

      {/* Why Choose Us */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Why Travel With Us</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We provide exceptional travel experiences with expert guides, carefully planned itineraries, 
            and unforgettable memories.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <MapPin className="h-12 w-12 mx-auto text-primary" />
              <h3 className="text-xl font-semibold">Expert Local Guides</h3>
              <p className="text-muted-foreground">
                Our experienced local guides provide insider knowledge and authentic experiences.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <Calendar className="h-12 w-12 mx-auto text-primary" />
              <h3 className="text-xl font-semibold">Flexible Booking</h3>
              <p className="text-muted-foreground">
                Easy booking process with flexible cancellation policies for peace of mind.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <Users className="h-12 w-12 mx-auto text-primary" />
              <h3 className="text-xl font-semibold">Small Groups</h3>
              <p className="text-muted-foreground">
                Intimate group sizes ensure personalized attention and better experiences.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

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
      <section className="bg-primary/5 rounded-lg p-12 text-center space-y-6">
        <h2 className="text-3xl font-bold">Ready to Start Your Journey?</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Join thousands of satisfied travelers who have discovered their perfect adventure with us.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/tours">
              Find Your Tour
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/contact">
              Contact Us
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
