"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from '@/lib/auth-client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, MapPin, Calendar, Users, DollarSign, Clock,
  MessageCircle, CheckCircle, XCircle, AlertCircle, Loader2
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import Link from "next/link";

interface CustomTourRequest {
  id: string;
  userId: string; // added to fix TypeScript error when checking session ownership
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
}

interface Communication {
  id: string;
  message: string;
  isInternal: boolean;
  attachments?: string[];
  createdAt: string;
  sender: {
    id: string;
    name?: string;
    email: string;
    role?: string;
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'submitted': return <Clock className="h-4 w-4" />;
    case 'under_review': return <AlertCircle className="h-4 w-4" />;
    case 'quoted': return <DollarSign className="h-4 w-4" />;
    case 'approved': return <CheckCircle className="h-4 w-4" />;
    case 'rejected': return <XCircle className="h-4 w-4" />;
    case 'converted_to_booking': return <CheckCircle className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

interface RequestDetailViewProps {
  requestId: string;
}

export default function RequestDetailView({ requestId }: RequestDetailViewProps) {
  const router = useRouter();
  const [request, setRequest] = useState<CustomTourRequest | null>(null);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    fetchRequestDetails();
  }, [requestId]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/custom-tour-requests/${requestId}`);

      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Request not found');
          router.push('/my-requests');
          return;
        }
        throw new Error('Failed to fetch request details');
      }

      const data = await response.json();
      setRequest(data.request);
      setCommunications(data.communications || []);
    } catch (error) {
      console.error('Error fetching request:', error);
      toast.error('Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSendingMessage(true);
      const response = await fetch(`/api/custom-tour-requests/${requestId}/communications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage.trim(),
          isInternal: false
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      setNewMessage("");
      fetchRequestDetails(); // Refresh to show new message
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const approveQuote = async () => {
    try {
      const response = await fetch(`/api/custom-tour-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' }),
      });

      if (!response.ok) throw new Error('Failed to approve quote');

      toast.success('Quote approved! Our team will contact you to finalize the booking.');
      fetchRequestDetails();
    } catch (error) {
      console.error('Error approving quote:', error);
      toast.error('Failed to approve quote');
    }
  };

  const payNow = async () => {
    if (!request?.quoteDetails) return;

    try {
      const checkoutPayload = {
        message: 'Proceeding to payment',
        isInternal: false,
        checkout: {
          type: 'custom_tour',
          amount: request.quoteDetails.totalAmount,
          currency: request.quoteDetails.currency || 'INR',
          groupSize: request.groupSize,
          breakdown: request.quoteDetails.breakdown || {}
        }
      };

      const resp = await fetch(`/api/custom-tour-requests/${requestId}/communications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutPayload)
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        console.error('Checkout creation failed:', err);
        toast.error(err?.error || 'Failed to create checkout');
        return;
      }

      const data = await resp.json();
      if (data.checkoutUrl) {
        // Redirect to checkout (absolute or relative URL returned by API)
        window.location.href = data.checkoutUrl;
      } else {
        toast.error('Checkout URL not returned');
      }
    } catch (error) {
      console.error('Error initiating checkout:', error);
      toast.error('Failed to start payment');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading request details...</span>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Not Found</h2>
        <p className="text-gray-600 mb-6">The requested custom tour request could not be found.</p>
        <Link href="/my-requests">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Requests
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/my-requests">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Requests
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="h-8 w-8 text-blue-600" />
              {request.destination}
            </h1>
            <p className="text-gray-600">Request ID: {request.id.slice(0, 8)}...</p>
          </div>
        </div>

        <Badge className={getStatusColor(request.status)}>
          {getStatusIcon(request.status)}
          <span className="ml-1 capitalize">{request.status.replace('_', ' ')}</span>
        </Badge>
      </div>

      {/* Quote Section */}
      {request.quoteDetails && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Quote Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-800 mb-3">Total Amount</h4>
                <p className="text-2xl font-bold text-green-900">
                  {request.quoteDetails.currency} {request.quoteDetails.totalAmount.toLocaleString()}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-green-800 mb-3">Valid Until</h4>
                <p className="text-green-700">
                  {format(new Date(request.quoteDetails.validity), "MMM dd, yyyy")}
                </p>
              </div>

              {Object.keys(request.quoteDetails.breakdown || {}).length > 0 && (
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-green-800 mb-3">Cost Breakdown</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(request.quoteDetails.breakdown || {}).map(([item, amount]) => (
                      <div key={item} className="flex justify-between">
                        <span className="text-green-700">{item}:</span>
                        <span className="font-medium text-green-900">₹{amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {request.quoteDetails.terms && (
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-green-800 mb-2">Terms & Conditions</h4>
                  <p className="text-sm text-green-700">{request.quoteDetails.terms}</p>
                </div>
              )}
            </div>

            {request.status === 'quoted' && (
              <div className="mt-6 pt-6 border-t border-green-200 flex gap-3">
                <Button onClick={approveQuote} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Quote
                </Button>
                {/* Show Pay Now button to request owner (or admins) when quote exists */}
                {session?.user && (session.user.id === request.userId) && (
                  <Button onClick={payNow} className="bg-emerald-600 hover:bg-emerald-700">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Pay Now
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Request Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Travel Details */}
        <Card>
          <CardHeader>
            <CardTitle>Travel Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Group Size:</span>
                <p>{request.groupSize} people ({request.groupComposition.adults}A, {request.groupComposition.children}C)</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Budget Range:</span>
                <p>₹{request.budgetRange.min.toLocaleString()} - ₹{request.budgetRange.max.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <span className="font-medium text-gray-700 block mb-2">Preferred Dates:</span>
              <div className="space-y-2">
                {request.preferredDates.map((date, index) => (
                  <div key={index} className="bg-blue-50 p-2 rounded">
                    <span className="text-sm">
                      {format(new Date(date.start), "MMM dd, yyyy")} - {format(new Date(date.end), "MMM dd, yyyy")}
                    </span>
                    {date.flexible && <Badge variant="secondary" className="ml-2 text-xs">Flexible</Badge>}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {request.accommodationPreference && (
              <div>
                <span className="font-medium text-gray-700">Accommodation:</span>
                <p className="capitalize">{request.accommodationPreference}</p>
              </div>
            )}

            {request.transportationPreference && (
              <div>
                <span className="font-medium text-gray-700">Transportation:</span>
                <p className="capitalize">{request.transportationPreference}</p>
              </div>
            )}

            {request.activityPreferences && request.activityPreferences.length > 0 && (
              <div>
                <span className="font-medium text-gray-700">Activities:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {request.activityPreferences.map((activity, index) => (
                    <Badge key={index} variant="outline" className="text-xs">{activity}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Communications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Communications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            {communications.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No messages yet. Start a conversation with our team!</p>
            ) : (
              communications.map((comm) => (
                <div key={comm.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium text-gray-900">
                        {comm.sender.name || comm.sender.email}
                      </span>
                      {comm.sender.role === 'Admin' && (
                        <Badge variant="secondary" className="ml-2 text-xs">Team</Badge>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(new Date(comm.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                  <p className="text-gray-700">{comm.message}</p>
                </div>
              ))
            )}
          </div>

          <Separator className="mb-6" />

          {/* Send Message */}
          <div className="space-y-4">
            <h4 className="font-medium">Send a Message</h4>
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={4}
            />
            <Button
              onClick={sendMessage}
              disabled={sendingMessage || !newMessage.trim()}
            >
              {sendingMessage ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <MessageCircle className="h-4 w-4 mr-2" />
              )}
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Request Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Request Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Submitted:</span>
              <span>{format(new Date(request.createdAt), "MMM dd, yyyy 'at' h:mm a")}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Last Updated:</span>
              <span>{format(new Date(request.updatedAt), "MMM dd, yyyy 'at' h:mm a")}</span>
            </div>
            {request.quotedAt && (
              <div className="flex justify-between">
                <span className="font-medium">Quote Generated:</span>
                <span>{format(new Date(request.quotedAt), "MMM dd, yyyy 'at' h:mm a")}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
