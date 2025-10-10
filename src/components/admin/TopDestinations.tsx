"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface Destination {
  tourId: string;
  tourName: string;
  location: string | null;
  bookingCount: number;
}

interface TopDestinationsProps {
  destinations: Destination[];
}

export default function TopDestinations({ destinations }: TopDestinationsProps) {
  const maxBookings = Math.max(...destinations.map(d => d.bookingCount), 1);

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 ring-1 ring-primary/20">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Top Destinations</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">Most popular tours this month</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {destinations.slice(0, 5).map((dest, index) => {
            const percentage = (dest.bookingCount / maxBookings) * 100;

            return (
              <motion.div
                key={dest.tourId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{dest.tourName}</p>
                      <p className="text-xs text-muted-foreground truncate">{dest.location || "Location N/A"}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="flex-shrink-0 ml-2">
                    {dest.bookingCount} bookings
                  </Badge>
                </div>
                <Progress value={percentage} className="h-2" />
              </motion.div>
            );
          })}
        </div>
        {destinations.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No destination data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
