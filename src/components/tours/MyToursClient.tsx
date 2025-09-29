"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Users, Clock, Eye, Plus } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface UserTour {
  id: string;
  name: string;
  title: string;
  location: string;
  duration: number;
  pricePerPerson: string;
  status: 'Active' | 'Inactive';
  category: string;
  difficulty: string;
  maxGroupSize: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function MyToursClient() {
  const [tours, setTours] = useState<UserTour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTours();
  }, []);

  const fetchMyTours = async () => {
    try {
      const response = await fetch("/api/tours/my-tours");
      if (response.ok) {
        const data = await response.json();
        setTours(data);
      } else {
        throw new Error('Failed to fetch tours');
      }
    } catch (error) {
      console.error("Error fetching my tours:", error);
      toast.error("Failed to load your tours");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Active":
        return "Approved & Live";
      case "Inactive":
        return "Pending Approval";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (tours.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="max-w-md mx-auto">
            <CalendarDays className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No custom tours yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start creating your own unique tour packages and share them with travelers worldwide.
            </p>
            <Button asChild>
              <Link href="/create-tour">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Tour
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create New Tour Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Your Custom Tours ({tours.length})</h2>
          <p className="text-gray-600">Track the status of your submitted tours</p>
        </div>
        <Button asChild>
          <Link href="/create-tour">
            <Plus className="h-4 w-4 mr-2" />
            Create New Tour
          </Link>
        </Button>
      </div>

      {/* Tours Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tours.map((tour) => (
          <Card key={tour.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-700">{tour.name}</h4>
                <p className="text-sm text-gray-500">{tour.location}</p>
              </div>
              <Badge
                className={`absolute top-2 right-2 ${getStatusColor(tour.status)}`}
              >
                {getStatusText(tour.status)}
              </Badge>
            </div>

            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                {tour.title}
              </h3>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{tour.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{tour.duration} days</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Max {tour.maxGroupSize} people</span>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span>Created: {formatDate(tour.createdAt)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(tour.pricePerPerson)}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">per person</span>
                  </div>

                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/tours/${tour.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Status Information */}
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                {tour.status === 'Active' ? (
                  <div className="text-sm">
                    <p className="text-green-700 font-medium">✅ Tour is live and accepting bookings!</p>
                    <p className="text-gray-600">Travelers can now book your tour.</p>
                  </div>
                ) : (
                  <div className="text-sm">
                    <p className="text-yellow-700 font-medium">⏳ Waiting for admin approval</p>
                    <p className="text-gray-600">We'll notify you once your tour is reviewed.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <span className="font-medium">1. Submit</span>
              <p>Create and submit your custom tour with detailed information.</p>
            </div>
            <div>
              <span className="font-medium">2. Review</span>
              <p>Our team reviews your submission within 2-3 business days.</p>
            </div>
            <div>
              <span className="font-medium">3. Go Live</span>
              <p>Once approved, your tour goes live and accepts bookings!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
