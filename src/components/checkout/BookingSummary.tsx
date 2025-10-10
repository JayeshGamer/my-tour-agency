'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Tag, Receipt } from 'lucide-react';
import { format } from 'date-fns';

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
  customTourData?: CustomTourData | null;
  subtotal: number;
  discount: number;
  couponCode: string;
  taxesAndFees: number;
  total: number;
}

// Helper function to format currency in INR
const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

export default function BookingSummary({
  cartItems, 
  customTourData,
  subtotal,
  discount, 
  couponCode, 
  taxesAndFees, 
  total 
}: BookingSummaryProps) {
  
  const isCustomTour = !!customTourData;

  return (
    <Card className="border-2 border-gray-200 dark:border-gray-800">
      <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Receipt className="h-5 w-5 text-gray-900 dark:text-white" />
          {isCustomTour ? 'Custom Tour Summary' : 'Order Summary'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {/* Custom Tour Details */}
        {isCustomTour && customTourData && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                {customTourData.destination}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Custom Tour Package</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>
                  {format(new Date(customTourData.dates[0].start), 'dd MMM')} – {' '}
                  {format(new Date(customTourData.dates[0].end), 'dd MMM yyyy')}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Users className="w-4 h-4 text-gray-400" />
                <span>
                  {customTourData.groupSize} {customTourData.groupSize === 1 ? 'Traveler' : 'Travelers'}
                </span>
              </div>
            </div>

            {/* Custom Tour Breakdown */}
            {Object.keys(customTourData.breakdown || {}).length > 0 && (
              <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Package Includes:</p>
                <div className="space-y-1.5">
                  {Object.entries(customTourData.breakdown || {}).map(([item, amount]) => (
                    <div key={item} className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>• {item}</span>
                      <span className="font-medium">{formatINR(amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Regular Tour Details */}
        {!isCustomTour && cartItems && cartItems.length > 0 && (
          <div className="space-y-4">
            {cartItems.map((item, index) => (
              <div key={index} className="space-y-2">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                    {item.tourName}
                  </h3>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{format(new Date(item.date), 'dd MMM yyyy')}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{item.numberOfPeople} {item.numberOfPeople === 1 ? 'Traveler' : 'Travelers'}</span>
                  </div>
                </div>

                {/* Extras */}
                {(item.extras.guidedTour || item.extras.insurance || item.extras.mealPlan) && (
                  <div className="flex flex-wrap gap-1">
                    {item.extras.guidedTour && (
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">Guide</Badge>
                    )}
                    {item.extras.insurance && (
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">Insurance</Badge>
                    )}
                    {item.extras.mealPlan && (
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">Meals</Badge>
                    )}
                  </div>
                )}

                {index < cartItems.length - 1 && <Separator className="my-3" />}
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* Pricing Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
            <span className="font-medium text-gray-900 dark:text-white">{formatINR(subtotal)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                <Tag className="w-3.5 h-3.5" />
                Discount ({couponCode})
              </span>
              <span className="font-medium text-green-600 dark:text-green-400">-{formatINR(discount)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Taxes & Fees</span>
            <span className="font-medium text-gray-900 dark:text-white">{formatINR(taxesAndFees)}</span>
          </div>

          <Separator />

          <div className="flex justify-between items-center p-3 bg-gray-900 dark:bg-white rounded-lg">
            <span className="text-sm font-bold text-white dark:text-gray-900">Total Amount</span>
            <span className="text-xl font-bold text-white dark:text-gray-900">{formatINR(total)}</span>
          </div>
        </div>

        {/* Info Note */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-400 leading-relaxed">
            {isCustomTour
              ? '✓ Custom itinerary tailored to your needs'
              : '✓ Instant booking confirmation'
            }
            <br />
            ✓ Free cancellation up to 24 hours before departure
            <br />
            ✓ 24/7 customer support included
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
