"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CalendarDays, MapPin, Users, CreditCard, Eye, X, Clock, CheckCircle2, XCircle, Package, Sparkles } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { CancelBookingDialog } from "./CancelBookingDialog";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

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
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings");
      if (response.ok) {
        const data = await response.json();

        const transformedBookings: Booking[] = data.map((booking: any) => ({
          id: booking.id,
          tourName: booking.tour?.name || 'Unknown Tour',
          tourImage: booking.tour?.imageUrl || booking.tour?.images?.[0] || "/placeholder-tour.svg",
          bookingDate: booking.bookingDate || booking.createdAt,
          travelDate: booking.startDate,
          status: booking.status?.toLowerCase() === 'canceled' ? 'cancelled' : booking.status?.toLowerCase() || 'pending',
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
      throw error;
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

      if (isNaN(travelDate.getTime())) {
        return false;
      }

      const hoursDifference = (travelDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursDifference >= 24;
    } catch (error) {
      console.error("Error calculating cancellation eligibility for booking:", booking.id, error);
      return false;
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "confirmed":
        return {
          color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
          icon: CheckCircle2,
          label: "Confirmed"
        };
      case "pending":
        return {
          color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
          icon: Clock,
          label: "Pending"
        };
      case "cancelled":
        return {
          color: "bg-red-500/10 text-red-500 border-red-500/20",
          icon: XCircle,
          label: "Cancelled"
        };
      default:
        return {
          color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
          icon: Clock,
          label: status
        };
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === "all") return true;
    return booking.status === activeTab;
  });

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    pending: bookings.filter(b => b.status === "pending").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 animate-pulse shadow-sm">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20 mb-3"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-12"></div>
            </div>
          ))}
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-pulse shadow-sm">
              <div className="h-56 bg-gray-200 dark:bg-gray-800"></div>
              <div className="p-6 space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-lg p-12 text-center"
      >
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto">
            <Package className="h-10 w-10 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No bookings yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Start planning your next adventure by exploring our amazing tours.
            </p>
          </div>
          <Button
            size="lg"
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-semibold px-8"
            asChild
          >
            <Link href="/tours">
              Browse Tours
              <Sparkles className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors shadow-sm hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Package className="h-6 w-6 text-gray-900 dark:text-white" />
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors shadow-sm hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium mb-1">Confirmed</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">{stats.confirmed}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950 rounded-2xl p-6 border border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700 transition-colors shadow-sm hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-700 dark:text-amber-400 font-medium mb-1">Pending</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-500">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-500" />
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-950 rounded-2xl p-6 border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 transition-colors shadow-sm hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 dark:text-red-400 font-medium mb-1">Cancelled</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-500">{stats.cancelled}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-500" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1 h-auto shadow-sm">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-gray-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-gray-900 text-gray-700 dark:text-gray-300 px-6 py-2.5 font-semibold"
            >
              All Bookings ({stats.total})
            </TabsTrigger>
            <TabsTrigger
              value="confirmed"
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-gray-600 dark:text-gray-400 px-6 py-2.5 font-semibold"
            >
              Confirmed ({stats.confirmed})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white text-gray-600 dark:text-gray-400 px-6 py-2.5 font-semibold"
            >
              Pending ({stats.pending})
            </TabsTrigger>
            <TabsTrigger
              value="cancelled"
              className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-gray-600 dark:text-gray-400 px-6 py-2.5 font-semibold"
            >
              Cancelled ({stats.cancelled})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-8">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredBookings.map((booking, index) => {
                const statusConfig = getStatusConfig(booking.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="group overflow-hidden bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={booking.tourImage || "/placeholder-tour.svg"}
                          alt={booking.tourName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder-tour.svg";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        <Badge
                          className={`absolute top-4 right-4 ${statusConfig.color} border backdrop-blur-sm px-3 py-1.5 font-semibold`}
                        >
                          <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                          {statusConfig.label}
                        </Badge>
                      </div>

                      <CardContent className="p-6 space-y-4">
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white line-clamp-2 min-h-[3.5rem]">
                          {booking.tourName}
                        </h3>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                              <CalendarDays className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 dark:text-gray-500">Booked</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(booking.bookingDate)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                              <MapPin className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 dark:text-gray-500">Travel Date</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(booking.travelDate)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                              <Users className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 dark:text-gray-500">Travelers</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{booking.travelers} {booking.travelers > 1 ? 'People' : 'Person'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                              <CreditCard className="h-4 w-4 text-gray-900 dark:text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 dark:text-gray-500">Total Amount</p>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(booking.totalAmount)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                            asChild
                          >
                            <Link href={`/tours/${booking.tourId}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Tour
                            </Link>
                          </Button>

                          {canCancelBooking(booking) && (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200"
                              onClick={() => openCancelDialog(booking)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>

            {filteredBookings.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-12 text-center shadow-sm"
              >
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No {activeTab !== 'all' ? activeTab : ''} bookings
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {activeTab === 'all'
                    ? "You haven't made any bookings yet."
                    : `You don't have any ${activeTab} bookings.`}
                </p>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

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
    </div>
  );
}