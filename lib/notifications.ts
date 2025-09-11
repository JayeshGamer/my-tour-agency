import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';

export interface CreateNotificationParams {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'booking' | 'payment' | 'system' | 'review';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  adminId?: string | null; // null for system-wide notifications
  relatedEntityType?: string;
  relatedEntityId?: string;
  metadata?: Record<string, any>;
}

/**
 * Create a new notification
 */
export async function createNotification({
  title,
  message,
  type,
  priority = 'normal',
  adminId = null,
  relatedEntityType,
  relatedEntityId,
  metadata,
}: CreateNotificationParams) {
  try {
    const result = await db
      .insert(notifications)
      .values({
        title,
        message,
        type,
        priority,
        adminId,
        relatedEntityType,
        relatedEntityId,
        metadata,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Create a booking-related notification
 */
export async function createBookingNotification(
  bookingId: string,
  userId: string,
  tourName: string,
  action: 'created' | 'confirmed' | 'cancelled' | 'refunded'
) {
  const messages = {
    created: `New booking created for "${tourName}"`,
    confirmed: `Booking confirmed for "${tourName}"`,
    cancelled: `Booking cancelled for "${tourName}"`,
    refunded: `Refund processed for "${tourName}" booking`,
  };

  const priorities = {
    created: 'normal' as const,
    confirmed: 'low' as const,
    cancelled: 'normal' as const,
    refunded: 'high' as const,
  };

  return createNotification({
    title: `Booking ${action.charAt(0).toUpperCase() + action.slice(1)}`,
    message: messages[action],
    type: 'booking',
    priority: priorities[action],
    relatedEntityType: 'booking',
    relatedEntityId: bookingId,
    metadata: {
      userId,
      tourName,
      action,
    },
  });
}

/**
 * Create a payment-related notification
 */
export async function createPaymentNotification(
  paymentIntentId: string,
  amount: number,
  status: 'success' | 'failed' | 'refunded',
  bookingId?: string
) {
  const messages = {
    success: `Payment of $${amount.toLocaleString()} processed successfully`,
    failed: `Payment of $${amount.toLocaleString()} failed`,
    refunded: `Refund of $${amount.toLocaleString()} processed`,
  };

  const priorities = {
    success: 'low' as const,
    failed: 'high' as const,
    refunded: 'normal' as const,
  };

  return createNotification({
    title: `Payment ${status === 'success' ? 'Processed' : status === 'failed' ? 'Failed' : 'Refunded'}`,
    message: messages[status],
    type: 'payment',
    priority: priorities[status],
    relatedEntityType: 'payment',
    relatedEntityId: paymentIntentId,
    metadata: {
      amount,
      status,
      bookingId,
      paymentIntentId,
    },
  });
}

/**
 * Create a system error notification
 */
export async function createSystemErrorNotification(
  error: string,
  details?: Record<string, any>
) {
  return createNotification({
    title: 'System Error Detected',
    message: error,
    type: 'error',
    priority: 'urgent',
    relatedEntityType: 'system',
    metadata: details,
  });
}

/**
 * Create a new review notification
 */
export async function createReviewNotification(
  reviewId: string,
  tourName: string,
  rating: number,
  userId: string
) {
  return createNotification({
    title: 'New Review Submitted',
    message: `New ${rating}-star review submitted for "${tourName}"`,
    type: 'review',
    priority: rating <= 2 ? 'high' : 'normal',
    relatedEntityType: 'review',
    relatedEntityId: reviewId,
    metadata: {
      rating,
      tourName,
      userId,
    },
  });
}

/**
 * Create a high volume booking notification
 */
export async function createHighVolumeNotification(
  tourId: string,
  tourName: string,
  bookingCount: number,
  period: string = 'week'
) {
  return createNotification({
    title: 'High Booking Volume Alert',
    message: `"${tourName}" has received ${bookingCount} bookings this ${period}`,
    type: 'info',
    priority: 'normal',
    relatedEntityType: 'tour',
    relatedEntityId: tourId,
    metadata: {
      tourName,
      bookingCount,
      period,
    },
  });
}
