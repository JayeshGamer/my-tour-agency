'use client';

import React, { useState } from 'react';
import BookingSummary from './BookingSummary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form } from '@/components/ui/form';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { toast } from 'react-hot-toast';
import { CreditCard, Loader2, User, Mail, Phone, MessageSquare, Tag, Lock, CheckCircle2, X } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';

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

interface CheckoutFormProps {
  user: User;
  cartItems?: CartItem[];
  customTourData?: CustomTourData | null;
}

const checkoutSchema = z.object({
  specialNotes: z.string().optional(),
  couponCode: z.string().optional(),
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

// Helper function to format currency in INR
const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

export default function CheckoutForm({ user, cartItems, customTourData }: CheckoutFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');
  const [couponId, setCouponId] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || ''
  });

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      specialNotes: '',
      couponCode: '',
      fullName: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '',
      email: user.email,
      phone: '',
    },
  });

  // Calculate totals - handle both cart items and custom tours
  const subtotal = customTourData
    ? customTourData.amount
    : (cartItems || []).reduce((sum, item) => {
        const pricePerPersonAmount = parseFloat(item.pricePerPerson);
        const itemTotal = pricePerPersonAmount * item.numberOfPeople;
        return sum + itemTotal;
      }, 0);

  const taxesAndFees = subtotal * 0.025; // 2.5% taxes and fees
  const total = subtotal - couponDiscount + taxesAndFees;

  const handleCouponApply = async () => {
    const couponCode = form.getValues('couponCode');
    if (!couponCode?.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
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
        setCouponId(data.couponId); // Store the coupon ID
        toast.success(`Coupon applied! ${formatINR(data.discount)} discount`);
      } else {
        toast.error(data.error || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Coupon application error:', error);
      toast.error('Failed to apply coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponDiscount(0);
    setCouponApplied('');
    setCouponId(null);
    form.setValue('couponCode', '');
    toast.success('Coupon removed');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form first
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error('Please fix the form errors before proceeding');
      return;
    }
    
    // Validate card details
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
      toast.error('Please fill in all card details');
      return;
    }

    setIsProcessing(true);

    try {
      // Get form values
      const formValues = form.getValues();

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
        toast.error(validationData.error || 'Payment validation failed');
        return;
      }

      // Process checkout
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: customTourData ? undefined : cartItems, // Only send cartItems for regular tours
          customTourData: customTourData || undefined, // Send custom tour data when available
          paymentMethod: 'card',
          cardDetails,
          travelerInfo: {
            fullName: formValues.fullName,
            email: formValues.email,
            phone: formValues.phone,
            specialNotes: formValues.specialNotes || ''
          },
          specialNotes: formValues.specialNotes,
          couponCode: couponApplied,
          couponId: couponId, // Pass the coupon ID for usage tracking
          discount: couponDiscount,
          totalAmount: total,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (customTourData) {
          toast.success('Custom tour payment completed successfully!');
        } else {
          toast.success('Booking completed successfully!');
        }
        
        // Clear cart for regular bookings
        if (!customTourData) {
          localStorage.removeItem('tourCart');
        }
        
        // Redirect to bookings page to see the confirmed booking
        window.location.href = '/bookings';
      } else {
        toast.error(data.error || 'Failed to complete booking');
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Forms (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card className="border-2 border-gray-200 dark:border-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-gray-900 dark:text-white" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="fullName"
                      {...form.register('fullName')}
                      placeholder="John Doe"
                      className="pl-10 h-11 border-gray-300 dark:border-gray-700"
                    />
                  </div>
                  {form.formState.errors.fullName && (
                    <p className="text-xs text-red-500">{form.formState.errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      {...form.register('email')}
                      placeholder="john@example.com"
                      className="pl-10 h-11 border-gray-300 dark:border-gray-700"
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    {...form.register('phone')}
                    placeholder="+1 (555) 000-0000"
                    className="pl-10 h-11 border-gray-300 dark:border-gray-700"
                  />
                </div>
                {form.formState.errors.phone && (
                  <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialNotes" className="text-sm font-medium">
                  Special Requests (Optional)
                </Label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    id="specialNotes"
                    {...form.register('specialNotes')}
                    placeholder="Any special requirements or requests..."
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="border-2 border-gray-200 dark:border-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-gray-900 dark:text-white" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="cardName" className="text-sm font-medium">
                  Cardholder Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cardName"
                  type="text"
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                  className="h-11 border-gray-300 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber" className="text-sm font-medium">
                  Card Number <span className="text-red-500">*</span>
                </Label>
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
                  className="h-11 border-gray-300 dark:border-gray-700 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry" className="text-sm font-medium">
                    Expiry Date <span className="text-red-500">*</span>
                  </Label>
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
                    className="h-11 border-gray-300 dark:border-gray-700 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv" className="text-sm font-medium">
                    CVV <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cvv"
                    type="text"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 3) {
                        setCardDetails(prev => ({ ...prev, cvv: value }));
                      }
                    }}
                    className="h-11 border-gray-300 dark:border-gray-700 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2">
                <Lock className="h-3 w-3" />
                <span>Your payment information is encrypted and secure</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary (1/3 width) */}
        <div className="space-y-6">
          <BookingSummary
            cartItems={cartItems}
            customTourData={customTourData}
            subtotal={subtotal}
            discount={couponDiscount}
            couponCode={couponApplied}
            taxesAndFees={taxesAndFees}
            total={total}
          />

          {/* Coupon Code */}
          <Card className="border-2 border-gray-200 dark:border-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="h-4 w-4" />
                Promo Code
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {!couponApplied ? (
                <div className="flex gap-2">
                  <Input
                    {...form.register('couponCode')}
                    placeholder="Enter code"
                    className="h-10 text-sm border-gray-300 dark:border-gray-700"
                  />
                  <Button
                    type="button"
                    onClick={handleCouponApply}
                    disabled={isApplyingCoupon}
                    variant="outline"
                    className="h-10 px-4 border-2 border-gray-900 dark:border-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900"
                  >
                    {isApplyingCoupon ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-400">
                      {couponApplied}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Complete Payment Button - Sticky */}
          <div className="lg:sticky lg:top-24">
            <RainbowButton
              type="button"
              onClick={handlePaymentSubmit}
              disabled={isProcessing}
              className="w-full h-12 text-base font-semibold"
              variant="black"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Lock className="h-4 w-4" />
                  Pay {formatINR(total)}
                </span>
              )}
            </RainbowButton>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
              By completing this purchase, you agree to our terms and conditions
            </p>
          </div>
        </div>
      </div>
    </Form>
  );
}
