"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CreditCard, Database, Server, Clock } from "lucide-react";
import { format } from "date-fns";

interface SystemLog {
  id: string;
  type: string;
  message: string;
  metadata?: Record<string, any>;
  userId?: string | null;
  createdAt: Date;
}

interface SystemLogsProps {
  logs: SystemLog[];
}

export default function SystemLogs({ logs }: SystemLogsProps) {
  const getLogIcon = (type: string) => {
    switch (type) {
      case "payment_failure":
        return <CreditCard className="h-4 w-4 text-red-500" />;
      case "database_error":
        return <Database className="h-4 w-4 text-orange-500" />;
      case "system":
        return <Server className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getLogTypeBadge = (type: string) => {
    const typeConfig = {
      payment_failure: { variant: "destructive", label: "Payment" },
      database_error: { variant: "warning", label: "Database" },
      system: { variant: "default", label: "System" },
      error: { variant: "destructive", label: "Error" },
    } as const;

    const config = typeConfig[type as keyof typeof typeConfig] || {
      variant: "secondary",
      label: type,
    };

    return (
      <Badge variant={config.variant as any} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  // Mock logs if none exist
  const displayLogs = logs.length > 0 ? logs : [
    {
      id: "1",
      type: "payment_failure",
      message: "StripeError: Card declined",
      metadata: { cardLast4: "4242", amount: 999 },
      createdAt: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
      userId: null,
    },
    {
      id: "2",
      type: "database_error",
      message: "DB Timeout: Booking Insert",
      metadata: { query: "INSERT INTO bookings...", timeout: 5000 },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      userId: null,
    },
    {
      id: "3",
      type: "payment_failure",
      message: "StripeError: Invalid CVC",
      metadata: { cardLast4: "1234" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      userId: null,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            ⚠️ Payment Failures / System Logs
          </CardTitle>
          <Badge variant="outline">{displayLogs.length} Recent</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {displayLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="mt-0.5">{getLogIcon(log.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getLogTypeBadge(log.type)}
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {format(log.createdAt, "MMM dd, h:mm a")}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900 break-words">
                    {log.message}
                  </p>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-1 text-xs text-gray-600">
                      {Object.entries(log.metadata).map(([key, value]) => (
                        <span key={key} className="mr-3">
                          <span className="font-medium">{key}:</span> {String(value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {displayLogs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No system logs found
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
