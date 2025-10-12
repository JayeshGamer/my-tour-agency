import * as dotenv from 'dotenv';
import { db } from '../lib/db';
import * as schema from '../lib/db/schema';
import {
  createNotification,
  createBookingNotification,
  createPaymentNotification,
  createSystemErrorNotification,
  createReviewNotification,
  createHighVolumeNotification
} from '../lib/notifications';
import { sql } from 'drizzle-orm';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function seedNotifications() {
  console.log('🌱 Seeding sample notifications...');
  console.log('====================================\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env.local');
    process.exit(1);
  }

  try {
    // Get a sample admin user (if exists)
    const adminUsers = await db.select().from(schema.users).where(
      sql`${schema.users.role} = 'Admin'`
    ).limit(1);

    const adminId = adminUsers.length > 0 ? adminUsers[0].id : null;

    console.log(`🔍 Found admin user: ${adminId ? 'Yes' : 'No'}`);

    // Create sample notifications
    console.log('📬 Creating sample notifications...');

    // System-wide notifications (no specific admin)
    await createNotification({
      title: 'Welcome to Admin Panel',
      message: 'Your admin panel is now fully functional with real database integration!',
      type: 'info',
      priority: 'normal'
    });

    await createSystemErrorNotification(
      'Database connection timeout detected',
      {
        errorCode: 'DB_TIMEOUT',
        duration: '5s',
        affected_queries: 3
      }
    );

    await createNotification({
      title: 'System Maintenance Completed',
      message: 'Scheduled maintenance window completed successfully. All services are operational.',
      type: 'success',
      priority: 'low'
    });

    // Booking-related notifications
    await createBookingNotification(
      'mock-booking-001',
      'mock-user-001',
      'Swiss Alps Adventure',
      'created'
    );

    await createBookingNotification(
      'mock-booking-002',
      'mock-user-002',
      'Japanese Cultural Journey',
      'confirmed'
    );

    // Payment notifications
    await createPaymentNotification(
      'pi_mock_payment_001',
      2499.99,
      'success',
      'mock-booking-001'
    );

    await createPaymentNotification(
      'pi_mock_payment_002',
      1299.50,
      'failed',
      'mock-booking-003'
    );

    // Review notifications
    await createReviewNotification(
      'mock-review-001',
      'Safari Adventure in Kenya',
      5,
      'mock-user-003'
    );

    await createReviewNotification(
      'mock-review-002',
      'Mountain Trek Experience',
      2,
      'mock-user-004'
    );

    // High volume alerts
    await createHighVolumeNotification(
      'mock-tour-001',
      'Swiss Alps Adventure',
      25,
      'week'
    );

    // Security/Warning notifications
    await createNotification({
      title: 'Multiple Failed Login Attempts',
      message: 'Detected 5 failed login attempts from IP 192.168.1.100 in the last hour',
      type: 'warning',
      priority: 'high',
      relatedEntityType: 'security',
      metadata: {
        ip: '192.168.1.100',
        attempts: 5,
        timeframe: '1 hour'
      }
    });

    await createNotification({
      title: 'Low Inventory Alert',
      message: 'Tour "Tropical Paradise Escape" only has 2 spots remaining for next month',
      type: 'warning',
      priority: 'normal',
      relatedEntityType: 'tour',
      relatedEntityId: 'mock-tour-002',
      metadata: {
        tourName: 'Tropical Paradise Escape',
        remainingSpots: 2,
        period: 'next month'
      }
    });

    console.log('✅ Sample notifications created successfully!');

    // Verify notifications were created
    const notificationCount = await db.select({ count: sql<number>`count(*)` }).from(schema.notifications);
    console.log(`📊 Total notifications in database: ${notificationCount[0].count}`);

    console.log('\n🎉 Notification seeding completed successfully!');
    console.log('\n💡 You can now visit /admin/notifications to see the notifications in action');
    
  } catch (error: any) {
    console.error('\n❌ Error seeding notifications:', error.message);
    process.exit(1);
  }
}

// Run the seeding
seedNotifications();
