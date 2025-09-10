'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Calendar, Users, Plus, Minus, ShoppingCart, CreditCard, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Tour {
  id: string;
  name: string;
  pricePerPerson: string;
  maxGroupSize: number;
  startDates: string[];
}

interface BookingSectionProps {
  tour: Tour;
}

interface BookingExtras {
  guidedTour: boolean;
  insurance: boolean;
  mealPlan: boolean;
}

const EXTRAS_PRICING = {
  guidedTour: { name: 'Professional Guide', price: 150 },
  insurance: { name: 'Travel Insurance', price: 50 },
  mealPlan: { name: 'Full Meal Plan', price: 200 },
};

export default function BookingSection({ tour }: BookingSectionProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [extras, setExtras] = useState<BookingExtras>({
    guidedTour: false,
    insurance: false,
    mealPlan: false,
  });
  const [totalPrice, setTotalPrice] = useState(0);
  // const [isLoading, setIsLoading] = useState(false); // Removed as not used in current implementation

  // Calculate total price whenever dependencies change
  useEffect(() => {
    let price = parseFloat(tour.pricePerPerson) * numberOfPeople;
    
    // Add extras
    if (extras.guidedTour) price += EXTRAS_PRICING.guidedTour.price * numberOfPeople;
    if (extras.insurance) price += EXTRAS_PRICING.insurance.price * numberOfPeople;
    if (extras.mealPlan) price += EXTRAS_PRICING.mealPlan.price * numberOfPeople;
    
    setTotalPrice(price);
  }, [numberOfPeople, extras, tour.pricePerPerson]);

  const handleNumberChange = (increment: boolean) => {
    if (increment && numberOfPeople < tour.maxGroupSize) {
      setNumberOfPeople(prev => prev + 1);
    } else if (!increment && numberOfPeople > 1) {
      setNumberOfPeople(prev => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedDate) {
      toast.error('Please select a tour date');
      return;
    }

    if (!session) {
      toast.error('Please login to add tours to cart');
      router.push('/login');
      return;
    }

    // Store booking data in localStorage (or you could use a state management solution)
    const cartItem = {
      tourId: tour.id,
      tourName: tour.name,
      date: selectedDate,
      numberOfPeople,
      extras,
      totalPrice,
      pricePerPerson: tour.pricePerPerson,
      timestamp: new Date().toISOString(),
    };

    const existingCart = JSON.parse(localStorage.getItem('tourCart') || '[]');
    existingCart.push(cartItem);
    localStorage.setItem('tourCart', JSON.stringify(existingCart));

    toast.success('Tour added to cart!');
  };

  const handleBookNow = async () => {
    if (!selectedDate) {
      toast.error('Please select a tour date');
      return;
    }

    if (!session) {
      toast.error('Please login to book tours');
      router.push('/login');
      return;
    }

    // Store booking data in localStorage and redirect to checkout
    const cartItem = {
      tourId: tour.id,
      tourName: tour.name,
      date: selectedDate,
      numberOfPeople,
      extras,
      totalPrice,
      pricePerPerson: tour.pricePerPerson,
      timestamp: new Date().toISOString(),
    };

    // Clear existing cart and set this as the only item
    localStorage.setItem('tourCart', JSON.stringify([cartItem]));
    
    toast.success('Redirecting to checkout...');
    router.push('/checkout');
  };

  const availableDates = tour.startDates as string[];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Book Your Adventure</CardTitle>
        <CardDescription>
          Select your preferred date and customize your tour experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Booking Options */}
          <div className="space-y-4">
            {/* Number of People */}
            <div>
              <Label htmlFor="people" className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4" />
                Number of People
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleNumberChange(false)}
                  disabled={numberOfPeople <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  id="people"
                  type="number"
                  value={numberOfPeople}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value >= 1 && value <= tour.maxGroupSize) {
                      setNumberOfPeople(value);
                    }
                  }}
                  className="w-20 text-center"
                  min="1"
                  max={tour.maxGroupSize}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleNumberChange(true)}
                  disabled={numberOfPeople >= tour.maxGroupSize}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-500">
                  Max: {tour.maxGroupSize} people
                </span>
              </div>
            </div>

            {/* Select Date */}
            <div>
              <Label htmlFor="date" className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                Select Tour Date
              </Label>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger id="date">
                  <SelectValue placeholder="Choose a date" />
                </SelectTrigger>
                <SelectContent>
                  {availableDates.map((date) => (
                    <SelectItem key={date} value={date}>
                      {format(new Date(date), 'MMMM dd, yyyy')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Extra Options */}
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4" />
                Optional Extras
              </Label>
              <div className="space-y-3">
                {Object.entries(EXTRAS_PRICING).map(([key, extra]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={extras[key as keyof BookingExtras]}
                        onCheckedChange={(checked) =>
                          setExtras(prev => ({ ...prev, [key]: checked }))
                        }
                      />
                      <label
                        htmlFor={key}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {extra.name}
                      </label>
                    </div>
                    <span className="text-sm text-gray-600">
                      +${extra.price}/person
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Price Summary */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-lg">Price Summary</h3>
              
              {/* Base Price */}
              <div className="flex justify-between text-sm">
                <span>Base Price ({numberOfPeople} {numberOfPeople === 1 ? 'person' : 'people'})</span>
                <span>${(parseFloat(tour.pricePerPerson) * numberOfPeople).toFixed(2)}</span>
              </div>

              {/* Extras */}
              {extras.guidedTour && (
                <div className="flex justify-between text-sm">
                  <span>Professional Guide</span>
                  <span>+${(EXTRAS_PRICING.guidedTour.price * numberOfPeople).toFixed(2)}</span>
                </div>
              )}
              {extras.insurance && (
                <div className="flex justify-between text-sm">
                  <span>Travel Insurance</span>
                  <span>+${(EXTRAS_PRICING.insurance.price * numberOfPeople).toFixed(2)}</span>
                </div>
              )}
              {extras.mealPlan && (
                <div className="flex justify-between text-sm">
                  <span>Full Meal Plan</span>
                  <span>+${(EXTRAS_PRICING.mealPlan.price * numberOfPeople).toFixed(2)}</span>
                </div>
              )}

              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Price</span>
                  <span className="text-green-600">${totalPrice.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Price per person: ${(totalPrice / numberOfPeople).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={handleBookNow}
                className="w-full"
                size="lg"
                disabled={!selectedDate || isLoading}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {isLoading ? 'Processing...' : 'Book Now'}
              </Button>
              <Button
                onClick={handleAddToCart}
                variant="outline"
                className="w-full"
                size="lg"
                disabled={!selectedDate}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>

            {/* Additional Information */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Free cancellation up to 24 hours before start</p>
              <p>• Instant confirmation upon booking</p>
              <p>• Secure payment processing</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
