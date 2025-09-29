"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";

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
            : "fill-gray-200 text-gray-200"
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
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold">What Our Travelers Say</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover why thousands choose us for their adventures
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-200 rounded-lg h-64 animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold">What Our Travelers Say</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Discover why thousands choose us for their adventures
        </p>
      </div>

      <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="relative hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6 space-y-4">
              {/* Quote Icon */}
              <Quote className="h-8 w-8 text-primary/30 group-hover:text-primary/50 transition-colors" />
              
              {/* Rating */}
              <div className="flex items-center gap-1">
                {renderStars(testimonial.rating)}
              </div>

              {/* Review Title */}
              {testimonial.title && (
                <h3 className="font-semibold text-lg text-gray-900">
                  "{testimonial.title}"
                </h3>
              )}

              {/* Review Comment */}
              <p className="text-muted-foreground leading-relaxed line-clamp-4">
                "{testimonial.comment}"
              </p>

              {/* User Info */}
              <div className="flex items-center gap-3 pt-2 border-t">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt={getUserDisplayName(testimonial.user)} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getUserInitials(testimonial.user)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">
                    {getUserDisplayName(testimonial.user)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.tour.name} • {testimonial.tour.location}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/5 rounded-full blur-xl" />
      </div>
    </section>
  );
}
