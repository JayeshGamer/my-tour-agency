'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import TravelerInfo from './TravelerInfo';
import BookingSummary from './BookingSummary';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { Input } from '../../src/components/ui/input';
import { Label } from '../../src/components/ui/label';
import { Form } from '../../src/components/ui/form';
import { toast } from 'react-hot-toast';
import { CreditCard, Loader2 } from 'lucide-react';

interface User {
  id: string;
  name?: string | null;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

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

interface CheckoutFormProps {
  user: User;
  cartItems: CartItem[];
  onSuccess: () => void;
}

const checkoutSchema = z.object({
  specialNotes: z.string().optional(),
  couponCode: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutForm({ user, cartItems, onSuccess }: CheckoutFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || ''
  });
  const [travelerInfo, setTravelerInfo] = useState({
    firstName: user.firstName || user.name?.split(' ')[0] || '',
    lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
    email: user.email,
    phone: '',
    emergencyContact: '',
    specialRequirements: ''
  });

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      specialNotes: '',
      couponCode: '',
    },
  });

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxesAndFees = subtotal * 0.025; // 2.5% taxes and fees
  const total = subtotal - couponDiscount + taxesAndFees;

  const handleCouponApply = async (couponCode: string) => {
    if (!couponCode.trim()) return;

    try {
      const response = await fetch('/api/checkout/apply-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode, subtotal }),
      });

      const data = await response.json();

      if (response.ok) {
        setCouponDiscount(data.discount);
        setCouponApplied(couponCode);
        toast.success(`Coupon applied! $${data.discount} discount`);
      } else {
        toast.error(data.error || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Coupon application error:', error);
      toast.error('Failed to apply coupon');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate card details
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
      toast.error('Please fill in all card details');
      return;
    }
    
    // Validate traveler info
    if (!travelerInfo.firstName || !travelerInfo.lastName || !travelerInfo.email) {
      toast.error('Please fill in all traveler information');
      return;
    }

    setIsProcessing(true);

    try {
      // First validate payment details
      const validationResponse = await fetch('/api/checkout/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          cardDetails
        })
      });

      const validationData = await validationResponse.json();
      
      if (!validationResponse.ok) {
        throw new Error(validationData.error || 'Payment validation failed');
      }

      // Process checkout
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems,
          paymentMethod: 'card',
          cardDetails,
          travelerInfo,
          specialNotes: form.getValues('specialNotes'),
          couponCode: couponApplied,
          discount: couponDiscount,
          totalAmount: total,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Booking completed successfully!');
        onSuccess();
      } else {
        throw new Error(data.error || 'Failed to complete booking');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to complete booking');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Form {...form}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Left Column - Traveler Info */}
        <div className="space-y-6">
          <TravelerInfo
            user={user}
            form={form}
            onCouponApply={handleCouponApply}
            couponApplied={couponApplied}
          />
        </div>

        {/* Right Column - Booking Summary */}
        <div className="space-y-6">
          <BookingSummary
            cartItems={cartItems}
            subtotal={subtotal}
            discount={couponDiscount}
            couponCode={couponApplied}
            taxesAndFees={taxesAndFees}
            total={total}
          />

          {/* Payment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    type="text"
                    placeholder="John Doe"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.number}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
                      if (value.length <= 19) {
                        setCardDetails(prev => ({ ...prev, number: value }));
                      }
                    }}
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      type="text"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        let formatted = value;
                        if (value.length >= 2) {
                          formatted = value.substring(0, 2) + '/' + value.substring(2, 4);
                        }
                        if (formatted.length <= 5) {
                          setCardDetails(prev => ({ ...prev, expiry: formatted }));
                        }
                      }}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 4) {
                          setCardDetails(prev => ({ ...prev, cvv: value }));
                        }
                      }}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button 
                  onClick={handlePaymentSubmit}
                  disabled={isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    `Pay $${total.toFixed(2)}`
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Form>
  );
}
