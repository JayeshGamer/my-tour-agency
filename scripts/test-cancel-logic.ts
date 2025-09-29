// Test script to check booking cancellation functionality
import { db } from '@/lib/db';
import { bookings, tours, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

async function testCancelButtonLogic() {
  try {
    // Get sample booking data to understand the structure
    const sampleBookings = await db
      .select({
        id: bookings.id,
        numberOfPeople: bookings.numberOfPeople,
        totalPrice: bookings.totalPrice,
        bookingDate: bookings.bookingDate,
        startDate: bookings.startDate,
        status: bookings.status,
        tour: {
          id: tours.id,
          name: tours.name,
        },
        user: {
          id: users.id,
          email: users.email,
        },
      })
      .from(bookings)
      .leftJoin(tours, eq(bookings.tourId, tours.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .orderBy(desc(bookings.createdAt))
      .limit(5);

    console.log('Sample bookings:', JSON.stringify(sampleBookings, null, 2));

    // Test cancellation logic for each booking
    sampleBookings.forEach((booking, index) => {
      console.log(`\n--- Booking ${index + 1} ---`);
      console.log(`ID: ${booking.id}`);
      console.log(`Status: ${booking.status}`);
      console.log(`Start Date: ${booking.startDate}`);

      if (booking.status === 'cancelled') {
        console.log('❌ Cannot cancel: Already cancelled');
        return;
      }

      if (!booking.startDate) {
        console.log('❌ Cannot cancel: No start date');
        return;
      }

      const travelDate = new Date(booking.startDate);
      const now = new Date();
      const hoursDifference = (travelDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      console.log(`Hours until travel: ${hoursDifference.toFixed(2)}`);

      if (hoursDifference >= 24) {
        console.log('✅ CAN CANCEL: More than 24 hours away');
      } else {
        console.log('❌ Cannot cancel: Within 24 hours of travel');
      }
    });

  } catch (error) {
    console.error('Error testing bookings:', error);
  }
}

testCancelButtonLogic();
