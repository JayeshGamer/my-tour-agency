'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import TravelerInfo from './TravelerInfo';
import BookingSummary from './BookingSummary';
import StripePayment from './StripePayment';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card';
// import { Button } from '../../src/components/ui/button';
import { Form } from '../../src/components/ui/form';
import { toast } from 'react-hot-toast';

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

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setIsProcessing(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId,
          cartItems,
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
      toast.error('Failed to complete booking. Please contact support.');
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
              <CardTitle>Payment Information (Stripe)</CardTitle>
            </CardHeader>
            <CardContent>
              <StripePayment
                amount={total}
                onPaymentSuccess={handlePaymentSuccess}
                isProcessing={isProcessing}
                disabled={isProcessing}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </Form>
  );
}
