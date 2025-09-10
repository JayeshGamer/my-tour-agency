'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock, Users, DollarSign, ArrowRight, Star } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Tour {
  id: string;
  name: string;
  title: string;
  description: string;
  location: string;
  duration: number;
  pricePerPerson: string;
  price: string;
  category: string;
  difficulty: string;
  maxGroupSize: number;
  imageUrl: string | null;
  images: any;
  featured: boolean;
  status: string;
}

interface RelatedToursProps {
  tours: Tour[];
}

export default function RelatedTours({ tours }: RelatedToursProps) {
  if (tours.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Related Tours</h2>
        <Link href="/tours">
          <Button variant="outline" className="flex items-center gap-2">
            See All Tours
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tours.map((tour) => (
          <Card key={tour.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
            <CardHeader className="p-0">
              <div className="relative aspect-[4/3] overflow-hidden">
                {tour.imageUrl ? (
                  tour.imageUrl.startsWith('/api/placeholder') ? (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">{tour.name}</span>
                    </div>
                  ) : (
                    <Image
                      src={tour.imageUrl}
                      alt={tour.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">{tour.name}</span>
                  </div>
                )}
                
                {/* Category Badge */}
                <Badge className="absolute top-2 left-2 bg-white/90 text-gray-900">
                  {tour.category}
                </Badge>

                {/* Featured Badge */}
                {tour.featured && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                )}

                {/* Difficulty Badge */}
                <Badge 
                  className={`absolute bottom-2 left-2 ${
                    tour.difficulty === 'Easy' ? 'bg-green-500' :
                    tour.difficulty === 'Moderate' ? 'bg-yellow-500' :
                    'bg-red-500'
                  } text-white`}
                >
                  {tour.difficulty}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-lg line-clamp-1">{tour.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">{tour.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{tour.location}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{tour.duration} days</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>Max {tour.maxGroupSize}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-semibold">${tour.pricePerPerson}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
              <Link href={`/tours/${tour.id}`} className="w-full">
                <Button className="w-full group-hover:bg-primary-dark transition-colors">
                  View Tour Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Additional CTA */}
      <div className="text-center pt-6">
        <p className="text-gray-600 mb-4">
          Discover more amazing adventures tailored for you
        </p>
        <Link href="/tours">
          <Button size="lg" variant="outline">
            Explore All Tours
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
