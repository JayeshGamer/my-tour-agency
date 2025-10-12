"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarDays, MapPin, Users, Clock, Eye, CheckCircle, XCircle, AlertTriangle, User } from 'lucide-react';
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface PendingTour {
  id: string;
  name: string;
  title: string;
  description: string;
  location: string;
  duration: number;
  pricePerPerson: string;
  status: 'Active' | 'Inactive';
  category: string;
  difficulty: string;
  maxGroupSize: number;
  startDates: string[];
  included: string[];
  notIncluded: string[];
  createdAt: Date;
  createdBy?: string;
  createdByName?: string;
  createdByEmail?: string;
}

export default function CustomToursAdmin() {
  const [tours, setTours] = useState<PendingTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTour, setSelectedTour] = useState<PendingTour | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchPendingTours();
  }, []);

  const fetchPendingTours = async () => {
    try {
      const response = await fetch("/api/admin/tours/pending");
      if (response.ok) {
        const data = await response.json();
        setTours(data);
      } else {
        throw new Error('Failed to fetch tours');
      }
    } catch (error) {
      console.error("Error fetching pending tours:", error);
      toast.error("Failed to load pending tours");
    } finally {
      setLoading(false);
    }
  };

  const handleTourAction = async (tourId: string, action: 'approve' | 'reject') => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/tours/${tourId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          reason: action === 'reject' ? rejectionReason : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} tour`);
      }

      toast.success(`Tour ${action}d successfully`);
      setDialogOpen(false);
      setRejectionReason("");
      fetchPendingTours(); // Refresh the list
    } catch (error) {
      console.error(`Error ${action}ing tour:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${action} tour`);
    } finally {
      setActionLoading(false);
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

  const pendingTours = tours.filter(tour => tour.status === 'Inactive');
  const approvedTours = tours.filter(tour => tour.status === 'Active');

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
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

  return (
    <div className="space-y-8">
      {/* Pending Tours Section */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <h2 className="text-2xl font-bold">Pending Approval ({pendingTours.length})</h2>
        </div>

        {pendingTours.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                All caught up!
              </h3>
              <p className="text-gray-600">
                No custom tours pending approval at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingTours.map((tour) => (
              <Card key={tour.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{tour.name}</CardTitle>
                      <p className="text-sm text-gray-600">{tour.title}</p>
                    </div>
                    <Badge className={getStatusColor(tour.status)}>
                      Pending Review
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{tour.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{tour.duration} days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>Max {tour.maxGroupSize}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(tour.createdAt)}</span>
                    </div>
                  </div>
                  
                  {/* Creator Information */}
                  {tour.createdByName && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>Created by: <span className="font-medium">{tour.createdByName}</span></span>
                        {tour.createdByEmail && (
                          <span className="text-gray-500">({tour.createdByEmail})</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">
                        {formatCurrency(tour.pricePerPerson)} <span className="text-sm font-normal">per person</span>
                      </span>

                      <Dialog open={dialogOpen && selectedTour?.id === tour.id} onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (open) setSelectedTour(tour);
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Review Custom Tour: {tour.name}</DialogTitle>
                            <DialogDescription>
                              Review all details and approve or reject this custom tour submission.
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-6">
                            <div>
                              <h4 className="font-semibold mb-2">Tour Description</h4>
                              <p className="text-gray-600">{tour.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">What's Included</h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                  {tour.included.map((item, index) => (
                                    <li key={index}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Not Included</h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                  {tour.notIncluded.length > 0 ? tour.notIncluded.map((item, index) => (
                                    <li key={index}>{item}</li>
                                  )) : <li className="text-gray-400">Nothing specified</li>}
                                </ul>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Available Dates</h4>
                              <div className="flex flex-wrap gap-2">
                                {tour.startDates.map((date, index) => (
                                  <Badge key={index} variant="secondary">
                                    {formatDate(date)}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Rejection Reason (if rejecting)</h4>
                              <Textarea
                                placeholder="Provide feedback for improvements..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={3}
                              />
                            </div>
                          </div>

                          <DialogFooter className="gap-2">
                            <Button
                              variant="destructive"
                              onClick={() => handleTourAction(tour.id, 'reject')}
                              disabled={actionLoading}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              {actionLoading ? "Processing..." : "Reject"}
                            </Button>
                            <Button
                              onClick={() => handleTourAction(tour.id, 'approve')}
                              disabled={actionLoading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {actionLoading ? "Processing..." : "Approve"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Approved Tours Section */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <h2 className="text-2xl font-bold">Approved Custom Tours ({approvedTours.length})</h2>
        </div>

        {approvedTours.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">No approved custom tours yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedTours.slice(0, 6).map((tour) => (
              <Card key={tour.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{tour.name}</h4>
                    <Badge className="bg-green-100 text-green-800">Live</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{tour.location}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{formatCurrency(tour.pricePerPerson)}</span>
                    <span className="text-xs text-gray-500">{tour.duration} days</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
