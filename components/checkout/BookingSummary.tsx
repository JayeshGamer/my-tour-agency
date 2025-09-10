'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Separator } from '../../src/components/ui/separator';
import { Badge } from '../../src/components/ui/badge';
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

interface BookingSummaryProps {
  cartItems: CartItem[];
  subtotal: number;
  discount: number;
  couponCode: string;
  taxesAndFees: number;
  total: number;
}

export default function BookingSummary({ 
  cartItems, 
  subtotal, 
  discount, 
  couponCode, 
  taxesAndFees, 
  total 
}: BookingSummaryProps) {
  
  // For this demo, we'll show details for the first/main tour
  // In a real app, you might want to handle multiple tours differently
  const mainTour = cartItems[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tour Details */}
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg">{mainTour.tourName}</h3>
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
                {format(new Date(mainTour.date), 'dd MMM')} – {' '}
                {format(new Date(new Date(mainTour.date).getTime() + 6 * 24 * 60 * 60 * 1000), 'dd MMM yyyy')}
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
          {(mainTour.extras.guidedTour || mainTour.extras.insurance || mainTour.extras.mealPlan) && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Included Extras:</p>
              <div className="flex flex-wrap gap-1">
                {mainTour.extras.guidedTour && (
                  <Badge variant="secondary" className="text-xs">Professional Guide</Badge>
                )}
                {mainTour.extras.insurance && (
                  <Badge variant="secondary" className="text-xs">Travel Insurance</Badge>
                )}
                {mainTour.extras.mealPlan && (
                  <Badge variant="secondary" className="text-xs">Full Meal Plan</Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Pricing Breakdown */}
        <div className="space-y-3">
          {/* Show individual tour pricing */}
          {cartItems.map((item, index) => (
            <div key={index} className="space-y-1">
              {cartItems.length > 1 && (
                <p className="text-sm font-medium">{item.tourName}</p>
              )}
              <div className="flex justify-between text-sm">
                <span>
                  Price per Person: ${parseFloat(item.pricePerPerson).toFixed(2)} × {item.numberOfPeople}
                </span>
                <span>${item.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          ))}

          <div className="flex justify-between font-medium">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                Coupon ({couponCode}):
              </span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span>Taxes & Fees:</span>
            <span>${taxesAndFees.toFixed(2)}</span>
          </div>

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-green-600">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-1">
          <p className="text-xs text-gray-600 font-medium">Booking Details:</p>
          <ul className="text-xs text-gray-600 space-y-0.5">
            <li>• Free cancellation up to 24 hours before start</li>
            <li>• Instant confirmation upon payment</li>
            <li>• Secure payment processing via Stripe</li>
            <li>• All taxes and fees included in total price</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
