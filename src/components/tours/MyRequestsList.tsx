"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin, Calendar, Users, DollarSign, Clock, MessageCircle,
  Eye, CheckCircle, XCircle, AlertCircle, Loader2
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import Link from "next/link";

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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'submitted':
      return 'bg-blue-100 text-blue-800';
    case 'under_review':
      return 'bg-yellow-100 text-yellow-800';
    case 'quoted':
      return 'bg-purple-100 text-purple-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'converted_to_booking':
      return 'bg-emerald-100 text-emerald-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'submitted':
      return <Clock className="h-4 w-4" />;
    case 'under_review':
      return <AlertCircle className="h-4 w-4" />;
    case 'quoted':
      return <DollarSign className="h-4 w-4" />;
    case 'approved':
      return <CheckCircle className="h-4 w-4" />;
    case 'rejected':
      return <XCircle className="h-4 w-4" />;
    case 'converted_to_booking':
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'submitted':
      return 'Submitted';
    case 'under_review':
      return 'Under Review';
    case 'quoted':
      return 'Quote Ready';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'converted_to_booking':
      return 'Booking Confirmed';
    default:
      return status;
  }
};

export default function MyRequestsList() {
  const [requests, setRequests] = useState<CustomTourRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  // keep tab badge counts in sync with the DB
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

  // Auto-refresh data every 30 seconds (keeps current filter)
  useEffect(() => {
    const interval = setInterval(() => fetchRequests(filter), 30000);
    return () => clearInterval(interval);
  }, [filter]);

  // Add manual refresh function
  const handleRefresh = () => {
    fetchRequests(filter);
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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading your requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-4 rounded-lg shadow-sm">
        {[
          { key: 'all', label: 'All Requests', count: counts.all ?? 0 },
          { key: 'submitted', label: 'Submitted', count: counts.submitted ?? 0 },
          { key: 'under_review', label: 'Under Review', count: counts.under_review ?? 0 },
          { key: 'quoted', label: 'Quoted', count: counts.quoted ?? 0 },
          { key: 'approved', label: 'Approved', count: counts.approved ?? 0 }
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? 'default' : 'outline'}
            onClick={() => setFilter(tab.key)}
            className="relative"
          >
            {tab.label}
            <Badge variant="secondary" className="ml-2">{tab.count}</Badge>
          </Button>
        ))}
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No requests found
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all'
                ? "You haven't submitted any custom tour requests yet."
                : `No ${filter} requests at the moment.`
              }
            </p>
            <Button asChild>
              <Link href="/request-custom-tour">
                Create New Request
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      {request.destination}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      Request ID: {request.id.slice(0, 8)}... •
                      Submitted: {format(new Date(request.createdAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1">{getStatusText(request.status)}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{request.groupSize} people</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      ₹{request.budgetRange?.min?.toLocaleString() || '0'} - ₹{request.budgetRange?.max?.toLocaleString() || '0'}
                      {request.budgetRange?.perPerson ? '/person' : ' total'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {format(new Date(request.preferredDates[0].start), "MMM dd")} -
                      {format(new Date(request.preferredDates[0].end), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>

                {/* Status-specific content */}
                {request.status === 'submitted' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Request Submitted</h4>
                    <p className="text-blue-700 text-sm">
                      Your custom tour request has been submitted successfully. Our team will review it and get back to you soon.
                    </p>
                  </div>
                )}

                {request.status === 'under_review' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Under Review</h4>
                    <p className="text-yellow-700 text-sm">
                      Our team is currently reviewing your request and preparing a custom quote for you.
                    </p>
                  </div>
                )}

                {request.status === 'quoted' && request.quoteDetails && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-purple-800 mb-1">Quote Ready!</h4>
                        <p className="text-2xl font-bold text-purple-600">
                          {request.quoteDetails.currency} {request.quoteDetails.totalAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right text-sm text-purple-600">
                        <div>Valid until: {format(new Date(request.quoteDetails.validity), "MMM dd, yyyy")}</div>
                        {request.quotedAt && (
                          <div>Quoted: {format(new Date(request.quotedAt), "MMM dd, yyyy")}</div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <h5 className="font-medium text-purple-800">Cost Breakdown:</h5>
                      {Object.entries(request.quoteDetails.breakdown || {}).map(([item, amount]) => (
                        <div key={item} className="flex justify-between text-sm text-purple-700">
                          <span>{item}:</span>
                          <span>₹{amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    {request.quoteDetails.terms && (
                      <div className="text-xs text-purple-600 bg-purple-100 p-2 rounded">
                        <strong>Terms:</strong> {request.quoteDetails.terms}
                      </div>
                    )}
                  </div>
                )}

                {request.status === 'approved' && request.quoteDetails && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="font-semibold text-green-800 mb-1">🎉 Request Approved!</h4>
                        <p className="text-green-700 text-sm mb-2">
                          Congratulations! Your custom tour has been approved. Proceed to payment to confirm your booking.
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          Total: {request.quoteDetails.currency} {request.quoteDetails.totalAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {request.status === 'rejected' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-red-800 mb-2">Request Not Approved</h4>
                    <p className="text-red-700 text-sm">
                      Unfortunately, we couldn't accommodate this request. Please contact us for alternative options.
                    </p>
                  </div>
                )}

                {request.status === 'converted_to_booking' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-emerald-800 mb-2">✅ Booking Confirmed!</h4>
                    <p className="text-emerald-700 text-sm">
                      Your custom tour has been confirmed and booked. Check your bookings page for more details.
                    </p>
                  </div>
                )}

                <Separator className="my-4" />

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/my-requests/${request.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    {/* If a quote is ready, allow the user to accept & pay */}
                    {request.status === 'quoted' && request.quoteDetails && (
                      <Button
                        onClick={() => handlePayment(request)}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Accept & Pay
                      </Button>
                    )}

                    {request.status === 'approved' && request.quoteDetails && (
                      <Button
                        onClick={() => handlePayment(request)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Proceed to Payment
                      </Button>
                    )}

                    {request.status === 'converted_to_booking' && (
                      <Button variant="outline" asChild>
                        <Link href="/bookings">
                          View Booking
                        </Link>
                      </Button>
                    )}

                    {(request.status === 'submitted' || request.status === 'under_review') && (
                      <Button variant="outline" size="sm" disabled>
                        Waiting for Response
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
