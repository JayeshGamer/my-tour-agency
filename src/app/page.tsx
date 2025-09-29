import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TourCard } from "@/components/tours/TourCard";
import Testimonials from "@/components/Testimonials";
import { db } from "@/lib/db";
import { tours } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

async function getFeaturedTours() {
  try {
    const featuredTours = await db
      .select()
      .from(tours)
      .where(
        and(
          eq(tours.featured, true),
          eq(tours.status, 'Active')
        )
      )
      .orderBy(desc(tours.createdAt))
      .limit(3);

    return featuredTours;
  } catch (error) {
    console.error('Error fetching featured tours:', error);
    return [];
  }
}

export default async function HomePage() {
  const featuredTours = await getFeaturedTours();

  return (
    <div className="max-w-7xl mx-auto px-6 space-y-20">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center rounded-xl overflow-hidden shadow-lg">
        {/* Background image */}
        <div className="absolute inset-0 bg-[url('/placeholder-tour.svg')] bg-cover bg-center opacity-100" />
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center space-y-8 px-8 max-w-4xl mx-auto">
          <h1 className="text-7xl font-bold text-white drop-shadow-lg leading-tight">
            Discover Your Next Adventure
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow">
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

      {/* Create Your Own Tour Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-12 text-center space-y-8 border border-blue-200 shadow-lg">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-gray-900">Create Your Own Tour Package</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Have a unique destination or special requirements in mind? Design your perfect custom tour package
            and let us bring your dream adventure to life.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <Button size="lg" className="px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700" asChild>
            <Link href="/create-tour">
              Create Your Tour
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <span className="text-base">✨</span>
            Custom itineraries designed by you
          </p>
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
          {featuredTours.length > 0 ? (
            featuredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">
                No featured tours available at the moment.
              </p>
              <Button asChild>
                <Link href="/tours">
                  Browse All Tours
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
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
