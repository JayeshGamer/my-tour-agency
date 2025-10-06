'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, MapPin, Tag } from 'lucide-react';
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
  
  // Handle custom tour data or regular cart items
  const isCustomTour = !!customTourData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isCustomTour ? 'Custom Tour Summary' : 'Booking Summary'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Custom Tour Details */}
        {isCustomTour && customTourData && (
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg">{customTourData.destination}</h3>
              <p className="text-sm text-gray-500">Custom Tour Request</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>
                  {format(new Date(customTourData.dates[0].start), 'dd MMM')} – {' '}
                  {format(new Date(customTourData.dates[0].end), 'dd MMM yyyy')}
                  {customTourData.dates[0].flexible && (
                    <Badge variant="outline" className="ml-2 text-xs">Flexible</Badge>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>Custom Itinerary</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-gray-400" />
                <span>
                  {customTourData.groupSize} Traveler{customTourData.groupSize !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Custom Tour Breakdown */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Cost Breakdown:</p>
              <div className="space-y-1">
                {Object.entries(customTourData.breakdown || {}).map(([item, amount]) => (
                  <div key={item} className="flex justify-between text-sm">
                    <span>{item}:</span>
                    <span>{formatINR(amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Regular Tour Details */}
        {!isCustomTour && cartItems && (
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg">{cartItems[0]?.tourName}</h3>
              {cartItems.length > 1 && (
                <p className="text-sm text-gray-500">
                  + {cartItems.length - 1} more tour{cartItems.length > 2 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>
                  {format(new Date(cartItems[0]?.date || new Date()), 'dd MMM')} – {' '}
                  {format(new Date(new Date(cartItems[0]?.date || new Date()).getTime() + 6 * 24 * 60 * 60 * 1000), 'dd MMM yyyy')}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>Guided Group Tour</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-gray-400" />
                <span>
                  {cartItems.reduce((sum, item) => sum + item.numberOfPeople, 0)} Traveler
                  {cartItems.reduce((sum, item) => sum + item.numberOfPeople, 0) !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Show extras if any */}
            {(cartItems[0]?.extras.guidedTour || cartItems[0]?.extras.insurance || cartItems[0]?.extras.mealPlan) && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Included Extras:</p>
                <div className="flex flex-wrap gap-1">
                  {cartItems[0].extras.guidedTour && (
                    <Badge variant="secondary" className="text-xs">Professional Guide</Badge>
                  )}
                  {cartItems[0].extras.insurance && (
                    <Badge variant="secondary" className="text-xs">Travel Insurance</Badge>
                  )}
                  {cartItems[0].extras.mealPlan && (
                    <Badge variant="secondary" className="text-xs">Full Meal Plan</Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Pricing Breakdown */}
        <div className="space-y-3">
          {/* Custom Tour Pricing */}
          {isCustomTour && customTourData && (
            <div className="flex justify-between font-medium">
              <span>Custom Tour Package:</span>
              <span>{formatINR(customTourData.amount)}</span>
            </div>
          )}

          {/* Regular Tour Pricing */}
          {!isCustomTour && cartItems?.map((item, index) => {
            const pricePerPersonAmount = parseFloat(item.pricePerPerson);
            const calculatedTotal = pricePerPersonAmount * item.numberOfPeople;

            return (
              <div key={index} className="space-y-1">
                {cartItems.length > 1 && (
                  <p className="text-sm font-medium">{item.tourName}</p>
                )}
                <div className="flex justify-between text-sm">
                  <span>
                    Price per Person: {formatINR(pricePerPersonAmount)} × {item.numberOfPeople}
                  </span>
                  <span>{formatINR(calculatedTotal)}</span>
                </div>
              </div>
            );
          })}

          <div className="flex justify-between font-medium">
            <span>Subtotal:</span>
            <span>{formatINR(subtotal)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                Coupon ({couponCode}):
              </span>
              <span>-{formatINR(discount)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span>Taxes & Fees:</span>
            <span>{formatINR(taxesAndFees)}</span>
          </div>

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-green-600">{formatINR(total)}</span>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-1">
          <p className="text-xs text-gray-600 font-medium">
            {isCustomTour ? 'Custom Tour Details:' : 'Booking Details:'}
          </p>
          <ul className="text-xs text-gray-600 space-y-0.5">
            {isCustomTour ? (
              <>
                <li>• Custom itinerary based on your requirements</li>
                <li>• Flexible dates and personalized experience</li>
                <li>• Direct coordination with our travel experts</li>
                <li>• Full payment secures your custom booking</li>
              </>
            ) : (
              <>
                <li>• Free cancellation up to 24 hours before start</li>
                <li>• Instant confirmation upon payment</li>
                <li>• Secure payment processing via Stripe</li>
                <li>• All taxes and fees included in total price</li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
