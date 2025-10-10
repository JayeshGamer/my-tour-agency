"use client";

import {
  MapPin, Calendar, Users, DollarSign, Clock, MessageCircle,
  Eye, Loader2, PlusCircle, FileText, Send, Star, Filter, Sparkles,
  Zap, TrendingUp, CheckCircle2, XCircle, AlertCircle, Trash2
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useState, useEffect, useCallback } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { DateInput } from "@/components/ui/date-input";

interface CustomTourRequest {
  id: string;
  destination: string;
  preferredDates: Array<{start: string; end: string; flexible: boolean}>;
  alternativeDates?: Array<{start: string; end: string; flexible: boolean}>;
  groupSize: number;
  groupComposition: {adults: number; children: number; ages: number[]};
  budgetRange: {min: number; max: number; perPerson: boolean; currency: string};
  accommodationPreference?: string;
  activityPreferences?: string[];
  transportationPreference?: string;
  mealPreferences?: string[];
  specialRequirements?: string;
  status: 'submitted' | 'under_review' | 'quoted' | 'approved' | 'rejected' | 'converted_to_booking';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  adminNotes?: string;
  quoteDetails?: {
    totalAmount: number;
    breakdown: Record<string, number>;
    validity: string;
    currency: string;
    terms?: string;
  };
  specialOccasion?: string;
  previousTravelExperience?: string;
  preferredContactMethod?: string;
  bestTimeToContact?: string;
  additionalNotes?: string;
  createdAt: string;
  updatedAt: string;
  quotedAt?: string;
  user: {
    id: string;
    name?: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'submitted':
      return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg shadow-blue-500/50';
    case 'under_review':
      return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg shadow-yellow-500/50';
    case 'quoted':
      return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg shadow-purple-500/50';
    case 'approved':
      return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg shadow-green-500/50';
    case 'rejected':
      return 'bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 shadow-lg shadow-red-500/50';
    case 'converted_to_booking':
      return 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-lg shadow-emerald-500/50';
    default:
      return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white border-0';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'bg-gradient-to-r from-red-600 to-pink-600 text-white border-0 shadow-lg shadow-red-500/50 animate-pulse';
    case 'high':
      return 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-md shadow-orange-500/50';
    case 'normal':
      return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0';
    case 'low':
      return 'bg-gradient-to-r from-gray-400 to-slate-400 text-white border-0';
    default:
      return 'bg-gradient-to-r from-gray-400 to-slate-400 text-white border-0';
  }
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'urgent': return <Zap className="h-3 w-3" />;
    case 'high': return <TrendingUp className="h-3 w-3" />;
    case 'normal': return <AlertCircle className="h-3 w-3" />;
    default: return null;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved': return <CheckCircle2 className="h-3 w-3" />;
    case 'rejected': return <XCircle className="h-3 w-3" />;
    case 'quoted': return <DollarSign className="h-3 w-3" />;
    case 'converted_to_booking': return <Sparkles className="h-3 w-3" />;
    default: return null;
  }
};

export default function AdminCustomTourRequests() {
  const [requests, setRequests] = useState<CustomTourRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<CustomTourRequest | null>(null);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Quote form state
  const [quoteForm, setQuoteForm] = useState({
    totalAmount: 0,
    breakdown: {} as Record<string, number>,
    validity: '',
    currency: 'INR',
    terms: '',
    adminNotes: ''
  });

  const [convertLoading, setConvertLoading] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const url = filter === 'all'
        ? '/api/custom-tour-requests'
        : `/api/custom-tour-requests?status=${filter}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch requests');

      const data = await response.json();
      
      // Additional sanitization on the frontend to ensure safety
      const safeRequests = (data.requests || []).map((request: any) => ({
        ...request,
        quoteDetails: request.quoteDetails ? {
          ...request.quoteDetails,
          breakdown: request.quoteDetails.breakdown || {}
        } : null
      }));
      
      setRequests(safeRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const updateRequestStatus = async (requestId: string, status: string, additionalData?: Record<string, unknown>) => {
    try {
      const response = await fetch(`/api/custom-tour-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, ...additionalData }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast.success('Status updated successfully');
      await fetchRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const generateQuote = async () => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/custom-tour-requests/${selectedRequest.id}/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteForm),
      });

      if (!response.ok) throw new Error('Failed to generate quote');

      toast.success('Quote generated successfully');
      setShowQuoteDialog(false);
      await fetchRequests();
    } catch (error) {
      console.error('Error generating quote:', error);
      toast.error('Failed to generate quote');
    }
  };

  const openQuoteDialog = (request: CustomTourRequest) => {
    setSelectedRequest(request);

    // Initialize quote form with existing data or defaults
    if (request.quoteDetails) {
      setQuoteForm({
        totalAmount: request.quoteDetails.totalAmount,
        breakdown: request.quoteDetails.breakdown || {},
        validity: request.quoteDetails.validity,
        currency: request.quoteDetails.currency,
        terms: request.quoteDetails.terms || '',
        adminNotes: request.adminNotes || ''
      });
    } else {
      // Smart calculation based on customer budget
      const minBudget = request.budgetRange.min;
      const maxBudget = request.budgetRange.max;

      // Calculate duration in days
      const startDate = new Date(request.preferredDates[0].start);
      const endDate = new Date(request.preferredDates[0].end);
      const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      // Calculate total budget range if per person
      let totalMaxBudget = maxBudget;

      if (request.budgetRange.perPerson) {
        totalMaxBudget = maxBudget * request.groupSize;
      }

      // Calculate suggested amount - aim for middle to upper range of customer's budget
      // Use 85-90% of their maximum budget to stay WITHIN their budget
      const targetPercentage = 0.88; // 88% of their max budget
      const suggestedAmount = Math.round(totalMaxBudget * targetPercentage);

      // Smart breakdown based on tour duration, group size, and accommodation preference
      // Adjust percentages based on accommodation type
      let accommodationPercent = 0.35; // Default 35%
      let transportationPercent = 0.25; // Default 25%
      let activitiesPercent = 0.20; // Default 20%
      let mealsPercent = 0.12; // Default 12%
      let serviceFeePercent = 0.08; // Default 8%

      // Adjust for luxury accommodations
      if (request.accommodationPreference?.toLowerCase().includes('luxury') ||
          request.accommodationPreference?.toLowerCase().includes('5-star')) {
        accommodationPercent = 0.40;
        activitiesPercent = 0.18;
        mealsPercent = 0.15;
        transportationPercent = 0.20;
        serviceFeePercent = 0.07;
      }
      // Adjust for budget accommodations
      else if (request.accommodationPreference?.toLowerCase().includes('budget') ||
               request.accommodationPreference?.toLowerCase().includes('hostel')) {
        accommodationPercent = 0.25;
        activitiesPercent = 0.25;
        mealsPercent = 0.10;
        transportationPercent = 0.30;
        serviceFeePercent = 0.10;
      }

      // Calculate breakdown amounts
      const breakdown = {
        'Accommodation': Math.round(suggestedAmount * accommodationPercent),
        'Transportation': Math.round(suggestedAmount * transportationPercent),
        'Activities & Sightseeing': Math.round(suggestedAmount * activitiesPercent),
        'Meals': Math.round(suggestedAmount * mealsPercent),
        'Service Fee & Taxes': Math.round(suggestedAmount * serviceFeePercent)
      };

      // Adjust last item to match exact total (handle rounding differences)
      const breakdownTotal = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
      if (breakdownTotal !== suggestedAmount) {
        breakdown['Service Fee & Taxes'] += (suggestedAmount - breakdownTotal);
      }

      // Calculate validity date (30 days from now)
      const validityDate = new Date();
      validityDate.setDate(validityDate.getDate() + 30);

      setQuoteForm({
        totalAmount: suggestedAmount,
        breakdown: breakdown,
        validity: validityDate.toISOString().split('T')[0],
        currency: 'INR',
        terms: `This quote is valid for 30 days from the date of issue. A minimum of 25% advance payment is required to confirm the booking. The final pricing is for ${request.groupSize} ${request.groupSize === 1 ? 'person' : 'people'} for a ${durationDays}-${durationDays === 1 ? 'day' : 'days'} trip. Prices are subject to availability at the time of booking confirmation.`,
        adminNotes: `Auto-generated quote based on ${request.budgetRange.perPerson ? 'per person' : 'total'} budget of ₹${minBudget.toLocaleString()}-₹${maxBudget.toLocaleString()}. Trip duration: ${durationDays} days. Group size: ${request.groupSize}. Accommodation preference: ${request.accommodationPreference || 'Not specified'}.`
      });
    }

    setShowQuoteDialog(true);
  };

  const openDetailsDialog = (request: CustomTourRequest) => {
    setSelectedRequest(request);
    setShowDetailsDialog(true);
  };

  const convertToBooking = async (request: CustomTourRequest) => {
    try {
      setConvertLoading(request.id);

      // Use the first preferred date as the start date if available
      const startDate = request.preferredDates && request.preferredDates.length > 0
        ? request.preferredDates[0].start
        : new Date().toISOString();

      const travelerInfo = {
        firstName: request.user.firstName || request.user.name?.split(' ')[0] || 'Guest',
        lastName: request.user.lastName || (request.user.name ? request.user.name.split(' ').slice(1).join(' ') : ''),
        email: request.user.email,
        phone: (request as any).phone || ''
      };

      const body = {
        startDate,
        travelerInfo,
        paymentMethod: 'none'
      };

      const res = await fetch(`/api/custom-tour-requests/${request.id}/convert-to-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Convert to booking failed:', err);
        toast.error((err && (err.error || err.message)) || 'Failed to convert request to booking');
        return;
      }

      const data = await res.json();
      toast.success(data?.message || 'Request converted to booking');

      // Refresh list
      await fetchRequests();
    } catch (error) {
      console.error('Error converting to booking:', error);
      toast.error('Failed to convert request to booking');
    } finally {
      setConvertLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full blur-2xl opacity-50 animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 relative" />
        </div>
        <p className="mt-4 text-lg font-medium text-muted-foreground">Loading amazing tour requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-border/50 shadow-xl bg-gradient-to-br from-card via-card to-muted/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-transparent rounded-full blur-3xl" />
        <CardHeader className="pb-4 relative">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
              Filter Requests
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'all', label: 'All', count: requests.length, gradient: 'from-blue-500 to-cyan-500' },
              { key: 'submitted', label: 'New', count: requests.filter(r => r.status === 'submitted').length, gradient: 'from-blue-500 to-indigo-500' },
              { key: 'under_review', label: 'Under Review', count: requests.filter(r => r.status === 'under_review').length, gradient: 'from-yellow-500 to-orange-500' },
              { key: 'quoted', label: 'Quoted', count: requests.filter(r => r.status === 'quoted').length, gradient: 'from-purple-500 to-pink-500' },
              { key: 'approved', label: 'Approved', count: requests.filter(r => r.status === 'approved').length, gradient: 'from-green-500 to-emerald-500' }
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={filter === tab.key ? 'default' : 'outline'}
                onClick={() => setFilter(tab.key)}
                size="sm"
                className={cn(
                  "transition-all duration-300 hover:scale-105",
                  filter === tab.key && `bg-gradient-to-r ${tab.gradient} text-white shadow-lg hover:shadow-xl border-0`
                )}
              >
                {tab.label}
                <Badge
                  variant={filter === tab.key ? "secondary" : "outline"}
                  className={cn(
                    "ml-2 transition-all",
                    filter === tab.key && "bg-white/20 text-white border-white/30"
                  )}
                >
                  {tab.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card className="border-border/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5" />
          <CardContent className="text-center py-20 relative">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="relative p-8 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-600/10 ring-2 ring-purple-500/20">
                  <FileText className="h-20 w-20 text-purple-600" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  No requests found
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {filter === 'all'
                    ? "No custom tour requests have been submitted yet. Check back soon!"
                    : `No ${filter.replace('_', ' ')} requests at the moment.`
                  }
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <span>Ready to handle new requests!</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request, index) => (
            <Card
              key={request.id}
              className={cn(
                "border-border/50 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group",
                "animate-in slide-in-from-top-5"
              )}
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
            >
              {/* Gradient glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Priority indicator bar */}
              {(request.priority === 'urgent' || request.priority === 'high') && (
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1.5",
                  request.priority === 'urgent'
                    ? "bg-gradient-to-b from-red-500 to-pink-600 animate-pulse"
                    : "bg-gradient-to-b from-orange-500 to-amber-500"
                )} />
              )}

              <CardHeader className="pb-4 relative">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                          {request.destination}
                        </CardTitle>
                      </div>
                      <Badge className={cn(getPriorityColor(request.priority), "gap-1")}>
                        {getPriorityIcon(request.priority)}
                        {request.priority.toUpperCase()}
                      </Badge>
                      <Badge className={cn(getStatusColor(request.status), "gap-1")}>
                        {getStatusIcon(request.status)}
                        {request.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        Customer: {request.user.name || `${request.user.firstName || ''} ${request.user.lastName || ''}`}
                      </p>
                      <p className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-purple-500" />
                        {request.user.email}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        Request ID: {request.id.slice(0, 8)}... •
                        Submitted: {format(new Date(request.createdAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                  {request.specialOccasion && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 shadow-lg shadow-yellow-500/50 gap-1">
                      <Star className="h-3 w-3 fill-white" />
                      {request.specialOccasion}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 relative">
                {/* Quick Info Grid with gradients */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/50 dark:border-purple-800/50">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Group Size</p>
                      <p className="text-sm font-bold text-foreground">
                        {request.groupSize} people
                        {request.groupComposition &&
                          <span className="text-xs font-normal text-muted-foreground ml-1">
                            ({request.groupComposition.adults}A, {request.groupComposition.children}C)
                          </span>
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/50">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 shadow-md">
                      <DollarSign className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Budget</p>
                      <p className="text-sm font-bold text-foreground">
                        ₹{request.budgetRange?.min?.toLocaleString() || '0'} - ₹{request.budgetRange?.max?.toLocaleString() || '0'}
                        <span className="text-xs font-normal text-muted-foreground">
                          {request.budgetRange?.perPerson ? '/person' : ' total'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200/50 dark:border-blue-800/50">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Travel Dates</p>
                      <p className="text-sm font-bold text-foreground">
                        {format(new Date(request.preferredDates[0].start), "MMM dd")} -
                        {format(new Date(request.preferredDates[0].end), "MMM dd")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200/50 dark:border-orange-800/50">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 shadow-md">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Contact</p>
                      <p className="text-sm font-bold text-foreground capitalize">
                        {request.preferredContactMethod || 'email'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                {(request.accommodationPreference || request.transportationPreference || request.activityPreferences) && (
                  <div className="p-4 rounded-xl border border-border bg-gradient-to-br from-muted/50 to-muted/30">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {request.accommodationPreference && (
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                            Accommodation
                          </p>
                          <p className="text-muted-foreground">{request.accommodationPreference}</p>
                        </div>
                      )}
                      {request.transportationPreference && (
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                            Transport
                          </p>
                          <p className="text-muted-foreground">{request.transportationPreference}</p>
                        </div>
                      )}
                      {request.activityPreferences && request.activityPreferences.length > 0 && (
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" />
                            Activities
                          </p>
                          <p className="text-muted-foreground">
                            {request.activityPreferences.slice(0, 2).join(', ')}
                            {request.activityPreferences.length > 2 && ` +${request.activityPreferences.length - 2} more`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quote Display */}
                {request.quoteDetails && (
                  <div className="p-5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-300 dark:border-green-800 shadow-lg shadow-green-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-2xl" />
                    <div className="flex justify-between items-center relative">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <h4 className="font-bold text-green-800 dark:text-green-400">Quote Generated</h4>
                        </div>
                        <p className="text-3xl font-black bg-gradient-to-r from-green-700 to-emerald-700 dark:from-green-300 dark:to-emerald-300 bg-clip-text text-transparent">
                          {request.quoteDetails.currency} {request.quoteDetails.totalAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right text-sm space-y-1">
                        <div className="flex items-center gap-2 justify-end text-green-700 dark:text-green-300">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">Valid until: {format(new Date(request.quoteDetails.validity), "MMM dd, yyyy")}</span>
                        </div>
                        {request.quotedAt && (
                          <div className="text-green-600 dark:text-green-400">
                            Quoted: {format(new Date(request.quotedAt), "MMM dd, yyyy")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetailsDialog(request)}
                      className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:hover:bg-blue-950/50 transition-all"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.success('Messages feature coming soon')}
                      className="hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 dark:hover:bg-purple-950/50 transition-all"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Messages
                    </Button>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {/* Status Actions */}
                    {request.status === 'submitted' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateRequestStatus(request.id, 'under_review')}
                          className="hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-300 dark:hover:bg-yellow-950/50 transition-all"
                        >
                          Start Review
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openQuoteDialog(request)}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/50 hover:shadow-xl hover:scale-105 transition-all"
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Generate Quote
                        </Button>
                      </>
                    )}

                    {request.status === 'under_review' && (
                      <Button
                        size="sm"
                        onClick={() => openQuoteDialog(request)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/50 hover:shadow-xl hover:scale-105 transition-all"
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Generate Quote
                      </Button>
                    )}

                    {request.status === 'quoted' && (
                      <Button
                        size="sm"
                        onClick={() => openQuoteDialog(request)}
                        variant="outline"
                        className="hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 dark:hover:bg-purple-950/50"
                      >
                        Edit Quote
                      </Button>
                    )}

                    {request.status === 'approved' && (
                      <Button
                        size="sm"
                        onClick={() => convertToBooking(request)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/50 hover:shadow-xl hover:scale-105 transition-all"
                        disabled={convertLoading === request.id}
                      >
                        {convertLoading === request.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Convert to Booking
                      </Button>
                    )}

                    {/* Priority Selector */}
                    <Select
                      value={request.priority}
                      onValueChange={(priority) => updateRequestStatus(request.id, request.status, { priority })}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quote Generation Dialog */}
      <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Generate Quote - {selectedRequest?.destination}
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Customer Budget Reference */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h4 className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Customer Budget Range
                    </h4>
                    <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                      ₹{selectedRequest.budgetRange.min.toLocaleString()} - ₹{selectedRequest.budgetRange.max.toLocaleString()}
                      <span className="text-sm font-normal ml-2">
                        {selectedRequest.budgetRange.perPerson ? `per person (Total: ₹${(selectedRequest.budgetRange.min * selectedRequest.groupSize).toLocaleString()} - ₹${(selectedRequest.budgetRange.max * selectedRequest.groupSize).toLocaleString()})` : 'total'}
                      </span>
                    </p>
                  </div>
                  <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                    {selectedRequest.groupSize} {selectedRequest.groupSize === 1 ? 'Person' : 'People'}
                  </Badge>
                </div>
                <div className="mt-3 text-sm text-blue-700 dark:text-blue-300">
                  <p>Duration: {Math.ceil((new Date(selectedRequest.preferredDates[0].end).getTime() - new Date(selectedRequest.preferredDates[0].start).getTime()) / (1000 * 60 * 60 * 24))} days</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="totalAmount" className="text-base font-semibold">
                    Total Quote Amount (₹) *
                  </Label>
                  <Input
                    id="totalAmount"
                    type="text"
                    value={quoteForm.totalAmount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setQuoteForm({...quoteForm, totalAmount: parseInt(value) || 0});
                    }}
                    className="text-lg font-semibold"
                    placeholder="Enter total amount"
                  />
                  <p className="text-xs text-muted-foreground">
                    Suggested: ₹{Math.round(selectedRequest.budgetRange.perPerson ? selectedRequest.budgetRange.max * selectedRequest.groupSize * 0.88 : selectedRequest.budgetRange.max * 0.88).toLocaleString()} (88% of max - within customer budget)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validity" className="text-base font-semibold">
                    Valid Until *
                  </Label>
                  <DateInput
                    date={quoteForm.validity ? new Date(quoteForm.validity) : undefined}
                    onDateChange={(date) => {
                      if (date) {
                        setQuoteForm({...quoteForm, validity: date.toISOString().split('T')[0]});
                      }
                    }}
                    placeholder="Select validity date"
                  />
                  <p className="text-xs text-muted-foreground">
                    Quote will be valid for 30 days
                  </p>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Cost Breakdown</Label>
                  <Badge variant="outline" className="text-xs">
                    Total: ₹{Object.values(quoteForm.breakdown || {}).reduce((sum, val) => sum + val, 0).toLocaleString()}
                  </Badge>
                </div>
                <div className="p-4 rounded-xl border-2 border-border bg-muted/30 space-y-3">
                  {Object.entries(quoteForm.breakdown || {}).map(([item, amount]) => (
                    <div key={item} className="grid grid-cols-12 gap-2 items-center">
                      <Input
                        placeholder="Item name"
                        value={item}
                        onChange={(e) => {
                          const newBreakdown = {...quoteForm.breakdown};
                          delete newBreakdown[item];
                          newBreakdown[e.target.value] = amount;
                          setQuoteForm({...quoteForm, breakdown: newBreakdown});
                        }}
                        className="col-span-5"
                      />
                      <div className="col-span-6 flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">₹</span>
                        <Input
                          type="text"
                          placeholder="Amount"
                          value={amount}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            const newBreakdown = {...quoteForm.breakdown};
                            newBreakdown[item] = parseInt(value) || 0;
                            setQuoteForm({...quoteForm, breakdown: newBreakdown});
                          }}
                          className="flex-1"
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap min-w-[40px]">
                          {quoteForm.totalAmount > 0 ? `${((amount / quoteForm.totalAmount) * 100).toFixed(0)}%` : '0%'}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newBreakdown = {...quoteForm.breakdown};
                          delete newBreakdown[item];
                          setQuoteForm({...quoteForm, breakdown: newBreakdown});
                        }}
                        className="col-span-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuoteForm({
                      ...quoteForm,
                      breakdown: {...quoteForm.breakdown, 'New Item': 0}
                    })}
                    className="w-full mt-2"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Breakdown Item
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms" className="text-base font-semibold">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={quoteForm.terms}
                  onChange={(e) => setQuoteForm({...quoteForm, terms: e.target.value})}
                  rows={4}
                  className="resize-none"
                  placeholder="Enter terms and conditions for this quote..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminNotes" className="text-base font-semibold">Admin Notes (Internal Only)</Label>
                <Textarea
                  id="adminNotes"
                  value={quoteForm.adminNotes}
                  onChange={(e) => setQuoteForm({...quoteForm, adminNotes: e.target.value})}
                  rows={3}
                  className="resize-none"
                  placeholder="Add internal notes about this quote..."
                />
              </div>

              <Separator />

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowQuoteDialog(false)}
                  size="lg"
                >
                  Cancel
                </Button>
                <Button
                  onClick={generateQuote}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Generate & Send Quote
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Details - {selectedRequest?.destination}</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="dates">Dates & Travel</TabsTrigger>
                <TabsTrigger value="admin">Admin Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* ...existing overview content... */}
              </TabsContent>

              <TabsContent value="preferences" className="space-y-4">
                {/* ...existing preferences content... */}
              </TabsContent>

              <TabsContent value="dates" className="space-y-4">
                {/* ...existing dates content... */}
              </TabsContent>

              <TabsContent value="admin" className="space-y-4">
                {/* ...existing admin content... */}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
