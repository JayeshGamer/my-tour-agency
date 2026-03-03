'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '../../lib/auth-client';
import CheckoutForm from '../../components/checkout/CheckoutForm';
import { toast } from 'react-hot-toast';
import { Loader2, ShieldCheck, Lock } from 'lucide-react';

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

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#030712]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-gray-900 dark:text-white" />
          <p className="text-gray-600 dark:text-gray-400">Loading checkout...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customTourData, setCustomTourData] = useState<CustomTourData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    if (!isPending && !session) {
      toast.error('Please login to access checkout');
      router.push('/login');
      return;
    }

    try {
      // Check if this is a custom tour payment
      const customData = searchParams.get('data');
      if (customData) {
        const parsedData = JSON.parse(decodeURIComponent(customData)) as CustomTourData;
        if (parsedData.type === 'custom_tour') {
          setCustomTourData(parsedData);
          setLoading(false);
          return;
        }
      }

      // Otherwise, load regular cart items from localStorage
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
      console.error('Error loading checkout data:', error);
      toast.error('Error loading checkout data');
      router.push('/tours');
    } finally {
      setLoading(false);
    }
  }, [session, isPending, router, searchParams]);

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#030712]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-gray-900 dark:text-white" />
          <p className="text-gray-600 dark:text-gray-400">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#030712]">
      {/* Header Section */}
      <section className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {customTourData ? 'Custom Tour Payment' : 'Secure Checkout'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {customTourData
                  ? 'Complete your custom tour booking'
                  : 'Complete your booking securely'
                }
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Secure Payment</span>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <span className="text-xs text-gray-600 dark:text-gray-400">SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Money Back Guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CheckoutForm
            user={session.user}
            cartItems={cartItems}
            customTourData={customTourData}
          />
        </div>
      </section>
    </div>
  );
}
