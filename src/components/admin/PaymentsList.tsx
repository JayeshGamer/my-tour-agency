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
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from "lucide-react";

interface PaymentData {
  id: string;
  amount: number;
  currency: string;
  status: string;
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

export default function PaymentsList({ payments }: PaymentsListProps) {
  const [isProcessing] = useState<string | null>(null);



  // Handle case where payments might be undefined or null
  const safePayments = payments || [];
  
  return (
    <Card className="overflow-hidden border-border/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-muted/50 to-transparent border-b">
        <CardTitle className="text-xl font-bold">All Payments ({safePayments.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold">Payment ID</TableHead>
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold">Booking</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Payment Method</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safePayments.length > 0 ? (
                safePayments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500/50" />
                        {payment.id.substring(0, 16)}...
                      </div>
                    </TableCell>
                    <TableCell>
                      {payment.booking ? (
                        <div>
                          <div className="font-medium">
                            {payment.booking.user.name || payment.booking.user.email.split('@')[0]}
                          </div>
                          <div className="text-sm text-muted-foreground">{payment.booking.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No booking data</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {payment.booking ? (
                        <div>
                          <div className="font-medium text-sm truncate max-w-48" title={payment.booking.tour.title}>
                            {payment.booking.tour.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Booking ID: {payment.booking.id.substring(0, 8)}...
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No booking data</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg">₹{(payment.amount / 100).toLocaleString('en-IN')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Online Payment</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(payment.createdAt).toLocaleDateString('en-IN')}
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
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-semibold text-foreground">No payments found</h3>
                      <p className="text-sm mt-2">Payments will appear here once customers start making purchases.</p>
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
