import Link from "next/link";
import { ArrowRight, Sparkles, Globe, Shield, Award, Users, Star, Zap, TrendingUp, Check, Clock, Plane, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { TourCard } from "@/components/tours/TourCard";
import Testimonials from "@/components/sections/Testimonials";
import { Marquee } from "@/components/ui/marquee";
import { AnimatedList } from "@/components/ui/animated-list";
import { db } from "@/lib/db";
import { tours } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

async function getFeaturedTours() {
  try {
    return await db
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
  } catch (error) {
    console.error('Error fetching featured tours:', error);
    return [];
  }
}

// Activity notifications for animated list
const recentActivities = [
  { id: 1, user: "Sarah M.", action: "just booked", tour: "Santorini Adventure", time: "2 min ago", avatar: "SM" },
  { id: 2, user: "James K.", action: "reviewed", tour: "Tokyo Explorer", time: "5 min ago", avatar: "JK" },
  { id: 3, user: "Emily R.", action: "just booked", tour: "Iceland Journey", time: "8 min ago", avatar: "ER" },
  { id: 4, user: "Michael B.", action: "just booked", tour: "African Safari", time: "12 min ago", avatar: "MB" },
];

const destinations = [
  { name: "Paris, France", icon: "🗼" },
  { name: "Tokyo, Japan", icon: "🗾" },
  { name: "Santorini, Greece", icon: "🏛️" },
  { name: "New York, USA", icon: "🗽" },
  { name: "Dubai, UAE", icon: "🏙️" },
  { name: "Bali, Indonesia", icon: "🏝️" },
  { name: "London, UK", icon: "🎡" },
  { name: "Rome, Italy", icon: "🏛️" },
];

export default async function HomePage() {
  const featuredTours = await getFeaturedTours();

  return (
    <div className="w-full bg-[#030712] dark:bg-white">
      {/* Hero Section - Black and White Theme (inverted: light -> black, dark -> white) */}
      <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#030712] via-[#021018] to-black dark:from-white dark:via-gray-50 dark:to-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#00000012_1px,transparent_1px),linear-gradient(to_bottom,#00000012_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#030712] dark:bg-white text-white dark:text-[#030712] border border-[#030712] dark:border-white">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium tracking-wide">Trusted by 50,000+ Travelers</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white dark:text-[#030712] leading-[1.1] tracking-tight">
                Explore the World
                <br />
                <span className="text-white dark:text-[#030712]">Your Way</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-300 dark:text-gray-700 leading-relaxed max-w-xl">
                Discover unforgettable adventures with our expertly curated tours.
                From hidden gems to iconic landmarks, your perfect journey starts here.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <RainbowButton variant="black" className="h-11 px-8" asChild>
                  <Link href="/tours" className="flex items-center justify-center">
                    Explore Tours
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </RainbowButton>
                <RainbowButton className="h-11 px-8" asChild>
                  <Link href="/create-tour" className="flex items-center justify-center">
                    Create Custom Tour
                  </Link>
                </RainbowButton>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap gap-8 pt-6 border-t border-gray-700 dark:border-gray-300">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-[#030712] dark:bg-white border-2 border-white dark:border-[#030712] flex items-center justify-center text-white dark:text-[#030712] text-xs font-bold"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <div className="text-left">
                    <p className="text-white dark:text-[#030712] font-semibold text-sm">50K+</p>
                    <p className="text-gray-300 dark:text-gray-500 text-xs">Happy Travelers</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-5 h-5 fill-white dark:fill-[#030712] text-white dark:text-[#030712]" />
                    ))}
                  </div>
                  <div className="text-left">
                    <p className="text-white dark:text-[#030712] font-semibold text-sm">4.9/5</p>
                    <p className="text-gray-300 dark:text-gray-500 text-xs">Average Rating</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Activity Feed */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Decorative glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-white/20 to-white/10 dark:from-white/10 dark:to-white/5 rounded-3xl blur-2xl opacity-50" />

                <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-2xl max-w-md ml-auto">
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Live Activity</span>
                    <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 font-medium">Real-time</span>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-hidden">
                    <AnimatedList delay={2500}>
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="bg-white dark:bg-gray-800/80 backdrop-blur-md rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm flex-shrink-0 shadow-md">
                              {activity.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 dark:text-white font-medium">
                                <span className="font-bold">{activity.user}</span>
                                {" "}
                                <span className="text-gray-600 dark:text-gray-400">{activity.action}</span>
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5 font-medium">{activity.tour}</p>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md">{activity.time}</span>
                          </div>
                        </div>
                      ))}
                    </AnimatedList>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee - Popular Destinations */}
      <section className="py-12 bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mb-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-2 border-gray-900 dark:border-white">
              <Globe className="h-4 w-4" />
              <span className="text-sm font-bold">Worldwide Destinations</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Popular Destinations</h2>
          </div>
        </div>
        <Marquee pauseOnHover className="[--duration:30s]">
          {destinations.map((dest, idx) => (
            <div key={idx} className="mx-3 px-8 py-5 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl hover:border-gray-900 dark:hover:border-gray-300 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{dest.icon}</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">{dest.name}</span>
              </div>
            </div>
          ))}
        </Marquee>
      </section>

      {/* Features Section with Better Spacing */}
      <section className="py-16 px-6 sm:px-8 lg:px-12 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-14 space-y-4">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-2 border-gray-900 dark:border-white">
              <Zap className="h-5 w-5" />
              <span className="text-sm font-bold tracking-wider uppercase">Why Choose Us</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight max-w-4xl mx-auto">
              Your Adventure,
              <br />
              <span className="relative inline-block">
                Simplified
                <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 10C50 3 250 3 298 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Everything you need for the perfect journey, all in one place. We've reimagined travel planning from the ground up.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {/* Feature Card 1 */}
            <div className="group relative bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-3xl p-7 hover:border-gray-900 dark:hover:border-gray-300 transition-all duration-300 hover:shadow-2xl">
              <div className="absolute -top-5 left-7 w-11 h-11 bg-gray-900 dark:bg-white rounded-2xl flex items-center justify-center rotate-3 group-hover:rotate-12 transition-transform shadow-lg">
                <Shield className="h-5 w-5 text-white dark:text-gray-900" />
              </div>
              <div className="mt-6 space-y-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Secure Booking</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                  Bank-level security protects your payments and personal information at every step.
                </p>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="group relative bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-3xl p-7 hover:border-gray-900 dark:hover:border-gray-300 transition-all duration-300 hover:shadow-2xl">
              <div className="absolute -top-5 left-7 w-11 h-11 bg-gray-900 dark:bg-white rounded-2xl flex items-center justify-center -rotate-3 group-hover:-rotate-12 transition-transform shadow-lg">
                <Users className="h-5 w-5 text-white dark:text-gray-900" />
              </div>
              <div className="mt-6 space-y-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Expert Guides</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                  Local experts bring destinations to life with insider knowledge and passion.
                </p>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="group relative bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-3xl p-7 hover:border-gray-900 dark:hover:border-gray-300 transition-all duration-300 hover:shadow-2xl">
              <div className="absolute -top-5 left-7 w-11 h-11 bg-gray-900 dark:bg-white rounded-2xl flex items-center justify-center rotate-6 group-hover:rotate-[20deg] transition-transform shadow-lg">
                <Award className="h-5 w-5 text-white dark:text-gray-900" />
              </div>
              <div className="mt-6 space-y-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Best Price</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                  We guarantee the best value for your money. Find a better price? We'll match it.
                </p>
              </div>
            </div>

            {/* Feature Card 4 */}
            <div className="group relative bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-3xl p-7 hover:border-gray-900 dark:hover:border-gray-300 transition-all duration-300 hover:shadow-2xl">
              <div className="absolute -top-5 left-7 w-11 h-11 bg-gray-900 dark:bg-white rounded-2xl flex items-center justify-center -rotate-6 group-hover:-rotate-[20deg] transition-transform shadow-lg">
                <Clock className="h-5 w-5 text-white dark:text-gray-900" />
              </div>
              <div className="mt-6 space-y-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">24/7 Support</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                  Our dedicated team is here for you anytime, anywhere. Help when you need it.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Section with improved theme support */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 p-10 bg-gray-900 dark:bg-white rounded-3xl shadow-xl">
            <div className="text-center">
              <div className="text-4xl font-bold text-white dark:text-gray-900 mb-2">500+</div>
              <div className="text-gray-300 dark:text-gray-600 font-medium text-sm">Tours Available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white dark:text-gray-900 mb-2">50K+</div>
              <div className="text-gray-300 dark:text-gray-600 font-medium text-sm">Happy Travelers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white dark:text-gray-900 mb-2">100+</div>
              <div className="text-gray-300 dark:text-gray-600 font-medium text-sm">Destinations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white dark:text-gray-900 mb-2">4.9★</div>
              <div className="text-gray-300 dark:text-gray-600 font-medium text-sm">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tours with Tighter Spacing */}
      <section className="py-16 px-6 sm:px-8 lg:px-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-2 border-gray-900 dark:border-white">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-bold">Trending Now</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight">Featured Tours</h2>
              <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl">
                Handpicked adventures for unforgettable experiences
              </p>
            </div>
            <Button size="lg" variant="outline" className="border-2 border-gray-900 dark:border-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 text-gray-900 dark:text-white font-semibold transition-all" asChild>
              <Link href="/tours">
                View All Tours
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTours.length > 0 ? (
              featuredTours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Globe className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No featured tours available
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                  Check out our full collection of amazing tours and destinations
                </p>
                <RainbowButton className="h-11 px-6 text-base" asChild>
                  <Link href="/tours">
                    Browse All Tours
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </RainbowButton>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Custom Tour CTA with Better Spacing */}
      <section className="py-16 px-6 sm:px-8 lg:px-12 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 dark:from-gray-950 dark:via-black dark:to-gray-950">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            <div className="relative px-8 py-16 lg:px-20 lg:py-20 text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-gray-900 text-black dark:text-white border border-gray-200 dark:border-gray-700">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold tracking-wide">Personalized Experiences</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight max-w-4xl mx-auto">
                Can't Find What You're
                <br />
                Looking For?
              </h2>

              <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Create your own custom tour package tailored to your preferences.
                Choose your destinations, activities, and timeline - we'll handle the rest.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <RainbowButton className="h-11 px-8 text-base font-semibold" asChild>
                  <Link href="/create-tour" className="flex items-center justify-center">
                    Design Your Tour
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </RainbowButton>
                <RainbowButton className="h-11 px-8 text-base font-semibold" asChild>
                  <Link href="/contact" className="flex items-center justify-center">
                    Talk to an Expert
                  </Link>
                </RainbowButton>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-6">
                {[
                  { icon: Check, text: "Fully Customizable" },
                  { icon: Target, text: "Expert Planning" },
                  { icon: Shield, text: "Best Price Match" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-center gap-3 text-white bg-white/10 backdrop-blur-sm rounded-xl py-3 px-5 border border-white/20">
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="font-semibold text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials with Tighter Spacing */}
      <section className="py-16 px-6 sm:px-8 lg:px-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <Testimonials />
        </div>
      </section>

      {/* Final CTA with Better Spacing */}
      <section className="py-16 px-6 sm:px-8 lg:px-12 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-2 border-gray-900 dark:border-white">
            <Plane className="h-4 w-4" />
            <span className="text-sm font-bold tracking-wide">Ready to Travel?</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
            Your Next Adventure Awaits
          </h2>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Join thousands of happy travelers. Start planning your dream vacation today.
          </p>

          <RainbowButton variant="black" className="h-11 px-6 text-base" asChild>
            <Link href="/tours">
              Explore All Tours
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </RainbowButton>
        </div>
      </section>
    </div>
  );
}
