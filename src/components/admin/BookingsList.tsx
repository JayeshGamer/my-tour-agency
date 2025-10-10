"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  CalendarCheck, 
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Mail,
  Sparkles
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Booking {
  booking: {
    id: string;
    numberOfPeople: number;
    totalPrice: string;
    status: string;
    bookingDate: Date;
    startDate: Date;
    paymentIntentId?: string | null;
    paymentStatus?: string;
    [key: string]: any;
  };
  tour: {
    id: string;
    name: string;
    location: string;
    [key: string]: any;
  };
  user: {
    id: string;
    email: string;
    name: string | null;
    [key: string]: any;
  };
}

interface BookingsListProps {
  bookings: Booking[];
}

const getStatusBadge = (status: string) => {
  const variants = {
    "Confirmed": { variant: "default", icon: CheckCircle, className: "bg-green-600 hover:bg-green-700 border-green-700" },
    "Pending": { variant: "secondary", icon: Clock, className: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700" },
    "Canceled": { variant: "destructive", icon: XCircle, className: "bg-red-600 hover:bg-red-700 border-red-700" }
  } as const;
  
  const config = variants[status as keyof typeof variants] || variants.Pending;
  const Icon = config.icon;
  
  return (
    <Badge variant={config.variant as any} className={`flex items-center gap-1.5 ${config.className}`}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
};

export default function BookingsList({ bookings }: BookingsListProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    setIsProcessing(bookingId);
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      toast.success(`Booking ${newStatus.toLowerCase()} successfully`);
      router.refresh();
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      toast.error(error.message || 'Failed to update booking status');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRefund = async (bookingId: string, paymentIntentId: string) => {
    setIsProcessing(bookingId);
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentIntentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to process refund');
      }

      toast.success('Refund processed successfully');
      router.refresh();
    } catch (error: any) {
      console.error('Error processing refund:', error);
      toast.error(error.message || 'Failed to process refund');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleSendEmail = async (bookingId: string, emailType: 'confirmation' | 'reminder') => {
    setIsProcessing(bookingId);
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: emailType }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      toast.success(`${emailType} email sent successfully`);
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.error(error.message || 'Failed to send email');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <Card className="border-border overflow-hidden">
      <CardHeader className="border-b border-border bg-gradient-to-r from-card to-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg border border-primary/20">
              <CalendarCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                All Bookings
                <span className="text-sm font-normal text-muted-foreground">
                  ({bookings.length} total)
                </span>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Manage and track all customer bookings</p>
            </div>
          </div>
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border bg-muted/30">
                <TableHead className="text-muted-foreground font-semibold">Booking ID</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Customer</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Tour</TableHead>
                <TableHead className="text-muted-foreground font-semibold">People</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Total</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Booking Date</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Start Date</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                <TableHead className="text-right text-muted-foreground font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length > 0 ? (
                bookings.map((item, index) => (
                  <TableRow
                    key={item.booking.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-mono text-sm text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                        <span className="group-hover:text-primary transition-colors">
                          {item.booking.id.substring(0, 8)}...
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {item.user.name || item.user.email.split("@")[0]}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {item.user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5 max-w-[200px]">
                        <div className="font-medium text-foreground truncate">{item.tour.name}</div>
                        <div className="text-sm text-muted-foreground truncate">{item.tour.location}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-md">
                          <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                            {item.booking.numberOfPeople}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-foreground">
                          ₹{parseFloat(item.booking.totalPrice).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(item.booking.bookingDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(item.booking.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.booking.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isProcessing === item.booking.id}
                            className="hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>

                          {item.booking.status === "Pending" && (
                            <>
                              <DropdownMenuItem
                                className="text-green-600 focus:text-green-600 focus:bg-green-50 dark:focus:bg-green-900/20"
                                onClick={() => handleUpdateStatus(item.booking.id, "Confirmed")}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Confirm Booking
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                                onClick={() => handleUpdateStatus(item.booking.id, "Canceled")}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel Booking
                              </DropdownMenuItem>
                            </>
                          )}

                          {item.booking.status === "Confirmed" && item.booking.paymentIntentId && (
                            <DropdownMenuItem
                              className="text-orange-600 focus:text-orange-600 focus:bg-orange-50 dark:focus:bg-orange-900/20"
                              onClick={() => handleRefund(item.booking.id, item.booking.paymentIntentId!)}
                            >
                              <DollarSign className="mr-2 h-4 w-4" />
                              Process Refund
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem
                            onClick={() => handleSendEmail(item.booking.id, "confirmation")}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Send Confirmation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-16">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                        <CalendarCheck className="relative h-16 w-16 text-muted-foreground/50" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">No bookings found</h3>
                        <p className="text-muted-foreground max-w-sm">
                          Bookings will appear here once customers start booking tours. Try adjusting your filters.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
