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
  Mail
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
    paymentIntentId: string | null;
  };
  tour: {
    id: string;
    name: string;
    location: string;
  };
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

interface BookingsListProps {
  bookings: Booking[];
}

const getStatusBadge = (status: string) => {
  const variants = {
    "Confirmed": { variant: "default", icon: CheckCircle, className: "bg-green-600" },
    "Pending": { variant: "secondary", icon: Clock, className: "text-yellow-600 border-yellow-600" },
    "Canceled": { variant: "destructive", icon: XCircle, className: "" }
  } as const;
  
  const config = variants[status as keyof typeof variants] || variants.Pending;
  const Icon = config.icon;
  
  return (
    <Badge variant={config.variant as any} className={`flex items-center gap-1 ${config.className}`}>
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
    <Card>
      <CardHeader>
        <CardTitle>All Bookings ({bookings.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Tour</TableHead>
              <TableHead>People</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Booking Date</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length > 0 ? (
              bookings.map((item) => (
                <TableRow key={item.booking.id}>
                  <TableCell className="font-mono text-sm">
                    {item.booking.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {item.user.name || item.user.email.split("@")[0]}
                      </div>
                      <div className="text-sm text-gray-500">{item.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.tour.name}</div>
                      <div className="text-sm text-gray-500">{item.tour.location}</div>
                    </div>
                  </TableCell>
                  <TableCell>{item.booking.numberOfPeople}</TableCell>
                  <TableCell className="font-semibold">
                    ₹{parseFloat(item.booking.totalPrice).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(item.booking.bookingDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(item.booking.startDate).toLocaleDateString()}
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
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        
                        {item.booking.status === "Pending" && (
                          <>
                            <DropdownMenuItem 
                              className="text-green-600"
                              onClick={() => handleUpdateStatus(item.booking.id, "Confirmed")}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Confirm Booking
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleUpdateStatus(item.booking.id, "Canceled")}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel Booking
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        {item.booking.status === "Confirmed" && item.booking.paymentIntentId && (
                          <DropdownMenuItem 
                            className="text-orange-600"
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
                <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                  <CalendarCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600">No bookings found</h3>
                  <p className="text-gray-500 mt-2">Bookings will appear here once customers start booking tours.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
