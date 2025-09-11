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
  CreditCard,
  MoreHorizontal,
  Eye,
  RefreshCw,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface PaymentData {
  id: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethodType: string;
  cardBrand?: string;
  cardLast4?: string;
  createdAt: Date;
  booking: {
    id: string;
    user: {
      name: string | null;
      email: string;
    };
    tour: {
      title: string;
    };
    totalGuests: number;
  } | null;
}

interface PaymentsListProps {
  payments: PaymentData[];
}

const getStatusBadge = (status: string) => {
  const variants = {
    "succeeded": { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
    "pending": { variant: "secondary" as const, icon: Clock, color: "text-orange-600" },
    "canceled": { variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
    "requires_action": { variant: "outline" as const, icon: RefreshCw, color: "text-blue-600" },
    "requires_payment_method": { variant: "outline" as const, icon: AlertCircle, color: "text-yellow-600" },
    "failed": { variant: "destructive" as const, icon: XCircle, color: "text-red-600" }
  };
  
  const config = variants[status as keyof typeof variants] || variants["pending"];
  const Icon = config.icon;
  
  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
    </Badge>
  );
};

const getCardBadge = (brand?: string) => {
  if (!brand) return null;
  
  const brandIcons = {
    "visa": "V",
    "mastercard": "MC", 
    "amex": "AE",
    "discover": "D"
  };
  
  return (
    <Badge variant="outline" className="font-mono">
      {brandIcons[brand as keyof typeof brandIcons] || brand.toUpperCase()}
    </Badge>
  );
};

export default function PaymentsList({ payments }: PaymentsListProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleRefund = async (paymentId: string, amount?: number) => {
    if (!confirm(`Are you sure you want to refund this payment${amount ? ` for $${(amount / 100).toFixed(2)}` : ''}?`)) {
      return;
    }

    setIsProcessing(paymentId);
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process refund');
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

  const handleSyncStripe = async () => {
    setIsProcessing('sync');
    try {
      const response = await fetch('/api/admin/payments/sync', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to sync with Stripe');
      }

      toast.success('Successfully synced with Stripe');
      router.refresh();
    } catch (error: any) {
      console.error('Error syncing with Stripe:', error);
      toast.error(error.message || 'Failed to sync with Stripe');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>All Payments ({payments.length})</CardTitle>
        <Button 
          variant="outline" 
          onClick={handleSyncStripe}
          disabled={isProcessing === 'sync'}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing === 'sync' ? 'animate-spin' : ''}`} />
          Sync Stripe
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Booking</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length > 0 ? (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-sm">
                    {payment.paymentIntentId}
                  </TableCell>
                  <TableCell>
                    {payment.booking ? (
                      <div>
                        <div className="font-medium">
                          {payment.booking.user.name || payment.booking.user.email.split('@')[0]}
                        </div>
                        <div className="text-sm text-gray-500">{payment.booking.user.email}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">No booking data</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {payment.booking ? (
                      <div>
                        <div className="font-medium text-sm truncate max-w-48" title={payment.booking.tour.title}>
                          {payment.booking.tour.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.booking.totalGuests} guest{payment.booking.totalGuests > 1 ? 's' : ''}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">No booking data</span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">
                    ${(payment.amount / 100).toLocaleString()} {payment.currency.toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {payment.cardBrand && getCardBrand(payment.cardBrand)}
                      {payment.cardLast4 && (
                        <span className="font-mono text-sm">****{payment.cardLast4}</span>
                      )}
                      {!payment.cardBrand && (
                        <span className="text-sm capitalize">{payment.paymentMethodType}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(payment.status)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          disabled={isProcessing === payment.id}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        
                        {payment.status === "succeeded" && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => handleRefund(payment.id, payment.amount)}
                            >
                              <DollarSign className="mr-2 h-4 w-4" />
                              Full Refund
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleRefund(payment.id)}
                            >
                              <DollarSign className="mr-2 h-4 w-4" />
                              Partial Refund
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600">No payments found</h3>
                  <p className="text-gray-500 mt-2">Payments will appear here once customers start making purchases.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
