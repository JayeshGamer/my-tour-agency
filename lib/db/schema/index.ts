import { pgTable, text, varchar, integer, decimal, timestamp, boolean, json, uuid, primaryKey, index, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const tourStatusEnum = pgEnum('tour_status', ['Active', 'Inactive']);
export const bookingStatusEnum = pgEnum('booking_status', ['Pending', 'Confirmed', 'Canceled']);
export const userRoleEnum = pgEnum('user_role', ['User', 'Admin']);

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
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index('tours_category_idx').on(table.category),
  locationIdx: index('tours_location_idx').on(table.location),
  statusIdx: index('tours_status_idx').on(table.status),
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
  paymentIntentId: varchar('payment_intent_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('bookings_user_id_idx').on(table.userId),
  tourIdIdx: index('bookings_tour_id_idx').on(table.tourId),
  statusIdx: index('bookings_status_idx').on(table.status),
}));

// Reviews table (Matching Requirements)
export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  tourId: uuid('tour_id').notNull().references(() => tours.id),
  rating: integer('rating').notNull(), // 1 to 5 scale
  comment: text('comment').notNull(),
  title: varchar('title', { length: 255 }), // Optional title
  bookingId: uuid('booking_id').references(() => bookings.id), // Optional booking reference
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('reviews_user_id_idx').on(table.userId),
  tourIdIdx: index('reviews_tour_id_idx').on(table.tourId),
  ratingIdx: index('reviews_rating_idx').on(table.rating),
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

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  reviews: many(reviews),
  wishlists: many(wishlists),
  adminLogs: many(adminLogs),
}));

export const toursRelations = relations(tours, ({ many }) => ({
  bookings: many(bookings),
  reviews: many(reviews),
  wishlists: many(wishlists),
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
