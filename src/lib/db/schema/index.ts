import { pgTable, text, varchar, integer, decimal, timestamp, boolean, json, uuid, primaryKey, index, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const tourStatusEnum = pgEnum('tour_status', ['Active', 'Inactive']);
export const bookingStatusEnum = pgEnum('booking_status', ['Pending', 'Confirmed', 'Canceled']);
export const paymentStatusEnum = pgEnum('payment_status', ['Pending', 'Paid', 'Failed', 'Refunded']);
export const userRoleEnum = pgEnum('user_role', ['User', 'Admin']);
export const reviewStatusEnum = pgEnum('review_status', ['pending', 'approved', 'rejected']);

// Users table (Better Auth compatible + Requirements)
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  name: varchar('name', { length: 255 }), // Keeping for Better Auth compatibility
  passwordHash: text('password_hash'), // For secure authentication
  emailVerified: boolean('email_verified').default(false),
  image: text('image'),
  role: userRoleEnum('role').default('User').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
}));

// Sessions table (Better Auth)
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Accounts table (Better Auth - for OAuth providers)
export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  expiresAt: timestamp('expires_at'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.providerId, table.accountId] }),
}));

// Verification tokens table (Better Auth)
export const verifications = pgTable('verifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tours table (Matching Requirements)
export const tours = pgTable('tours', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(), // Tour name as per requirements
  title: varchar('title', { length: 255 }).notNull(), // Keeping for compatibility
  description: text('description').notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  duration: integer('duration').notNull(), // in days
  pricePerPerson: decimal('price_per_person', { precision: 10, scale: 2 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(), // Keeping for compatibility
  category: varchar('category', { length: 100 }).notNull(), // Type of tour
  difficulty: varchar('difficulty', { length: 50 }).notNull(),
  maxGroupSize: integer('max_group_size').notNull(),
  imageUrl: text('image_url'), // Primary image URL
  images: json('images').$type<string[]>().notNull(), // Additional images
  status: tourStatusEnum('status').default('Active').notNull(),
  startDates: json('start_dates').$type<string[]>().notNull(),
  included: json('included').$type<string[]>().notNull(),
  notIncluded: json('not_included').$type<string[]>().notNull(),
  itinerary: json('itinerary').$type<{day: number; title: string; description: string}[]>().notNull(),
  featured: boolean('featured').default(false).notNull(),
  createdBy: uuid('created_by').references(() => users.id), // User who created the tour (null for admin-created tours)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index('tours_category_idx').on(table.category),
  locationIdx: index('tours_location_idx').on(table.location),
  statusIdx: index('tours_status_idx').on(table.status),
  createdByIdx: index('tours_created_by_idx').on(table.createdBy),
}));

// Bookings table (Matching Requirements)
export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  tourId: uuid('tour_id').notNull().references(() => tours.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  numberOfPeople: integer('number_of_people').notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  bookingDate: timestamp('booking_date').defaultNow().notNull(), // When booking was made
  startDate: timestamp('start_date').notNull(), // Tour start date
  status: bookingStatusEnum('status').default('Pending').notNull(),
  paymentStatus: paymentStatusEnum('payment_status').default('Pending').notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }), // 'card', 'bank_transfer', etc.
  paymentReference: varchar('payment_reference', { length: 255 }), // Internal payment reference
  paymentDate: timestamp('payment_date'), // When payment was completed
  travelerInfo: json('traveler_info').$type<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    emergencyContact?: string;
    specialRequirements?: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('bookings_user_id_idx').on(table.userId),
  tourIdIdx: index('bookings_tour_id_idx').on(table.tourId),
  statusIdx: index('bookings_status_idx').on(table.status),
  paymentStatusIdx: index('bookings_payment_status_idx').on(table.paymentStatus),
}));

// Reviews table (Matching Requirements)
export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  tourId: uuid('tour_id').notNull().references(() => tours.id),
  rating: integer('rating').notNull(), // 1 to 5 scale
  comment: text('comment').notNull(),
  title: varchar('title', { length: 255 }), // Optional title
  status: reviewStatusEnum('status').default('pending').notNull(),
  bookingId: uuid('booking_id').references(() => bookings.id), // Optional booking reference
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('reviews_user_id_idx').on(table.userId),
  tourIdIdx: index('reviews_tour_id_idx').on(table.tourId),
  ratingIdx: index('reviews_rating_idx').on(table.rating),
  statusIdx: index('reviews_status_idx').on(table.status),
}));

// Wishlist table
export const wishlists = pgTable('wishlists', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  tourId: uuid('tour_id').notNull().references(() => tours.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Admin Log table (New requirement for audit tracking)
export const adminLogs = pgTable('admin_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  adminId: uuid('admin_id').notNull().references(() => users.id),
  action: text('action').notNull(), // Description of admin action
  affectedEntity: varchar('affected_entity', { length: 100 }).notNull(), // Entity type affected
  entityId: uuid('entity_id').notNull(), // ID of the entity affected
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  adminIdIdx: index('admin_logs_admin_id_idx').on(table.adminId),
  entityIdx: index('admin_logs_entity_idx').on(table.affectedEntity, table.entityId),
}));

// System Logs table (for errors, payment failures, etc.)
export const systemLogs = pgTable('system_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: varchar('type', { length: 50 }).notNull(), // 'error', 'payment_failure', 'system', etc.
  message: text('message').notNull(),
  metadata: json('metadata').$type<Record<string, any>>(),
  userId: uuid('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  typeIdx: index('system_logs_type_idx').on(table.type),
  createdAtIdx: index('system_logs_created_at_idx').on(table.createdAt),
}));

// Notifications table for admin notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'booking', 'payment', 'system', 'review', etc.
  isRead: boolean('is_read').default(false).notNull(),
  priority: varchar('priority', { length: 20 }).default('normal').notNull(), // 'low', 'normal', 'high', 'urgent'
  adminId: uuid('admin_id').references(() => users.id), // null for system-wide notifications
  relatedEntityType: varchar('related_entity_type', { length: 50 }), // 'booking', 'user', 'tour', etc.
  relatedEntityId: uuid('related_entity_id'),
  metadata: json('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  typeIdx: index('notifications_type_idx').on(table.type),
  adminIdIdx: index('notifications_admin_id_idx').on(table.adminId),
  isReadIdx: index('notifications_is_read_idx').on(table.isRead),
  createdAtIdx: index('notifications_created_at_idx').on(table.createdAt),
}));

// Coupons table for discount management
export const coupons = pgTable('coupons', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  discountType: varchar('discount_type', { length: 20 }).notNull(), // 'percentage', 'fixed'
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
  minimumAmount: decimal('minimum_amount', { precision: 10, scale: 2 }),
  maximumDiscount: decimal('maximum_discount', { precision: 10, scale: 2 }),
  usageLimit: integer('usage_limit'), // null for unlimited
  usedCount: integer('used_count').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  validFrom: timestamp('valid_from').notNull(),
  validUntil: timestamp('valid_until').notNull(),
  applicableToTours: json('applicable_to_tours').$type<string[]>(), // null for all tours
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  codeIdx: index('coupons_code_idx').on(table.code),
  isActiveIdx: index('coupons_is_active_idx').on(table.isActive),
  validFromIdx: index('coupons_valid_from_idx').on(table.validFrom),
  validUntilIdx: index('coupons_valid_until_idx').on(table.validUntil),
}));

// Coupon usage tracking
export const couponUsage = pgTable('coupon_usage', {
  id: uuid('id').defaultRandom().primaryKey(),
  couponId: uuid('coupon_id').notNull().references(() => coupons.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  bookingId: uuid('booking_id').references(() => bookings.id),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).notNull(),
  usedAt: timestamp('used_at').defaultNow().notNull(),
}, (table) => ({
  couponIdIdx: index('coupon_usage_coupon_id_idx').on(table.couponId),
  userIdIdx: index('coupon_usage_user_id_idx').on(table.userId),
  usedAtIdx: index('coupon_usage_used_at_idx').on(table.usedAt),
}));

// Contact submissions table
export const contactSubmissions = pgTable('contact_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  subject: varchar('subject', { length: 500 }).notNull(),
  message: text('message').notNull(),
  inquiryType: varchar('inquiry_type', { length: 50 }).notNull(), // 'general', 'booking', 'support', 'emergency'
  status: varchar('status', { length: 50 }).default('new').notNull(), // 'new', 'in_progress', 'resolved', 'closed'
  priority: varchar('priority', { length: 20 }).default('normal').notNull(), // 'low', 'normal', 'high', 'urgent'
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  respondedAt: timestamp('responded_at'),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('contact_submissions_email_idx').on(table.email),
  statusIdx: index('contact_submissions_status_idx').on(table.status),
  inquiryTypeIdx: index('contact_submissions_inquiry_type_idx').on(table.inquiryType),
  createdAtIdx: index('contact_submissions_created_at_idx').on(table.createdAt),
}));

// Platform settings table
export const settings = pgTable('settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value'),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // 'string', 'number', 'boolean', 'json'
  category: varchar('category', { length: 50 }).notNull(), // 'general', 'email', 'payment', 'api', etc.
  isPublic: boolean('is_public').default(false).notNull(), // whether setting can be accessed by frontend
  updatedBy: uuid('updated_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  keyIdx: index('settings_key_idx').on(table.key),
  categoryIdx: index('settings_category_idx').on(table.category),
}));

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  reviews: many(reviews),
  wishlists: many(wishlists),
  adminLogs: many(adminLogs),
}));

export const toursRelations = relations(tours, ({ one, many }) => ({
  bookings: many(bookings),
  reviews: many(reviews),
  wishlists: many(wishlists),
  createdBy: one(users, {
    fields: [tours.createdBy],
    references: [users.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  tour: one(tours, {
    fields: [bookings.tourId],
    references: [tours.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  tour: one(tours, {
    fields: [reviews.tourId],
    references: [tours.id],
  }),
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  tour: one(tours, {
    fields: [wishlists.tourId],
    references: [tours.id],
  }),
}));

export const adminLogsRelations = relations(adminLogs, ({ one }) => ({
  admin: one(users, {
    fields: [adminLogs.adminId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  admin: one(users, {
    fields: [notifications.adminId],
    references: [users.id],
  }),
}));

export const couponsRelations = relations(coupons, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [coupons.createdBy],
    references: [users.id],
  }),
  usages: many(couponUsage),
}));

export const couponUsageRelations = relations(couponUsage, ({ one }) => ({
  coupon: one(coupons, {
    fields: [couponUsage.couponId],
    references: [coupons.id],
  }),
  user: one(users, {
    fields: [couponUsage.userId],
    references: [users.id],
  }),
  booking: one(bookings, {
    fields: [couponUsage.bookingId],
    references: [bookings.id],
  }),
}));

export const settingsRelations = relations(settings, ({ one }) => ({
  updatedBy: one(users, {
    fields: [settings.updatedBy],
    references: [users.id],
  }),
}));
