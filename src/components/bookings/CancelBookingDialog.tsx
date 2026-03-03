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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2, CalendarDays, Users, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";

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
}

export function CancelBookingDialog({
  booking,
  isOpen,
  onClose,
  onConfirm,
}: CancelBookingDialogProps) {
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState("");

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await onConfirm(booking.id);
      setReason("");
      onClose();
    } catch (error) {
      console.error("Error cancelling booking:", error);
    } finally {
      setCancelling(false);
    }
  };

  const handleClose = () => {
    if (!cancelling) {
      setReason("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Cancel Booking
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Are you sure you want to cancel your booking for{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {booking.tourName}
            </span>
            ?
          </DialogDescription>
        </DialogHeader>

        {/* Booking Details Summary */}
        <div className="py-4 space-y-3">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <CalendarDays className="h-4 w-4" />
                <span>Travel Date:</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {format(new Date(booking.travelDate), "MMM dd, yyyy")}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Users className="h-4 w-4" />
                <span>Travelers:</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {booking.travelers} {booking.travelers === 1 ? 'person' : 'people'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <CreditCard className="h-4 w-4" />
                <span>Total Amount:</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                {formatCurrency(booking.totalAmount)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for cancellation{" "}
              <span className="text-gray-500 font-normal">(Optional)</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Please let us know why you're cancelling..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={cancelling}
            />
          </div>

          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              <strong>Important:</strong> Please review our cancellation policy.
              Refunds are subject to the terms and conditions of your booking.
              Free cancellation is available up to 24 hours before the travel date.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={cancelling}
          >
            Keep Booking
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Cancel Booking"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
