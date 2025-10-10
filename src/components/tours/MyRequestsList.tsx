"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RainbowButton } from "@/components/ui/rainbow-button";
import {
  MapPin, Calendar, Users, DollarSign, Clock, MessageCircle,
  Eye, CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw,
  Sparkles, TrendingUp, Package, ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CustomTourRequest {
  id: string;
  destination: string;
  preferredDates: Array<{start: string; end: string; flexible: boolean}>;
  groupSize: number;
  budgetRange: {min: number; max: number; perPerson: boolean; currency: string};
  status: 'submitted' | 'under_review' | 'quoted' | 'approved' | 'rejected' | 'converted_to_booking';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  quotedAt?: string;
  quoteDetails?: {
    totalAmount: number;
    breakdown: Record<string, number>;
    validity: string;
    currency: string;
    terms?: string;
  };
}

const getStatusConfig = (status: string) => {
  const configs = {
    submitted: {
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: Clock,
      label: 'Submitted',
      description: 'Your request is in our queue'
    },
    under_review: {
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: AlertCircle,
      label: 'Under Review',
      description: 'Our team is reviewing your request'
    },
    quoted: {
      color: 'bg-purple-500',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      icon: DollarSign,
      label: 'Quote Ready',
      description: 'Your custom quote is ready!'
    },
    approved: {
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: CheckCircle,
      label: 'Approved',
      description: 'Proceed to payment'
    },
    rejected: {
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: XCircle,
      label: 'Not Approved',
      description: 'Contact us for alternatives'
    },
    converted_to_booking: {
      color: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      icon: CheckCircle,
      label: 'Booked',
      description: 'Your booking is confirmed!'
    }
  };
  return configs[status as keyof typeof configs] || configs.submitted;
};

export default function MyRequestsList() {
  const [requests, setRequests] = useState<CustomTourRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const [counts, setCounts] = useState<Record<string, number>>({
    all: 0,
    submitted: 0,
    under_review: 0,
    quoted: 0,
    approved: 0
  });

  // Clear any potentially bad cached data on component mount
  useEffect(() => setRequests([]), []);

  // Fetch counts initially and fetch requests whenever filter changes
  useEffect(() => {
    fetchCounts();
  }, []);

  useEffect(() => {
    fetchRequests(filter);
  }, [filter]);

  // Fetch requests optionally filtered by status (calling backend)
  const fetchRequests = async (status: string = 'all') => {
    try {
      setLoading(true);
      const url = status === 'all' ? '/api/custom-tour-requests' : `/api/custom-tour-requests?status=${encodeURIComponent(status)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch requests');
      const data = await res.json();

      const safeRequests = (data.requests || []).map((r: any) => ({
        ...r,
        quoteDetails: r.quoteDetails ? { ...r.quoteDetails, breakdown: r.quoteDetails.breakdown || {} } : null
      }));

      setRequests(safeRequests);

      // refresh counts so badges reflect the latest DB state
      fetchCounts();
    } catch (err) {
      console.error('Error fetching requests:', err);
      toast.error('Failed to load your requests');
    } finally {
      setLoading(false);
    }
  };

  // Fetch counts used for the tab badges (keeps badges accurate)
  const fetchCounts = async () => {
    try {
      const res = await fetch('/api/custom-tour-requests');
      if (!res.ok) return;
      const data = await res.json();
      const all = (data.requests || []);
      setCounts({
        all: all.length,
        submitted: all.filter((r: any) => r.status === 'submitted').length,
        under_review: all.filter((r: any) => r.status === 'under_review').length,
        quoted: all.filter((r: any) => r.status === 'quoted').length,
        approved: all.filter((r: any) => r.status === 'approved').length
      });
    } catch (err) {
      console.error('Failed to fetch counts', err);
    }
  };

  // Add manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRequests(filter);
    setRefreshing(false);
    toast.success('Refreshed successfully!');
  };

  const handlePayment = (request: CustomTourRequest) => {
    // Create checkout session with custom tour data
    const checkoutData = {
      type: 'custom_tour',
      requestId: request.id,
      destination: request.destination,
      amount: request.quoteDetails?.totalAmount || 0,
      currency: request.quoteDetails?.currency || 'INR',
      groupSize: request.groupSize,
      dates: request.preferredDates,
      breakdown: request.quoteDetails?.breakdown || {}
    };

    // Redirect to checkout with custom tour data
    const queryParams = new URLSearchParams({
      data: JSON.stringify(checkoutData)
    });

    window.location.href = `/checkout?${queryParams.toString()}`;
  };

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(request => request.status === filter);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-12 w-12 text-blue-600" />
        </motion.div>
        <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Loading your requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modern Filter Tabs with Stats */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-2 shadow-xl border-2 border-gray-200 dark:border-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All', icon: Package, count: counts.all ?? 0 },
              { key: 'submitted', label: 'Submitted', icon: Clock, count: counts.submitted ?? 0 },
              { key: 'under_review', label: 'Reviewing', icon: AlertCircle, count: counts.under_review ?? 0 },
              { key: 'quoted', label: 'Quoted', icon: DollarSign, count: counts.quoted ?? 0 },
              { key: 'approved', label: 'Approved', icon: CheckCircle, count: counts.approved ?? 0 }
            ].map((tab) => {
              const isActive = filter === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={cn(
                    "relative px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2",
                    isActive
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg scale-105"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  <Badge
                    variant="secondary"
                    className={cn(
                      "ml-1 px-2 py-0.5 text-xs font-bold",
                      isActive ? "bg-white/20 text-white dark:bg-gray-900/20 dark:text-gray-900" : ""
                    )}
                  >
                    {tab.count}
                  </Badge>
                </button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-2 border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Requests List with Animations */}
      <AnimatePresence mode="wait">
        {filteredRequests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Card className="border-2 border-gray-200 dark:border-gray-800 shadow-xl">
              <CardContent className="text-center py-20">
                <div className="inline-flex p-6 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
                  <MessageCircle className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  No requests found
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto text-lg">
                  {filter === 'all'
                    ? "You haven't submitted any custom tour requests yet. Start planning your dream vacation today!"
                    : `No ${filter.replace('_', ' ')} requests at the moment.`
                  }
                </p>
                <RainbowButton
                  variant="black"
                  className="shadow-lg"
                  asChild
                >
                  <Link href="/request-custom-tour">
                    <Sparkles className="h-4 w-4 mr-2 inline" />
                    Create New Request
                  </Link>
                </RainbowButton>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-6"
          >
            {filteredRequests.map((request, index) => {
              const statusConfig = getStatusConfig(request.status);
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group border-2 border-gray-200 dark:border-gray-800 hover:border-gray-900 dark:hover:border-gray-300 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    {/* Status Bar */}
                    <div className={cn("h-2", statusConfig.color)} />

                    <CardHeader className="pb-4">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                              <MapPin className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                {request.destination}
                              </CardTitle>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <span className="font-mono">#{request.id.slice(0, 8)}</span>
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {format(new Date(request.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Badge
                          className={cn(
                            "px-4 py-2 text-sm font-semibold border-2 flex items-center gap-2 whitespace-nowrap",
                            statusConfig.bgColor,
                            statusConfig.textColor,
                            statusConfig.borderColor
                          )}
                        >
                          <StatusIcon className="h-4 w-4" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Trip Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                          <div className="p-2 rounded-lg bg-purple-500/10">
                            <Users className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Group Size</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{request.groupSize} {request.groupSize === 1 ? 'Person' : 'People'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                          <div className="p-2 rounded-lg bg-green-500/10">
                            <DollarSign className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Budget Range</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              ₹{request.budgetRange?.min?.toLocaleString() || '0'}-{request.budgetRange?.max?.toLocaleString() || '0'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                          <div className="p-2 rounded-lg bg-orange-500/10">
                            <Calendar className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Travel Dates</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {format(new Date(request.preferredDates[0].start), "MMM dd")}-{format(new Date(request.preferredDates[0].end), "dd, yyyy")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status-specific Content */}
                      {request.status === 'submitted' && (
                        <div className={cn("rounded-xl p-5 border-2", statusConfig.bgColor, statusConfig.borderColor)}>
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                              <Clock className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-blue-900 dark:text-blue-800 mb-1">Request Submitted Successfully</h4>
                              <p className="text-sm text-blue-700 dark:text-blue-600">
                                Your custom tour request is in our queue. Our expert team will review it and get back to you within 24 hours.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {request.status === 'under_review' && (
                        <div className={cn("rounded-xl p-5 border-2", statusConfig.bgColor, statusConfig.borderColor)}>
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-yellow-500/20">
                              <TrendingUp className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-yellow-900 dark:text-yellow-800 mb-1">Team is Reviewing</h4>
                              <p className="text-sm text-yellow-700 dark:text-yellow-600">
                                Our travel experts are analyzing your requirements and preparing a personalized quote for your dream vacation.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {request.status === 'quoted' && request.quoteDetails && (
                        <div className={cn("rounded-xl p-6 border-2", statusConfig.bgColor, statusConfig.borderColor)}>
                          <div className="flex flex-col lg:flex-row justify-between gap-4 mb-5">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-5 w-5 text-purple-600" />
                                <h4 className="font-bold text-purple-900 dark:text-purple-800 text-lg">Your Custom Quote is Ready!</h4>
                              </div>
                              <p className="text-4xl font-bold text-purple-700 dark:text-purple-600">
                                {request.quoteDetails.currency} {request.quoteDetails.totalAmount.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-left lg:text-right space-y-1">
                              <div className="text-sm text-purple-600">
                                <span className="font-medium">Valid until:</span>
                                <br />
                                <span className="text-lg font-bold">{format(new Date(request.quoteDetails.validity), "MMM dd, yyyy")}</span>
                              </div>
                              {request.quotedAt && (
                                <p className="text-xs text-purple-500">
                                  Quoted: {format(new Date(request.quotedAt), "MMM dd, yyyy")}
                                </p>
                              )}
                            </div>
                          </div>

                          <Separator className="my-4 bg-purple-200" />

                          <div className="space-y-3">
                            <h5 className="font-bold text-purple-900 dark:text-purple-800 flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Cost Breakdown
                            </h5>
                            <div className="grid gap-2">
                              {Object.entries(request.quoteDetails.breakdown || {}).map(([item, amount]) => (
                                <div key={item} className="flex justify-between items-center p-3 rounded-lg bg-purple-100/50 dark:bg-purple-900/20">
                                  <span className="text-sm font-medium text-purple-800 dark:text-purple-700">{item}</span>
                                  <span className="text-sm font-bold text-purple-900 dark:text-purple-800">₹{(amount as number).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {request.quoteDetails.terms && (
                            <div className="mt-4 text-xs text-purple-700 dark:text-purple-600 bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
                              <strong className="block mb-1">Terms & Conditions:</strong>
                              {request.quoteDetails.terms}
                            </div>
                          )}
                        </div>
                      )}

                      {request.status === 'approved' && request.quoteDetails && (
                        <div className={cn("rounded-xl p-6 border-2", statusConfig.bgColor, statusConfig.borderColor)}>
                          <div className="text-center space-y-4">
                            <div className="inline-flex p-4 rounded-full bg-green-500/20">
                              <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-green-900 dark:text-green-800 text-2xl mb-2">🎉 Request Approved!</h4>
                              <p className="text-green-700 dark:text-green-600 mb-4">
                                Congratulations! Your custom tour has been approved. Complete your payment to confirm your booking.
                              </p>
                              <p className="text-3xl font-bold text-green-600">
                                Total: {request.quoteDetails.currency} {request.quoteDetails.totalAmount.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {request.status === 'rejected' && (
                        <div className={cn("rounded-xl p-5 border-2", statusConfig.bgColor, statusConfig.borderColor)}>
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-red-500/20">
                              <XCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-red-900 dark:text-red-800 mb-1">Request Not Approved</h4>
                              <p className="text-sm text-red-700 dark:text-red-600">
                                Unfortunately, we couldn't accommodate this particular request. Please contact our support team to explore alternative options.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {request.status === 'converted_to_booking' && (
                        <div className={cn("rounded-xl p-5 border-2", statusConfig.bgColor, statusConfig.borderColor)}>
                          <div className="text-center space-y-3">
                            <div className="inline-flex p-3 rounded-full bg-emerald-500/20">
                              <CheckCircle className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-emerald-900 dark:text-emerald-800 text-lg mb-1">✅ Booking Confirmed!</h4>
                              <p className="text-sm text-emerald-700 dark:text-emerald-600">
                                Your custom tour has been confirmed. Check your bookings page for complete details and itinerary.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <Separator />

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <Button
                          variant="outline"
                          className="border-2 border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white group"
                          asChild
                        >
                          <Link href={`/my-requests/${request.id}`} className="flex items-center justify-center gap-2">
                            <Eye className="h-4 w-4" />
                            View Full Details
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </Button>

                        <div className="flex gap-2">
                          {request.status === 'quoted' && request.quoteDetails && (
                            <RainbowButton
                              variant="green"
                              onClick={() => handlePayment(request)}
                              className="shadow-lg"
                            >
                              <span className="flex items-center gap-2">
                                ₹
                                Accept & Pay
                              </span>
                            </RainbowButton>
                          )}

                          {request.status === 'approved' && request.quoteDetails && (
                            <RainbowButton
                              variant="green"
                              onClick={() => handlePayment(request)}
                              className="shadow-lg"
                            >
                              <span className="flex items-center gap-2">
                                ₹
                                Proceed to Payment
                              </span>
                            </RainbowButton>
                          )}

                          {request.status === 'converted_to_booking' && (
                            <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
                              <Link href="/bookings" className="flex items-center gap-2">
                                View Booking
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}

                          {(request.status === 'submitted' || request.status === 'under_review') && (
                            <Button variant="outline" disabled className="opacity-50">
                              <Clock className="h-4 w-4 mr-2" />
                              Awaiting Response
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
