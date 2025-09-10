import * as dotenv from 'dotenv';
// Load environment variables FIRST
dotenv.config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { tours, bookings, reviews, wishlists, adminLogs } from './schema';
import * as bcrypt from 'bcryptjs';
import * as schema from './schema';

// Generate consistent UUIDs for demo data
const USER_IDS = {
  admin: '550e8400-e29b-41d4-a716-446655440001',
  john: '550e8400-e29b-41d4-a716-446655440002',
  jane: '550e8400-e29b-41d4-a716-446655440003',
  mike: '550e8400-e29b-41d4-a716-446655440004',
  sarah: '550e8400-e29b-41d4-a716-446655440005',
};

const TOUR_IDS = {
  everest: '650e8400-e29b-41d4-a716-446655440101',
  santorini: '650e8400-e29b-41d4-a716-446655440102',
  japan: '650e8400-e29b-41d4-a716-446655440103',
  serengeti: '650e8400-e29b-41d4-a716-446655440104',
  machu: '650e8400-e29b-41d4-a716-446655440105',
  iceland: '650e8400-e29b-41d4-a716-446655440106',
  dubai: '650e8400-e29b-41d4-a716-446655440107',
  amazon: '650e8400-e29b-41d4-a716-446655440108',
};

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });
  
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing data...');
    await db.delete(adminLogs);
    await db.delete(wishlists);
    await db.delete(reviews);
    await db.delete(bookings);
    await db.delete(tours);
    // Don't delete users to preserve auth accounts
    
    // Create demo users (if they don't exist)
    console.log('Creating demo users...');
    const demoUsers = [
      {
        id: USER_IDS.admin,
        email: 'admin@travelagency.com',
        firstName: 'Admin',
        lastName: 'User',
        name: 'Admin User',
        passwordHash: await bcrypt.hash('admin123', 10),
        role: 'Admin' as const,
        emailVerified: true,
      },
      {
        id: USER_IDS.john,
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'User' as const,
        emailVerified: true,
      },
      {
        id: USER_IDS.jane,
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        name: 'Jane Smith',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'User' as const,
        emailVerified: true,
      },
      {
        id: USER_IDS.mike,
        email: 'mike.wilson@example.com',
        firstName: 'Mike',
        lastName: 'Wilson',
        name: 'Mike Wilson',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'User' as const,
        emailVerified: true,
      },
      {
        id: USER_IDS.sarah,
        email: 'sarah.johnson@example.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        name: 'Sarah Johnson',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'User' as const,
        emailVerified: true,
      },
    ];

    for (const user of demoUsers) {
      await sql`
        INSERT INTO users (id, email, first_name, last_name, name, password_hash, role, email_verified)
        VALUES (${user.id}, ${user.email}, ${user.firstName}, ${user.lastName}, ${user.name}, ${user.passwordHash}, ${user.role}, ${user.emailVerified})
        ON CONFLICT (email) DO NOTHING
      `;
    }

    // Create tours
    console.log('Creating tours...');
    const toursData = [
      {
        id: TOUR_IDS.everest,
        name: 'Everest Base Camp Trek',
        title: 'Everest Base Camp Trek - Ultimate Himalayan Adventure',
        description: 'Experience the ultimate Himalayan adventure with our 14-day trek to Everest Base Camp. Walk in the footsteps of legendary mountaineers.',
        location: 'Nepal',
        duration: 14,
        pricePerPerson: '2999.00',
        price: '2999.00',
        category: 'Adventure',
        difficulty: 'Difficult',
        maxGroupSize: 12,
        imageUrl: '/api/placeholder/400/300',
        images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
        status: 'Active' as const,
        startDates: ['2024-03-15', '2024-04-10', '2024-05-01'],
        included: ['Professional guide', 'All meals', 'Accommodation', 'Permits'],
        notIncluded: ['International flights', 'Travel insurance', 'Tips'],
        itinerary: [
          { day: 1, title: 'Fly to Lukla', description: 'Scenic flight and trek to Phakding' },
          { day: 2, title: 'Trek to Namche', description: 'Cross suspension bridges' },
        ],
        featured: true,
      },
      {
        id: TOUR_IDS.santorini,
        name: 'Santorini Island Escape',
        title: 'Santorini Island Escape - Greek Paradise',
        description: 'Discover the magic of Santorini with stunning sunsets and crystal-clear waters.',
        location: 'Greece',
        duration: 7,
        pricePerPerson: '1899.00',
        price: '1899.00',
        category: 'Beach',
        difficulty: 'Easy',
        maxGroupSize: 20,
        imageUrl: '/api/placeholder/400/300',
        images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
        status: 'Active' as const,
        startDates: ['2024-05-01', '2024-06-15', '2024-07-01'],
        included: ['Hotel accommodation', 'Daily breakfast', 'Island tour'],
        notIncluded: ['Flights', 'Lunch and dinner'],
        itinerary: [
          { day: 1, title: 'Arrival', description: 'Check-in and sunset in Oia' },
          { day: 2, title: 'Caldera Cruise', description: 'Full day sailing' },
        ],
        featured: true,
      },
      {
        id: TOUR_IDS.japan,
        name: 'Japanese Cultural Journey',
        title: 'Japanese Cultural Journey - Ancient Meets Modern',
        description: 'Immerse yourself in the fascinating culture of Japan from temples to technology.',
        location: 'Japan',
        duration: 10,
        pricePerPerson: '3299.00',
        price: '3299.00',
        category: 'Cultural',
        difficulty: 'Easy',
        maxGroupSize: 15,
        imageUrl: '/api/placeholder/400/300',
        images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
        status: 'Active' as const,
        startDates: ['2024-03-20', '2024-04-05', '2024-10-15'],
        included: ['Hotel accommodation', 'Rail Pass', 'Temple tours', 'Breakfast'],
        notIncluded: ['International flights', 'Most meals'],
        itinerary: [
          { day: 1, title: 'Tokyo Arrival', description: 'Explore Shibuya' },
          { day: 2, title: 'Tokyo Tour', description: 'Senso-ji Temple and Skytree' },
        ],
        featured: true,
      },
      {
        id: TOUR_IDS.serengeti,
        name: 'Serengeti Safari Adventure',
        title: 'Serengeti Safari Adventure - Wildlife Paradise',
        description: 'Witness incredible wildlife on this 8-day safari. See the Big Five!',
        location: 'Tanzania',
        duration: 8,
        pricePerPerson: '4299.00',
        price: '4299.00',
        category: 'Wildlife',
        difficulty: 'Moderate',
        maxGroupSize: 10,
        imageUrl: '/api/placeholder/400/300',
        images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
        status: 'Active' as const,
        startDates: ['2024-06-01', '2024-07-15', '2024-08-01'],
        included: ['Lodge accommodation', 'All meals', 'Game drives', 'Park fees'],
        notIncluded: ['International flights', 'Visas', 'Tips'],
        itinerary: [
          { day: 1, title: 'Arrival', description: 'Transfer to hotel' },
          { day: 2, title: 'Tarangire', description: 'Full day game drive' },
        ],
        featured: false,
      },
      {
        id: TOUR_IDS.machu,
        name: 'Machu Picchu Discovery',
        title: 'Machu Picchu Discovery - Inca Trail Adventure',
        description: 'Trek the legendary Inca Trail to the lost city of Machu Picchu.',
        location: 'Peru',
        duration: 6,
        pricePerPerson: '1799.00',
        price: '1799.00',
        category: 'Adventure',
        difficulty: 'Moderate',
        maxGroupSize: 12,
        imageUrl: '/api/placeholder/400/300',
        images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
        status: 'Active' as const,
        startDates: ['2024-04-01', '2024-05-15', '2024-09-01'],
        included: ['Camping equipment', 'Meals', 'Guides', 'Train tickets'],
        notIncluded: ['Flights', 'Sleeping bag', 'Tips'],
        itinerary: [
          { day: 1, title: 'Start Trek', description: 'Begin the Inca Trail' },
          { day: 4, title: 'Machu Picchu', description: 'Sunrise arrival' },
        ],
        featured: false,
      },
      {
        id: TOUR_IDS.iceland,
        name: 'Northern Lights Iceland',
        title: 'Northern Lights Iceland - Arctic Wonder',
        description: 'Chase the Northern Lights across Iceland\'s stunning winter landscape.',
        location: 'Iceland',
        duration: 5,
        pricePerPerson: '2299.00',
        price: '2299.00',
        category: 'Adventure',
        difficulty: 'Easy',
        maxGroupSize: 15,
        imageUrl: '/api/placeholder/400/300',
        images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
        status: 'Active' as const,
        startDates: ['2024-11-15', '2024-12-01', '2025-01-15'],
        included: ['Hotel', 'Northern Lights tours', 'Blue Lagoon', 'Breakfast'],
        notIncluded: ['Flights', 'Lunch and dinner'],
        itinerary: [
          { day: 1, title: 'Reykjavik', description: 'City tour' },
          { day: 2, title: 'Golden Circle', description: 'Geysir and Gullfoss' },
        ],
        featured: true,
      },
    ];

    const insertedTours = await db.insert(tours).values(toursData).returning();
    console.log(`Created ${insertedTours.length} tours`);

    // Create bookings
    console.log('Creating bookings...');
    const bookingsData = [
      {
        userId: USER_IDS.john,
        tourId: TOUR_IDS.everest,
        numberOfPeople: 2,
        totalPrice: '5998.00',
        startDate: new Date('2024-03-15'),
        bookingDate: new Date('2024-01-15'),
        status: 'Confirmed' as const,
      },
      {
        userId: USER_IDS.jane,
        tourId: TOUR_IDS.santorini,
        numberOfPeople: 2,
        totalPrice: '3798.00',
        startDate: new Date('2024-05-01'),
        bookingDate: new Date('2024-02-20'),
        status: 'Confirmed' as const,
      },
      {
        userId: USER_IDS.mike,
        tourId: TOUR_IDS.japan,
        numberOfPeople: 1,
        totalPrice: '3299.00',
        startDate: new Date('2024-04-05'),
        bookingDate: new Date('2024-02-01'),
        status: 'Pending' as const,
      },
    ];

    const insertedBookings = await db.insert(bookings).values(bookingsData).returning();
    console.log(`Created ${insertedBookings.length} bookings`);

    // Create reviews
    console.log('Creating reviews...');
    const reviewsData = [
      {
        userId: USER_IDS.john,
        tourId: TOUR_IDS.everest,
        rating: 5,
        title: 'Amazing Experience!',
        comment: 'The trek was challenging but absolutely worth it. Breathtaking views!',
        bookingId: insertedBookings[0].id,
      },
      {
        userId: USER_IDS.jane,
        tourId: TOUR_IDS.santorini,
        rating: 5,
        title: 'Perfect Getaway',
        comment: 'Santorini exceeded all expectations. Beautiful sunsets and great service.',
        bookingId: insertedBookings[1].id,
      },
      {
        userId: USER_IDS.mike,
        tourId: TOUR_IDS.japan,
        rating: 4,
        title: 'Cultural Immersion',
        comment: 'Japan was fascinating! Great mix of ancient and modern.',
      },
    ];

    const insertedReviews = await db.insert(reviews).values(reviewsData).returning();
    console.log(`Created ${insertedReviews.length} reviews`);

    // Create wishlists
    console.log('Creating wishlists...');
    const wishlistsData = [
      { userId: USER_IDS.john, tourId: TOUR_IDS.machu },
      { userId: USER_IDS.john, tourId: TOUR_IDS.iceland },
      { userId: USER_IDS.jane, tourId: TOUR_IDS.everest },
      { userId: USER_IDS.sarah, tourId: TOUR_IDS.santorini },
    ];

    const insertedWishlists = await db.insert(wishlists).values(wishlistsData).returning();
    console.log(`Created ${insertedWishlists.length} wishlist items`);

    // Create admin logs
    console.log('Creating admin logs...');
    const adminLogsData = [
      {
        adminId: USER_IDS.admin,
        action: 'Approved booking for Everest Base Camp Trek',
        affectedEntity: 'Booking',
        entityId: insertedBookings[0].id,
      },
      {
        adminId: USER_IDS.admin,
        action: 'Confirmed booking payment',
        affectedEntity: 'Booking',
        entityId: insertedBookings[1].id,
      },
    ];

    const insertedAdminLogs = await db.insert(adminLogs).values(adminLogsData).returning();
    console.log(`Created ${insertedAdminLogs.length} admin log entries`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${demoUsers.length} users (including 1 admin)`);
    console.log(`- ${insertedTours.length} tours`);
    console.log(`- ${insertedBookings.length} bookings`);
    console.log(`- ${insertedReviews.length} reviews`);
    console.log(`- ${insertedWishlists.length} wishlist items`);
    console.log(`- ${insertedAdminLogs.length} admin log entries`);
    
    console.log('\n🔑 Demo Credentials:');
    console.log('Admin: admin@travelagency.com / admin123');
    console.log('User: john.doe@example.com / password123');
    console.log('User: jane.smith@example.com / password123');
    
    console.log('\n📸 Note: All images use placeholder URLs (/api/placeholder/400/300)');
    console.log('You can update these with real image URLs in the database.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
