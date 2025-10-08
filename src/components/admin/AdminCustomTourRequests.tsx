"use client";

import {
  MapPin, Calendar, Users, DollarSign, Clock, MessageCircle,
  Eye, Loader2, PlusCircle, FileText, Send, Star, Filter
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    case 'submitted': return 'bg-blue-100 text-blue-800';
    case 'under_review': return 'bg-yellow-100 text-yellow-800';
    case 'quoted': return 'bg-purple-100 text-purple-800';
    case 'approved': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'converted_to_booking': return 'bg-emerald-100 text-emerald-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'normal': return 'bg-blue-100 text-blue-800';
    case 'low': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
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
      // Calculate suggested quote based on budget range
      const suggestedAmount = Math.round((request.budgetRange.min + request.budgetRange.max) / 2);
      setQuoteForm({
        totalAmount: suggestedAmount,
        breakdown: {
          'Accommodation': Math.round(suggestedAmount * 0.4),
          'Transportation': Math.round(suggestedAmount * 0.3),
          'Activities': Math.round(suggestedAmount * 0.2),
          'Service Fee': Math.round(suggestedAmount * 0.1)
        },
        validity: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        currency: 'INR',
        terms: 'This quote is valid for 30 days. 25% advance payment required to confirm booking.',
        adminNotes: ''
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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="md:col-span-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All', count: requests.length },
                { key: 'submitted', label: 'New', count: requests.filter(r => r.status === 'submitted').length },
                { key: 'under_review', label: 'Under Review', count: requests.filter(r => r.status === 'under_review').length },
                { key: 'quoted', label: 'Quoted', count: requests.filter(r => r.status === 'quoted').length },
                { key: 'approved', label: 'Approved', count: requests.filter(r => r.status === 'approved').length }
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
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No requests found
            </h3>
            <p className="text-gray-600">
              {filter === 'all'
                ? "No custom tour requests have been submitted yet."
                : `No ${filter} requests at the moment.`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        {request.destination}
                      </CardTitle>
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        Customer: {request.user.name || `${request.user.firstName || ''} ${request.user.lastName || ''}`} ({request.user.email})
                      </p>
                      <p className="text-sm text-gray-500">
                        Request ID: {request.id.slice(0, 8)}... •
                        Submitted: {format(new Date(request.createdAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.replace('_', ' ')}
                    </Badge>
                    {request.specialOccasion && (
                      <Badge variant="outline" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        {request.specialOccasion}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {request.groupSize} people
                      {request.groupComposition ?
                        `(${request.groupComposition.adults}A, ${request.groupComposition.children}C)`
                        : ''
                      }
                    </span>
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
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {request.preferredContactMethod || 'email'}
                    </span>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {request.accommodationPreference && (
                      <div>
                        <span className="font-medium">Accommodation:</span> {request.accommodationPreference}
                      </div>
                    )}
                    {request.transportationPreference && (
                      <div>
                        <span className="font-medium">Transport:</span> {request.transportationPreference}
                      </div>
                    )}
                    {request.activityPreferences && request.activityPreferences.length > 0 && (
                      <div>
                        <span className="font-medium">Activities:</span> {request.activityPreferences.slice(0, 2).join(', ')}
                        {request.activityPreferences.length > 2 && ` +${request.activityPreferences.length - 2} more`}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quote Display */}
                {request.quoteDetails && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-green-800">Quote Generated</h4>
                        <p className="text-green-700">
                          {request.quoteDetails.currency} {request.quoteDetails.totalAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right text-sm text-green-600">
                        <div>Valid until: {format(new Date(request.quoteDetails.validity), "MMM dd, yyyy")}</div>
                        {request.quotedAt && (
                          <div>Quoted: {format(new Date(request.quotedAt), "MMM dd, yyyy")}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <Separator className="my-4" />

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetailsDialog(request)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.success('Messages feature coming soon')}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Messages
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    {/* Status Actions */}
                    {request.status === 'submitted' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateRequestStatus(request.id, 'under_review')}
                        >
                          Start Review
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openQuoteDialog(request)}
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
                      >
                        Edit Quote
                      </Button>
                    )}

                    {request.status === 'approved' && (
                      <Button
                        size="sm"
                        onClick={() => convertToBooking(request)}
                        className="bg-green-600 hover:bg-green-700"
                        isLoading={convertLoading === request.id}
                      >
                        Convert to Booking
                      </Button>
                    )}

                    {/* Priority Actions */}
                    <Select
                      value={request.priority}
                      onValueChange={(priority) => updateRequestStatus(request.id, request.status, { priority })}
                    >
                      <SelectTrigger className="w-24">
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
            <DialogTitle>Generate Quote - {selectedRequest?.destination}</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Customer Budget Reference */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Customer Budget Range</h4>
                <p className="text-blue-800">
                  ₹{selectedRequest.budgetRange.min.toLocaleString()} - ₹{selectedRequest.budgetRange.max.toLocaleString()}
                  {selectedRequest.budgetRange.perPerson ? ' per person' : ' total'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="totalAmount">Total Quote Amount (₹)</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    value={quoteForm.totalAmount}
                    onChange={(e) => setQuoteForm({...quoteForm, totalAmount: parseInt(e.target.value) || 0})}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="validity">Valid Until</Label>
                  <Input
                    id="validity"
                    type="date"
                    value={quoteForm.validity}
                    onChange={(e) => setQuoteForm({...quoteForm, validity: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Cost Breakdown */}
              <div>
                <Label>Cost Breakdown</Label>
                <div className="space-y-2 mt-2">
                  {Object.entries(quoteForm.breakdown || {}).map(([item, amount]) => (
                    <div key={item} className="flex items-center gap-2">
                      <Input
                        placeholder="Item"
                        value={item}
                        onChange={(e) => {
                          const newBreakdown = {...quoteForm.breakdown};
                          delete newBreakdown[item];
                          newBreakdown[e.target.value] = amount;
                          setQuoteForm({...quoteForm, breakdown: newBreakdown});
                        }}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => {
                          const newBreakdown = {...quoteForm.breakdown};
                          newBreakdown[item] = parseInt(e.target.value) || 0;
                          setQuoteForm({...quoteForm, breakdown: newBreakdown});
                        }}
                        className="w-32"
                      />
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
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={quoteForm.terms}
                  onChange={(e) => setQuoteForm({...quoteForm, terms: e.target.value})}
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="adminNotes">Admin Notes (Internal)</Label>
                <Textarea
                  id="adminNotes"
                  value={quoteForm.adminNotes}
                  onChange={(e) => setQuoteForm({...quoteForm, adminNotes: e.target.value})}
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowQuoteDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={generateQuote}>
                  <Send className="h-4 w-4 mr-2" />
                  Generate Quote
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
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <Label className="font-medium">Name:</Label>
                        <p>{selectedRequest.user.name || `${selectedRequest.user.firstName || ''} ${selectedRequest.user.lastName || ''}`}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Email:</Label>
                        <p>{selectedRequest.user.email}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Contact Method:</Label>
                        <p>{selectedRequest.preferredContactMethod || 'Email'}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Best Time to Contact:</Label>
                        <p>{selectedRequest.bestTimeToContact || 'Any time'}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Trip Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <Label className="font-medium">Destination:</Label>
                        <p>{selectedRequest.destination}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Group Size:</Label>
                        <p>{selectedRequest.groupSize} people</p>
                      </div>
                      <div>
                        <Label className="font-medium">Group Composition:</Label>
                        <p>
                          {selectedRequest.groupComposition?.adults || 0} Adults, {selectedRequest.groupComposition?.children || 0} Children
                          {selectedRequest.groupComposition?.ages?.length > 0 &&
                            ` (Ages: ${selectedRequest.groupComposition.ages.join(', ')})`
                          }
                        </p>
                      </div>
                      <div>
                        <Label className="font-medium">Budget Range:</Label>
                        <p>
                          ₹{selectedRequest.budgetRange.min.toLocaleString()} - ₹{selectedRequest.budgetRange.max.toLocaleString()}
                          {selectedRequest.budgetRange.perPerson ? ' per person' : ' total'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {selectedRequest.specialOccasion && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Special Occasion</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedRequest.specialOccasion}</p>
                    </CardContent>
                  </Card>
                )}

                {selectedRequest.additionalNotes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Additional Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedRequest.additionalNotes}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="preferences" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Accommodation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedRequest.accommodationPreference || 'No preference specified'}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Transportation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedRequest.transportationPreference || 'No preference specified'}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Activities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedRequest.activityPreferences && selectedRequest.activityPreferences.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {selectedRequest.activityPreferences.map((activity, index) => (
                            <li key={index}>{activity}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>No specific activities mentioned</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Meal Preferences</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedRequest.mealPreferences && selectedRequest.mealPreferences.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {selectedRequest.mealPreferences.map((meal, index) => (
                            <li key={index}>{meal}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>No specific meal preferences</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {selectedRequest.specialRequirements && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Special Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedRequest.specialRequirements}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="dates" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Preferred Dates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedRequest.preferredDates.map((dateRange, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(dateRange.start), "MMM dd, yyyy")} - {format(new Date(dateRange.end), "MMM dd, yyyy")}
                        </span>
                        {dateRange.flexible && <Badge variant="outline">Flexible</Badge>}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {selectedRequest.alternativeDates && selectedRequest.alternativeDates.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Alternative Dates</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedRequest.alternativeDates.map((dateRange, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(dateRange.start), "MMM dd, yyyy")} - {format(new Date(dateRange.end), "MMM dd, yyyy")}
                          </span>
                          {dateRange.flexible && <Badge variant="outline">Flexible</Badge>}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {selectedRequest.previousTravelExperience && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Previous Travel Experience</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedRequest.previousTravelExperience}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="admin" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Request Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="font-medium">Current Status:</Label>
                      <Badge className={getStatusColor(selectedRequest.status)} style={{ marginLeft: '8px' }}>
                        {selectedRequest.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <Label className="font-medium">Priority:</Label>
                      <Badge className={getPriorityColor(selectedRequest.priority)} style={{ marginLeft: '8px' }}>
                        {selectedRequest.priority}
                      </Badge>
                    </div>
                    <div>
                      <Label className="font-medium">Created:</Label>
                      <p>{format(new Date(selectedRequest.createdAt), "MMM dd, yyyy 'at' h:mm a")}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Last Updated:</Label>
                      <p>{format(new Date(selectedRequest.updatedAt), "MMM dd, yyyy 'at' h:mm a")}</p>
                    </div>
                  </CardContent>
                </Card>

                {selectedRequest.adminNotes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Admin Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{selectedRequest.adminNotes}</p>
                    </CardContent>
                  </Card>
                )}

                {selectedRequest.quoteDetails && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quote Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="font-medium">Total Amount:</Label>
                        <p className="text-2xl font-bold text-green-600">
                          {selectedRequest.quoteDetails.currency} {selectedRequest.quoteDetails.totalAmount.toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <Label className="font-medium">Cost Breakdown:</Label>
                        <div className="mt-2 space-y-1">
                          {Object.entries(selectedRequest.quoteDetails.breakdown || {}).map(([item, amount]) => (
                            <div key={item} className="flex justify-between">
                              <span>{item}:</span>
                              <span>₹{amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="font-medium">Valid Until:</Label>
                        <p>{format(new Date(selectedRequest.quoteDetails.validity), "MMM dd, yyyy")}</p>
                      </div>

                      {selectedRequest.quoteDetails.terms && (
                        <div>
                          <Label className="font-medium">Terms & Conditions:</Label>
                          <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                            {selectedRequest.quoteDetails.terms}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
