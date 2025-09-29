"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Users, CreditCard, Eye, X } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { CancelBookingDialog } from "./CancelBookingDialog";
import toast from "react-hot-toast";

interface Booking {
  id: string;
  tourName: string;
  tourImage: string;
  bookingDate: string;
  travelDate: string;
  status: "confirmed" | "pending" | "cancelled";
  totalAmount: number;
  travelers: number;
  tourId: string;
}

export default function BookingHistoryClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings");
      if (response.ok) {
        const data = await response.json();

        // Transform the API response to match the frontend interface
        const transformedBookings: Booking[] = data.map((booking: any) => ({
          id: booking.id,
          tourName: booking.tour?.name || 'Unknown Tour',
          tourImage: booking.tour?.imageUrl || booking.tour?.images?.[0] || "/placeholder-tour.svg",
          bookingDate: booking.bookingDate || booking.createdAt,
          travelDate: booking.startDate, // Map startDate to travelDate
          status: booking.status?.toLowerCase() === 'canceled' ? 'cancelled' : booking.status?.toLowerCase() || 'pending', // Handle 'Canceled' -> 'cancelled'
          totalAmount: parseFloat(booking.totalPrice || '0'),
          travelers: booking.numberOfPeople || 1,
          tourId: booking.tour?.id || booking.tourId,
        }));

        setBookings(transformedBookings);
      } else {
        throw new Error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel booking');
      }

      // Update the booking status in the local state
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: 'cancelled' as const }
            : booking
        )
      );

      toast.success("Booking cancelled successfully");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error(error instanceof Error ? error.message : "Failed to cancel booking");
      throw error; // Re-throw to handle in dialog
    }
  };

  const openCancelDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const closeCancelDialog = () => {
    setCancelDialogOpen(false);
    setSelectedBooking(null);
  };

  const canCancelBooking = (booking: Booking) => {
    if (booking.status === 'cancelled') {
      return false;
    }

    try {
      const travelDate = new Date(booking.travelDate);
      const now = new Date();

      // Check if travel date is valid
      if (isNaN(travelDate.getTime())) {
        return false;
      }

      const hoursDifference = (travelDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursDifference >= 24) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("❌ Cannot cancel: Error calculating cancellation eligibility for booking:", booking.id, error);
      return false;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
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

  if (bookings.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="max-w-md mx-auto">
            <CalendarDays className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No bookings yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start planning your next adventure by browsing our amazing tours.
            </p>
            <Button asChild>
              <Link href="/tours">Browse Tours</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map((booking) => (
          <Card key={booking.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              <img
                src={booking.tourImage || "/placeholder-tour.svg"}
                alt={booking.tourName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-tour.svg";
                }}
              />
              <Badge
                className={`absolute top-2 right-2 ${getStatusColor(booking.status)}`}
              >
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
            </div>

            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                {booking.tourName}
              </h3>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span>Booked: {formatDate(booking.bookingDate)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Travel: {formatDate(booking.travelDate)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{booking.travelers} Traveler{booking.travelers > 1 ? 's' : ''}</span>
                </div>

                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="font-semibold">{formatCurrency(booking.totalAmount)}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" asChild>
                  <Link href={`/tours/${booking.tourId}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    View Tour
                  </Link>
                </Button>

                {canCancelBooking(booking) && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => openCancelDialog(booking)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cancel Booking Dialog */}
      {selectedBooking && (
        <CancelBookingDialog
          booking={{
            id: selectedBooking.id,
            tourName: selectedBooking.tourName,
            travelDate: selectedBooking.travelDate,
            totalAmount: selectedBooking.totalAmount,
            travelers: selectedBooking.travelers,
            status: selectedBooking.status,
          }}
          isOpen={cancelDialogOpen}
          onClose={closeCancelDialog}
          onConfirm={handleCancelBooking}
        />
      )}
    </>
  );
}