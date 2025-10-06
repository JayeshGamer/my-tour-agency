'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {customTourData ? 'Custom Tour Payment' : 'Checkout'}
          </h1>
          <p className="text-gray-600">
            {customTourData
              ? 'Complete your custom tour booking and payment'
              : 'Complete your booking and payment details'
            }
          </p>

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

          {/* Custom Tour Info */}
          {customTourData && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Custom Tour Request</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
                <div>
                  <span className="font-medium">Destination:</span> {customTourData.destination}
                </div>
                <div>
                  <span className="font-medium">Group Size:</span> {customTourData.groupSize} people
                </div>
                <div>
                  <span className="font-medium">Total Amount:</span> {customTourData.currency} {customTourData.amount.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Request ID:</span> {customTourData.requestId.slice(0, 8)}...
                </div>
              </div>
            </div>
          )}
        </div>

        <CheckoutForm 
          user={session.user}
          cartItems={cartItems}
          customTourData={customTourData}
        />
      </div>
    </div>
  );
}
