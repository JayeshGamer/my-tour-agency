import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { users, bookings, tours, wishlists } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';

async function getUserData(userId: string) {
  try {
    // Get user data
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user[0]) {
      return null;
    }

    // Get user bookings with tour details
    const userBookings = await db
      .select({
        id: bookings.id,
        numberOfPeople: bookings.numberOfPeople,
        totalPrice: bookings.totalPrice,
        startDate: bookings.startDate,
        status: bookings.status,
        createdAt: bookings.createdAt,
        tour: {
          id: tours.id,
          name: tours.name,
          location: tours.location,
          duration: tours.duration,
          pricePerPerson: tours.pricePerPerson,
          imageUrl: tours.imageUrl,
        },
      })
      .from(bookings)
      .leftJoin(tours, eq(bookings.tourId, tours.id))
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));

    // Get user wishlist with tour details
    const userWishlist = await db
      .select({
        id: wishlists.id,
        createdAt: wishlists.createdAt,
        tour: {
          id: tours.id,
          name: tours.name,
          location: tours.location,
          duration: tours.duration,
          pricePerPerson: tours.pricePerPerson,
          imageUrl: tours.imageUrl,
          startDates: tours.startDates,
        },
      })
      .from(wishlists)
      .leftJoin(tours, eq(wishlists.tourId, tours.id))
      .where(eq(wishlists.userId, userId))
      .orderBy(desc(wishlists.createdAt));

    return {
      user: user[0],
      bookings: userBookings,
      wishlist: userWishlist,
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

export default async function ProfilePage() {
  // Get session
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    redirect('/login');
  }

  // Get user data
  const userData = await getUserData(session.user.id);
  
  if (!userData) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <ProfileHeader user={userData.user} />
        
        {/* Profile Tabs */}
        <div className="mt-8">
          <ProfileTabs 
            bookings={userData.bookings}
            wishlist={userData.wishlist}
            user={userData.user}
          />
        </div>
      </div>
    </div>
  );
}
