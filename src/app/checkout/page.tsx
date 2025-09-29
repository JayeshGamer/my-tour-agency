'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '../../lib/auth-client';
import CheckoutForm from '../../components/checkout/CheckoutForm';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

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

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    if (!isPending && !session) {
      toast.error('Please login to access checkout');
      router.push('/login');
      return;
    }

    // Load cart items from localStorage
    try {
      const savedCart = localStorage.getItem('tourCart');
      if (savedCart) {
        const items = JSON.parse(savedCart) as CartItem[];
        if (items.length === 0) {
          toast.error('Your cart is empty');
          router.push('/tours');
          return;
        }
        setCartItems(items);
      } else {
        toast.error('Your cart is empty');
        router.push('/tours');
        return;
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Error loading your cart');
      router.push('/tours');
    } finally {
      setLoading(false);
    }
  }, [session, isPending, router]);

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your booking and payment details</p>
          
          {/* Demo Mode Notice */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                i
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Demo Mode Active</p>
                <p>This checkout is running in demo mode. No real payments will be processed. Use any valid card format for demonstration purposes.</p>
              </div>
            </div>
          </div>
        </div>

        <CheckoutForm 
          user={session.user} 
          cartItems={cartItems} 
          onSuccess={() => {
            // Clear cart on successful payment
            localStorage.removeItem('tourCart');
            router.push('/profile?tab=bookings');
          }}
        />
      </div>
    </div>
  );
}
