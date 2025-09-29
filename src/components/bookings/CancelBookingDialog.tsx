"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, CreditCard, Users } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";

interface CancelBookingDialogProps {
  booking: {
    id: string;
    tourName: string;
    travelDate: string;
    totalAmount: number;
    travelers: number;
    status: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingId: string) => Promise<void>;
  isLoading?: boolean;
}

export function CancelBookingDialog({
  booking,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}: CancelBookingDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onConfirm(booking.id);
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if booking can be cancelled (24 hours before travel)
  const canCancel = (() => {
    if (booking.status === 'cancelled') return false;

    try {
      const travelDate = new Date(booking.travelDate);
      const now = new Date();

      // Check if travel date is valid
      if (isNaN(travelDate.getTime())) {
        console.error("Invalid travel date:", booking.travelDate);
        return false;
      }

      const hoursDifference = (travelDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursDifference >= 24;
    } catch (error) {
      console.error("Error calculating cancellation eligibility:", error);
      return false;
    }
  })();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Cancel Booking
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Booking Details */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold text-sm text-gray-900">{booking.tourName}</h4>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(booking.travelDate)}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4" />
                <span>{booking.travelers} traveler{booking.travelers > 1 ? 's' : ''}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600 col-span-2">
                <CreditCard className="h-4 w-4" />
                <span className="font-semibold">{formatCurrency(booking.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          {!canCancel ? (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="font-medium text-red-800 mb-1">Cannot Cancel</h5>
                  <p className="text-sm text-red-700">
                    {booking.status === 'cancelled'
                      ? 'This booking has already been cancelled.'
                      : 'Bookings cannot be cancelled within 24 hours of the travel date.'
                    }
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="font-medium text-yellow-800 mb-1">Cancellation Policy</h5>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Free cancellation up to 24 hours before travel</li>
                    <li>• Refund processing may take 3-5 business days</li>
                    <li>• Cancellation confirmation will be sent via email</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Keep Booking
          </Button>

          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canCancel || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Cancelling..." : "Cancel Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
