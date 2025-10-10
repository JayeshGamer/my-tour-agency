'use client';

import { useState } from 'react';
import { 
  Calendar, 
  Heart, 
  User, 
  MapPin,
  Trash2,
  Eye,
  X,
  Sparkles,
  Clock,
  Users,
  IndianRupee
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

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

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return {
          variant: 'default' as const,
          className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400'
        };
      case 'pending':
        return {
          variant: 'secondary' as const,
          className: 'bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400'
        };
      case 'cancelled':
      case 'canceled':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-400'
        };
      default:
        return {
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1 shadow-sm">
          <TabsTrigger
            value="orders"
            className="data-[state=active]:bg-[#030712] dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-[#030712] text-gray-700 dark:text-gray-300 gap-2"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">My Bookings</span>
            <span className="sm:hidden">Bookings</span>
          </TabsTrigger>
          <TabsTrigger
            value="favorites"
            className="data-[state=active]:bg-[#030712] dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-[#030712] text-gray-700 dark:text-gray-300 gap-2"
          >
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Favorites</span>
            <span className="sm:hidden">Saved</span>
          </TabsTrigger>
          <TabsTrigger
            value="details"
            className="data-[state=active]:bg-[#030712] dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-[#030712] text-gray-700 dark:text-gray-300 gap-2"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">My Details</span>
            <span className="sm:hidden">Details</span>
          </TabsTrigger>
        </TabsList>

        {/* My Orders Tab */}
        <TabsContent value="orders" className="mt-6">
          {bookings.length === 0 ? (
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
                    <Calendar className="h-10 w-10 text-gray-400 dark:text-gray-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No bookings yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Start your adventure by booking an amazing tour from our collection.
                  </p>
                  <Link href="/tours">
                    <Button className="bg-[#030712] dark:bg-white text-white dark:text-[#030712] hover:bg-gray-900 dark:hover:bg-gray-100">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Browse Tours
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {bookings.map((booking, index) => {
                const statusConfig = getStatusConfig(booking.status);
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="group overflow-hidden border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:shadow-lg">
                      <div className="flex flex-col sm:flex-row gap-4 p-6">
                        {/* Tour Image */}
                        <div className="flex-shrink-0 w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                          {booking.tour?.imageUrl ? (
                            <Image
                              src={booking.tour.imageUrl}
                              alt={booking.tour.name}
                              width={128}
                              height={128}
                              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#030712] to-gray-900 dark:from-white dark:to-gray-200 flex items-center justify-center">
                              <span className="text-white dark:text-[#030712] font-semibold">Tour</span>
                            </div>
                          )}
                        </div>

                        {/* Booking Details */}
                        <div className="flex-1 space-y-3">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">
                                {booking.tour?.name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <MapPin className="h-3.5 w-3.5" />
                                <span>{booking.tour?.location}</span>
                                <span>•</span>
                                <Clock className="h-3.5 w-3.5" />
                                <span>{booking.tour?.duration} days</span>
                              </div>
                            </div>
                            <Badge className={statusConfig.className}>
                              {booking.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(booking.startDate), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Users className="h-4 w-4" />
                              <span>{booking.numberOfPeople} {booking.numberOfPeople > 1 ? 'people' : 'person'}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
                            <div className="flex items-center gap-1">
                              <IndianRupee className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                              <span className="font-bold text-gray-900 dark:text-white">{booking.totalPrice}</span>
                            </div>
                            <div className="flex gap-2">
                              <Link href={`/tours/${booking.tour?.id}`}>
                                <Button variant="outline" size="sm" className="h-8 border-gray-300 dark:border-gray-700">
                                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                                  View
                                </Button>
                              </Link>
                              {booking.status.toLowerCase() === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 border-red-200 dark:border-red-800"
                                  onClick={() => handleCancelBooking(booking.id)}
                                  disabled={isLoading}
                                >
                                  <X className="h-3.5 w-3.5 mr-1.5" />
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Favorites Tab */}
        <TabsContent value="favorites" className="mt-6">
          {wishlist.length === 0 ? (
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
                    <Heart className="h-10 w-10 text-gray-400 dark:text-gray-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No favorites yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Save tours you love to easily find them later.
                  </p>
                  <Link href="/tours">
                    <Button className="bg-[#030712] dark:bg-white text-white dark:text-[#030712] hover:bg-gray-900 dark:hover:bg-gray-100">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Browse Tours
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {wishlist.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group overflow-hidden border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:shadow-lg">
                    <div className="flex flex-col sm:flex-row gap-4 p-6">
                      {/* Tour Image */}
                      <div className="flex-shrink-0 w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {item.tour?.imageUrl ? (
                          <Image
                            src={item.tour.imageUrl}
                            alt={item.tour.name}
                            width={128}
                            height={128}
                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#030712] to-gray-900 dark:from-white dark:to-gray-200 flex items-center justify-center">
                            <span className="text-white dark:text-[#030712] font-semibold">Tour</span>
                          </div>
                        )}
                      </div>

                      {/* Tour Details */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">
                            {item.tour?.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{item.tour?.location}</span>
                            <span>•</span>
                            <Clock className="h-3.5 w-3.5" />
                            <span>{item.tour?.duration} days</span>
                          </div>
                        </div>

                        <div className="text-sm">
                          <p className="text-gray-600 dark:text-gray-400">From</p>
                          <p className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-1">
                            <IndianRupee className="h-4 w-4" />
                            {item.tour?.pricePerPerson}
                            <span className="text-sm font-normal text-gray-600 dark:text-gray-400"> per person</span>
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.tour?.startDates && item.tour.startDates.length > 0 && (
                              <>Next: {format(new Date(item.tour.startDates[0]), 'MMM dd, yyyy')}</>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/tours/${item.tour?.id}`}>
                              <Button variant="default" size="sm" className="h-8 bg-[#030712] dark:bg-white text-white dark:text-[#030712] hover:bg-gray-900 dark:hover:bg-gray-100">
                                <Eye className="h-3.5 w-3.5 mr-1.5" />
                                View
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 border-red-200 dark:border-red-800"
                              onClick={() => handleRemoveFavorite(item.id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Details Tab */}
        <TabsContent value="details" className="mt-6">
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <CardTitle className="text-xl">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">First Name</label>
                  <p className="text-gray-900 dark:text-white font-medium">{user.firstName || 'Not provided'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Name</label>
                  <p className="text-gray-900 dark:text-white font-medium">{user.lastName || 'Not provided'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email Address</label>
                  <p className="text-gray-900 dark:text-white font-medium">{user.email}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone Number</label>
                  <p className="text-gray-500 dark:text-gray-500 italic">Not provided</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Address</label>
                  <p className="text-gray-500 dark:text-gray-500 italic">Not provided</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
