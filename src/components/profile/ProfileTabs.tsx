'use client';

import { useState } from 'react';
import { 
  Calendar, 
  Heart, 
  User, 
  CreditCard, 
  MapPin, 
  Trash2, 
  Plus,
  Eye,
  Edit,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

interface Booking {
  id: string;
  numberOfPeople: number;
  totalPrice: string;
  startDate: Date;
  status: string;
  createdAt: Date;
  tour: {
    id: string;
    name: string;
    location: string;
    duration: number;
    pricePerPerson: string;
    imageUrl: string | null;
  } | null;
}

interface WishlistItem {
  id: string;
  createdAt: Date;
  tour: {
    id: string;
    name: string;
    location: string;
    duration: number;
    pricePerPerson: string;
    imageUrl: string | null;
    startDates: string[];
  } | null;
}

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
}

interface ProfileTabsProps {
  bookings: Booking[];
  wishlist: WishlistItem[];
  user: User;
}

export default function ProfileTabs({ bookings, wishlist, user }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState('orders');
  const [isLoading, setIsLoading] = useState(false);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      toast.success('Booking cancelled successfully');
      window.location.reload();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (wishlistId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/wishlist/${wishlistId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove from favorites');
      }

      toast.success('Removed from favorites');
      window.location.reload();
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
      case 'canceled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="orders" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          My Orders
        </TabsTrigger>
        <TabsTrigger value="favorites" className="flex items-center gap-2">
          <Heart className="h-4 w-4" />
          Favorites
        </TabsTrigger>
        <TabsTrigger value="details" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          My Details
        </TabsTrigger>
        <TabsTrigger value="payments" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Payment Methods
        </TabsTrigger>
        <TabsTrigger value="addresses" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Address Book
        </TabsTrigger>
      </TabsList>

      {/* My Orders Tab */}
      <TabsContent value="orders" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>My Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-6">You haven&apos;t made any bookings yet.</p>
                <Link href="/tours">
                  <Button>Browse Tours</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4 flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                        {booking.tour?.imageUrl ? (
                          booking.tour.imageUrl.startsWith('/api/placeholder') ? (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                              <span className="text-white text-xs font-semibold">Tour</span>
                            </div>
                          ) : (
                            <Image
                              src={booking.tour.imageUrl}
                              alt={booking.tour.name}
                              width={96}
                              height={96}
                              className="object-cover w-full h-full"
                            />
                          )
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">Tour</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{booking.tour?.name}</h3>
                          <p className="text-gray-600">{booking.tour?.location} • {booking.tour?.duration} days</p>
                          <p className="text-sm text-gray-500">
                            {booking.numberOfPeople} people • ${booking.totalPrice}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(booking.startDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={getStatusBadgeVariant(booking.status)}>
                            {booking.status}
                          </Badge>
                          <div className="mt-2">
                            {booking.status.toLowerCase() === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelBooking(booking.id)}
                                disabled={isLoading}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Favorites Tab */}
      <TabsContent value="favorites" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Favorite Tours</CardTitle>
          </CardHeader>
          <CardContent>
            {wishlist.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-6">You haven&apos;t added any tours to your favorites yet.</p>
                <Link href="/tours">
                  <Button>Browse Tours</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {wishlist.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                        {item.tour?.imageUrl ? (
                          item.tour.imageUrl.startsWith('/api/placeholder') ? (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                              <span className="text-white text-xs font-semibold">Tour</span>
                            </div>
                          ) : (
                            <Image
                              src={item.tour.imageUrl}
                              alt={item.tour.name}
                              width={96}
                              height={96}
                              className="object-cover w-full h-full"
                            />
                          )
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">Tour</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{item.tour?.name}</h3>
                          <p className="text-gray-600">{item.tour?.location} • {item.tour?.duration} days</p>
                          <p className="text-sm text-gray-500">
                            From ${item.tour?.pricePerPerson} per person
                          </p>
                          {item.tour?.startDates && item.tour.startDates.length > 0 && (
                            <p className="text-sm text-gray-500">
                              Next date: {format(new Date(item.tour.startDates[0]), 'MMM dd, yyyy')}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/tours/${item.tour?.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveFavorite(item.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* My Details Tab */}
      <TabsContent value="details" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">First Name</label>
                <p className="text-gray-900">{user.firstName || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Last Name</label>
                <p className="text-gray-900">{user.lastName || 'Not provided'}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <p className="text-gray-500">Not provided</p>
            </div>
            <div>
              <label className="text-sm font-medium">Address</label>
              <p className="text-gray-500">Not provided</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Payment Methods Tab */}
      <TabsContent value="payments" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Payment Methods
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add New
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No payment methods added yet.</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Address Book Tab */}
      <TabsContent value="addresses" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Address Book
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add New
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No addresses saved yet.</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
