'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Calendar, Users, Plus, Minus, ShoppingCart, CreditCard, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { DateInput } from '@/components/ui/date-input';
import { formatCurrency } from '@/lib/currency';

interface Tour {
  id: string;
  name: string;
  pricePerPerson: string;
  maxGroupSize: number;
  startDates: string[];
}

interface BookingSectionProps {
  tour: Tour;
  noCard?: boolean; // when true, render content without outer Card wrapper
}

interface BookingExtras {
  guidedTour: boolean;
  insurance: boolean;
  mealPlan: boolean;
}

const EXTRAS_PRICING = {
  guidedTour: { name: 'Professional Guide', price: 12000 },
  insurance: { name: 'Travel Insurance', price: 4000 },
  mealPlan: { name: 'Full Meal Plan', price: 15000 },
};

export default function BookingSection({ tour, noCard = false }: BookingSectionProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [extras, setExtras] = useState<BookingExtras>({
    guidedTour: false,
    insurance: false,
    mealPlan: false,
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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
      date: selectedDate?.toISOString(),
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

    setIsLoading(true);
    try {
      // Store booking data in localStorage and redirect to checkout
      const cartItem = {
        tourId: tour.id,
        tourName: tour.name,
        date: selectedDate?.toISOString(),
        numberOfPeople,
        extras,
        totalPrice,
        pricePerPerson: tour.pricePerPerson,
        timestamp: new Date().toISOString(),
      };

      // Clear existing cart and set this as the only item
      localStorage.setItem('tourCart', JSON.stringify([cartItem]));
      
      toast.success('Redirecting to checkout...');
      
      // Small delay for user feedback
      setTimeout(() => {
        router.push('/checkout');
      }, 500);
    } catch (error) {
      console.error('Error processing booking:', error);
      toast.error('Failed to process booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const availableDates = tour.startDates as string[];

  // header JSX and content JSX so we can optionally render without Card wrapper
  const headerJSX = (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">Book Your Adventure</h3>
          <p className="text-sm text-gray-500">Select your preferred date and customize your tour experience</p>
        </div>
      </div>
    </>
  );

  const contentJSX = (
    <div className="space-y-4">
      {/* Number of People */}
      <div>
        <Label htmlFor="people" className="flex items-center gap-1 mb-2 text-xs">
          <Users className="w-4 h-4" />
          Number of People
        </Label>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleNumberChange(false)}
            disabled={numberOfPeople <= 1}
            className="h-8 w-8"
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
            className="w-16 text-center text-sm h-8"
            min="1"
            max={tour.maxGroupSize}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleNumberChange(true)}
            disabled={numberOfPeople >= tour.maxGroupSize}
            className="h-8 w-8"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            Max: {tour.maxGroupSize}
          </span>
        </div>
      </div>

      {/* Select Date */}
      <div>
        <Label htmlFor="date" className="flex items-center gap-1 mb-2 text-xs">
          <Calendar className="w-4 h-4" />
          Select Tour Date
        </Label>
        <DateInput
          date={selectedDate}
          onDateChange={setSelectedDate}
          availableDates={availableDates}
          placeholder="Choose date"
        />
      </div>

      {/* Extra Options */}
      <div>
        <Label className="flex items-center gap-1 mb-2 text-xs">
          <Info className="w-4 h-4" />
          Optional Extras
        </Label>
        <div className="space-y-2">
          {Object.entries(EXTRAS_PRICING).map(([key, extra]) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-1.5">
                <Checkbox
                  id={key}
                  checked={extras[key as keyof BookingExtras]}
                  onCheckedChange={(checked) =>
                    setExtras(prev => ({ ...prev, [key]: checked }))
                  }
                  className="h-3.5 w-3.5"
                />
                <label
                  htmlFor={key}
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {extra.name}
                </label>
              </div>
              <span className="text-xs text-gray-600 whitespace-nowrap">
                +{formatCurrency(extra.price)}/person
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Price Summary */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <h3 className="font-semibold text-sm">Price Summary</h3>

        {/* Base Price */}
        <div className="flex justify-between text-xs">
          <span>Base Price ({numberOfPeople} {numberOfPeople === 1 ? 'person' : 'people'})</span>
          <span>{formatCurrency(parseFloat(tour.pricePerPerson) * numberOfPeople)}</span>
        </div>

        {/* Extras */}
        {extras.guidedTour && (
          <div className="flex justify-between text-xs">
            <span>Professional Guide</span>
            <span>+{formatCurrency(EXTRAS_PRICING.guidedTour.price * numberOfPeople)}</span>
          </div>
        )}
        {extras.insurance && (
          <div className="flex justify-between text-xs">
            <span>Travel Insurance</span>
            <span>+{formatCurrency(EXTRAS_PRICING.insurance.price * numberOfPeople)}</span>
          </div>
        )}
        {extras.mealPlan && (
          <div className="flex justify-between text-xs">
            <span>Full Meal Plan</span>
            <span>+{formatCurrency(EXTRAS_PRICING.mealPlan.price * numberOfPeople)}</span>
          </div>
        )}

        <div className="border-t pt-2">
          <div className="flex justify-between font-semibold text-sm">
            <span>Total Price</span>
            <span className="text-green-600">{formatCurrency(totalPrice)}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Price per person: {formatCurrency(totalPrice / numberOfPeople)}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          onClick={handleBookNow}
          className="w-full"
          size="default"
          disabled={!selectedDate || isLoading}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {isLoading ? 'Processing...' : 'Book Now'}
        </Button>
        <Button
          onClick={handleAddToCart}
          variant="outline"
          className="w-full"
          size="default"
          disabled={!selectedDate}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </div>

      {/* Additional Information */}
      <div className="text-xs text-gray-500 space-y-0.5">
        <p>• Free cancellation up to 24 hours before start</p>
        <p>• Instant confirmation upon booking</p>
        <p>• Secure payment processing</p>
      </div>
    </div>
  );

  // Render depending on `noCard` flag
  if (noCard) {
    return (
      <div className="w-full">
        {headerJSX}
        <div className="mt-4">{contentJSX}</div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Book Your Adventure</CardTitle>
        <CardDescription>
          Select your preferred date and customize your tour experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">{contentJSX}</CardContent>
    </Card>
  );
}
