"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Calendar, Users, Tag, CreditCard, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";

interface CartItem {
  tourId: string;
  tourName: string;
  date: string;
  numberOfPeople: number;
  extras: {
    guidedTour: boolean;
    insurance: boolean;
    mealPlan: boolean;
  };
  totalPrice: number;
  pricePerPerson: string;
  timestamp: string;
}

interface CustomTourData {
  type: 'custom_tour';
  requestId: string;
  destination: string;
  amount: number;
  currency: string;
  groupSize: number;
  dates: Array<{start: string; end: string; flexible: boolean}>;
  breakdown: Record<string, number>;
}

interface BookingSummaryProps {
  cartItems?: CartItem[];
  customTourData?: CustomTourData;
  subtotal: number;
  discount: number;
  couponCode?: string;
  taxesAndFees: number;
  total: number;
}

export default function BookingSummary({
  cartItems,
  customTourData,
  subtotal,
  discount,
  couponCode,
  taxesAndFees,
  total,
}: BookingSummaryProps) {
  return (
    <Card className="border-2 border-gray-200 dark:border-gray-800 sticky top-4">
      <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5 text-gray-900 dark:text-white" />
          Booking Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {/* Custom Tour Summary */}
        {customTourData && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Custom Tour Package
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {customTourData.destination}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    <span>{customTourData.groupSize} travelers</span>
                  </div>
                  {customTourData.dates && customTourData.dates.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {format(new Date(customTourData.dates[0].start), "MMM dd")} -
                        {format(new Date(customTourData.dates[0].end), "MMM dd, yyyy")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Tour Breakdown */}
            {customTourData.breakdown && Object.keys(customTourData.breakdown).length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Package Includes:
                </p>
                <div className="space-y-1.5">
                  {Object.entries(customTourData.breakdown).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Regular Cart Items */}
        {cartItems && cartItems.length > 0 && (
          <div className="space-y-3">
            {cartItems.map((item, index) => (
              <div
                key={`${item.tourId}-${index}`}
                className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                  {item.tourName}
                </h3>
                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{format(new Date(item.date), "MMMM dd, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    <span>
                      {item.numberOfPeople} {item.numberOfPeople === 1 ? "person" : "people"}
                    </span>
                  </div>
                </div>

                {/* Extras */}
                {(item.extras.guidedTour || item.extras.insurance || item.extras.mealPlan) && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Added Extras:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.extras.guidedTour && (
                        <Badge variant="secondary" className="text-xs">
                          Guide
                        </Badge>
                      )}
                      {item.extras.insurance && (
                        <Badge variant="secondary" className="text-xs">
                          Insurance
                        </Badge>
                      )}
                      {item.extras.mealPlan && (
                        <Badge variant="secondary" className="text-xs">
                          Meals
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Item Total:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Separator className="my-4" />

        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(subtotal)}
            </span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                <span className="text-green-600 dark:text-green-400">
                  Discount {couponCode && `(${couponCode})`}
                </span>
              </div>
              <span className="font-medium text-green-600 dark:text-green-400">
                -{formatCurrency(discount)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Taxes & Fees (2.5%)
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(taxesAndFees)}
            </span>
          </div>

          <Separator />

          <div className="flex justify-between items-center pt-2">
            <span className="text-base font-semibold text-gray-900 dark:text-white">
              Total Amount
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* Payment Security Notice */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-800 dark:text-blue-200">
              Your payment information is secure and encrypted. We never store your card details.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

