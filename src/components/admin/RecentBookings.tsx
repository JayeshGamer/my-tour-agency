"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, MoreVertical, X, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RecentBookingsProps {
  bookings: Array<{
    booking: {
      id: string;
      numberOfPeople: number;
      totalPrice: string;
      status: string;
      createdAt: Date;
      startDate: Date;
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
  }>;
}

export default function RecentBookings({ bookings }: RecentBookingsProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Pending: { variant: "outline", className: "text-yellow-600 border-yellow-600" },
      Confirmed: { variant: "default", className: "bg-green-600" },
      Canceled: { variant: "destructive", className: "" },
    } as const;

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending;

    return (
      <Badge variant={config.variant as any} className={config.className}>
        {status}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>📋 Recent Bookings</CardTitle>
          <Link href="/admin/bookings">
            <Button variant="ghost" size="sm">
              View All
              <Eye className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tour Name</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Travelers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((item) => (
                <TableRow key={item.booking.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/tours/${item.tour.id}`}
                      className="hover:text-blue-600 hover:underline"
                    >
                      {item.tour.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {item.user.name || item.user.email.split("@")[0]}
                      </div>
                      <div className="text-xs text-gray-500">{item.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{item.booking.numberOfPeople}</TableCell>
                  <TableCell>{getStatusBadge(item.booking.status)}</TableCell>
                  <TableCell className="font-semibold">
                    ${parseFloat(item.booking.totalPrice).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {item.booking.status === "Pending" && (
                          <>
                            <DropdownMenuItem className="text-green-600">
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Confirm
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <X className="mr-2 h-4 w-4" />
                              Cancel
                            </DropdownMenuItem>
                          </>
                        )}
                        {item.booking.status === "Confirmed" && (
                          <DropdownMenuItem className="text-red-600">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refund
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
