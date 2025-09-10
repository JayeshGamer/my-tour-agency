'use client';

import { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '../../src/components/ui/button';
import { Checkbox } from '../../src/components/ui/checkbox';
import { Label } from '../../src/components/ui/label';
import { toast } from 'react-hot-toast';
import { CreditCard, Lock, Shield } from 'lucide-react';

interface StripePaymentProps {
  amount: number;
  onPaymentSuccess: (paymentIntentId: string) => void;
  isProcessing: boolean;
  disabled: boolean;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

export default function StripePayment({ 
  amount, 
  onPaymentSuccess, 
  isProcessing, 
  disabled 
}: StripePaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [saveCard, setSaveCard] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [isLoadingIntent, setIsLoadingIntent] = useState(false);

  useEffect(() => {
    // Create payment intent when component mounts
    createPaymentIntent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount]);

  const createPaymentIntent = async () => {
    setIsLoadingIntent(true);
    try {
      const response = await fetch('/api/checkout/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(amount * 100) }), // Convert to cents
      });

      const data = await response.json();
      
      if (response.ok) {
        setClientSecret(data.clientSecret);
      } else {
        throw new Error(data.error || 'Failed to create payment intent');
      }
    } catch (error) {
      console.error('Payment intent error:', error);
      toast.error('Failed to initialize payment. Please try again.');
    } finally {
      setIsLoadingIntent(false);
    }
  };

  const handlePayment = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      toast.error('Payment system not ready. Please try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error('Card information not found.');
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            // You can add billing details here if needed
          },
        },
      });

      if (error) {
        console.error('Payment failed:', error);
        toast.error(error.message || 'Payment failed. Please try again.');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        onPaymentSuccess(paymentIntent.id);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handlePayment} className="space-y-6">
      {/* Card Element */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Card Information
        </Label>
        <div className="p-3 border border-gray-300 rounded-md bg-white">
          <CardElement 
            options={CARD_ELEMENT_OPTIONS} 
            disabled={disabled || isLoadingIntent}
          />
        </div>
      </div>

      {/* Save Card Option */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="saveCard"
          checked={saveCard}
          onCheckedChange={(checked) => setSaveCard(!!checked)}
          disabled={disabled}
        />
        <Label
          htmlFor="saveCard"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Save this card for future bookings
        </Label>
      </div>

      {/* Test Mode Warning */}
      <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="w-4 h-4 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
          !
        </div>
        <div className="text-sm text-yellow-800">
          <p className="font-medium">Test Mode - No Real Charges</p>
          <p>This is a demonstration. Use test card: 4242424242424242</p>
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <Shield className="w-4 h-4 text-green-600 mt-0.5" />
        <div className="text-sm text-green-800">
          <p className="font-medium">Secure payment powered by Stripe</p>
          <p>PCI compliant, SSL encrypted, and fully secure</p>
        </div>
      </div>

      {/* Complete Booking Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={
          !stripe || 
          !elements || 
          !clientSecret || 
          disabled || 
          isProcessing || 
          isLoadingIntent
        }
      >
        <Lock className="w-4 h-4 mr-2" />
        {isLoadingIntent 
          ? 'Initializing...' 
          : isProcessing 
            ? 'Processing Payment...' 
            : `Complete Booking Securely - $${amount.toFixed(2)}`
        }
      </Button>

      {/* Payment Method Logos */}
      <div className="flex justify-center items-center gap-4 pt-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>We accept:</span>
          <div className="flex gap-1">
            <div className="w-6 h-4 bg-gray-200 rounded text-[8px] flex items-center justify-center font-bold">
              VISA
            </div>
            <div className="w-6 h-4 bg-gray-200 rounded text-[8px] flex items-center justify-center font-bold">
              MC
            </div>
            <div className="w-6 h-4 bg-gray-200 rounded text-[8px] flex items-center justify-center font-bold">
              AMEX
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
