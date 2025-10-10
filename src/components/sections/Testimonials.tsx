// filepath: d:\JS Mastery\Travel Agency\my-tour-agency\src\components\sections\Testimonials.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote, Heart } from "lucide-react";
import { Marquee } from "@/components/ui/marquee";

interface Testimonial {
  id: string;
  rating: number;
  comment: string;
  title: string;
  createdAt: Date;
  user: {
    name: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  tour: {
    name: string;
    location: string;
  };
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials');
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating
            ? "fill-yellow-400 text-yellow-400"
            : "fill-gray-300 dark:fill-gray-600 text-gray-300 dark:text-gray-600"
        }`}
      />
    ));
  };

  const getUserDisplayName = (user: Testimonial['user']) => {
    if (user.name) return user.name;
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.firstName || user.lastName || 'Anonymous';
  };

  const getUserInitials = (user: Testimonial['user']) => {
    const name = getUserDisplayName(user);
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <section className="w-full space-y-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-2 border-gray-900 dark:border-white">
            <Heart className="h-4 w-4" />
            <span className="text-sm font-bold tracking-wide">Reviews</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">What Our Travelers Say</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Discover why thousands choose us for their adventures
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 px-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-100 dark:bg-gray-800 rounded-2xl h-72 animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return (
      <section className="w-full space-y-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-2 border-gray-900 dark:border-white">
            <Heart className="h-4 w-4" />
            <span className="text-sm font-bold tracking-wide">Reviews</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">What Our Travelers Say</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Be the first to share your experience!
          </p>
        </div>
      </section>
    );
  }

  // Split testimonials into two rows for marquee effect
  const firstRow = testimonials.slice(0, Math.ceil(testimonials.length / 2));
  const secondRow = testimonials.slice(Math.ceil(testimonials.length / 2));

  const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
    <Card className="w-[420px] border-2 border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-gray-300 transition-all hover:shadow-2xl group bg-white dark:bg-gray-900">
      <CardContent className="p-7">
        <div className="flex items-start justify-between mb-5">
          <Quote className="h-10 w-10 text-gray-900 dark:text-white opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="flex gap-1">
            {renderStars(testimonial.rating)}
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 min-h-[3rem]">
          {testimonial.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-300 mb-5 line-clamp-3 leading-relaxed min-h-[4.5rem]">
          {testimonial.comment}
        </p>

        <div className="flex items-center gap-3 pt-5 border-t border-gray-200 dark:border-gray-700">
          <Avatar className="h-12 w-12 ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-gray-900 dark:group-hover:ring-gray-300 transition-all">
            <AvatarImage src="" alt={getUserDisplayName(testimonial.user)} />
            <AvatarFallback className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-base">
              {getUserInitials(testimonial.user)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 dark:text-white truncate text-base">
              {getUserDisplayName(testimonial.user)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-0.5">
              {testimonial.tour.name}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section className="w-full overflow-hidden">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-2 border-gray-900 dark:border-white">
          <Heart className="h-4 w-4" />
          <span className="text-sm font-bold tracking-wide">Reviews</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight">What Our Travelers Say</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Real experiences from real travelers who've embarked on unforgettable journeys
        </p>
      </div>

      {/* Marquee testimonials - Full width without cutoff */}
      <div className="relative space-y-6 mb-12">
        <Marquee pauseOnHover className="[--duration:45s]">
          {firstRow.map((testimonial) => (
            <div key={testimonial.id} className="mx-3">
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </Marquee>

        {secondRow.length > 0 && (
          <Marquee reverse pauseOnHover className="[--duration:45s]">
            {secondRow.map((testimonial) => (
              <div key={testimonial.id} className="mx-3">
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </Marquee>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-12 border-t-2 border-gray-200 dark:border-gray-700">
        <div className="text-center space-y-2">
          <div className="text-5xl font-bold text-gray-900 dark:text-white">4.9/5</div>
          <div className="flex justify-center gap-1 my-2">
            {[1,2,3,4,5].map((i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <div className="text-base text-gray-600 dark:text-gray-300 font-medium">Average Rating</div>
        </div>
        <div className="text-center space-y-2">
          <div className="text-5xl font-bold text-gray-900 dark:text-white">50K+</div>
          <div className="text-base text-gray-600 dark:text-gray-300 font-medium">Happy Travelers</div>
        </div>
        <div className="text-center space-y-2">
          <div className="text-5xl font-bold text-gray-900 dark:text-white">98%</div>
          <div className="text-base text-gray-600 dark:text-gray-300 font-medium">Would Recommend</div>
        </div>
      </div>
    </section>
  );
}

