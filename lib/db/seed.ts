import * as dotenv from 'dotenv';
// Load environment variables FIRST
dotenv.config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, tours, bookings, reviews, wishlists, adminLogs } from './schema';
import * as bcrypt from 'bcryptjs';
import * as schema from './schema';

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
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'admin@travelagency.com',
        firstName: 'Admin',
        lastName: 'User',
        name: 'Admin User',
        passwordHash: await bcrypt.hash('admin123', 10),
        role: 'Admin' as const,
        emailVerified: true,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'User' as const,
        emailVerified: true,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        name: 'Jane Smith',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'User' as const,
        emailVerified: true,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        email: 'mike.wilson@example.com',
        firstName: 'Mike',
        lastName: 'Wilson',
        name: 'Mike Wilson',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'User' as const,
        emailVerified: true,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
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
        id: '650e8400-e29b-41d4-a716-446655440101',
        name: 'Everest Base Camp Trek',
        title: 'Everest Base Camp Trek - Ultimate Himalayan Adventure',
        description: 'Experience the ultimate Himalayan adventure with our 14-day trek to Everest Base Camp. Walk in the footsteps of legendary mountaineers and witness breathtaking views of the world\'s highest peaks.',
        location: 'Nepal',
        duration: 14,
        pricePerPerson: '2999.00',
        price: '2999.00',
        category: 'Adventure',
        difficulty: 'Difficult',
        maxGroupSize: 12,
        imageUrl: '/images/tours/everest-trek.jpg',
        images: ['/images/tours/everest-1.jpg', '/images/tours/everest-2.jpg', '/images/tours/everest-3.jpg'],
        status: 'Active' as const,
        startDates: ['2024-03-15', '2024-04-10', '2024-05-01', '2024-09-15', '2024-10-01'],
        included: ['Professional guide', 'All meals during trek', 'Accommodation in tea houses', 'Permits and fees', 'Airport transfers'],
        notIncluded: ['International flights', 'Travel insurance', 'Personal equipment', 'Tips for guides'],
        itinerary: [
          { day: 1, title: 'Fly to Lukla, Trek to Phakding', description: 'Scenic flight to Lukla followed by easy trek to Phakding' },
          { day: 2, title: 'Trek to Namche Bazaar', description: 'Cross suspension bridges and climb to the Sherpa capital' },
          { day: 3, title: 'Acclimatization Day', description: 'Explore Namche and hike to Everest View Hotel' },
          { day: 4, title: 'Trek to Tengboche', description: 'Visit the famous Tengboche Monastery' },
          { day: 5, title: 'Trek to Dingboche', description: 'Walk through rhododendron forests to Dingboche' },
        ],
        featured: true,
      },
      {
        id: '650e8400-e29b-41d4-a716-446655440102',
        name: 'Santorini Island Escape',
        title: 'Santorini Island Escape - Greek Paradise',
        description: 'Discover the magic of Santorini with its stunning sunsets, white-washed buildings, and crystal-clear waters. This 7-day escape offers the perfect blend of relaxation and exploration.',
        location: 'Greece',
        duration: 7,
        pricePerPerson: '1899.00',
        price: '1899.00',
        category: 'Beach',
        difficulty: 'Easy',
        maxGroupSize: 20,
        imageUrl: '/images/tours/santorini.jpg',
        images: ['/images/tours/santorini-1.jpg', '/images/tours/santorini-2.jpg', '/images/tours/santorini-3.jpg'],
        status: 'Active' as const,
        startDates: ['2024-05-01', '2024-06-15', '2024-07-01', '2024-08-15', '2024-09-01'],
        included: ['Boutique hotel accommodation', 'Daily breakfast', 'Island hopping tour', 'Wine tasting tour', 'Airport transfers'],
        notIncluded: ['International flights', 'Lunch and dinner', 'Personal expenses'],
        itinerary: [
          { day: 1, title: 'Arrival in Santorini', description: 'Check-in and sunset viewing in Oia' },
          { day: 2, title: 'Caldera Cruise', description: 'Full day sailing around the caldera' },
          { day: 3, title: 'Wine Tasting Tour', description: 'Visit local wineries and vineyards' },
          { day: 4, title: 'Beach Day', description: 'Relax at Red Beach and Kamari Beach' },
        ],
        featured: true,
      },
      {
        id: '650e8400-e29b-41d4-a716-446655440103',
        name: 'Japanese Cultural Journey',
        title: 'Japanese Cultural Journey - Ancient Meets Modern',
        description: 'Immerse yourself in the fascinating culture of Japan. From ancient temples in Kyoto to the neon lights of Tokyo, experience the perfect harmony of tradition and innovation.',
        location: 'Japan',
        duration: 10,
        pricePerPerson: '3299.00',
        price: '3299.00',
        category: 'Cultural',
        difficulty: 'Easy',
        maxGroupSize: 15,
        imageUrl: '/images/tours/japan.jpg',
        images: ['/images/tours/japan-1.jpg', '/images/tours/japan-2.jpg', '/images/tours/japan-3.jpg'],
        status: 'Active' as const,
        startDates: ['2024-03-20', '2024-04-05', '2024-10-15', '2024-11-01'],
        included: ['4-star hotel accommodation', 'Japan Rail Pass', 'Guided temple tours', 'Traditional tea ceremony', 'Breakfast'],
        notIncluded: ['International flights', 'Most meals', 'Personal expenses'],
        itinerary: [
          { day: 1, title: 'Arrival in Tokyo', description: 'Check-in and explore Shibuya' },
          { day: 2, title: 'Tokyo Highlights', description: 'Visit Senso-ji Temple and Tokyo Skytree' },
          { day: 3, title: 'Mount Fuji Day Trip', description: 'Visit Mt. Fuji 5th Station' },
          { day: 4, title: 'Travel to Kyoto', description: 'Bullet train to Kyoto' },
          { day: 5, title: 'Kyoto Temples', description: 'Visit Fushimi Inari and Kinkaku-ji' },
        ],
        featured: true,
      },
      {
        id: '650e8400-e29b-41d4-a716-446655440104',
        name: 'Serengeti Safari Adventure',
        title: 'Serengeti Safari Adventure - Wildlife Paradise',
        description: 'Witness the incredible wildlife of Tanzania on this 8-day safari adventure. Experience the Great Migration, spot the Big Five, and stay in luxury safari lodges.',
        location: 'Tanzania',
        duration: 8,
        pricePerPerson: '4299.00',
        price: '4299.00',
        category: 'Wildlife',
        difficulty: 'Moderate',
        maxGroupSize: 10,
        imageUrl: '/images/tours/serengeti.jpg',
        images: ['/images/tours/serengeti-1.jpg', '/images/tours/serengeti-2.jpg', '/images/tours/serengeti-3.jpg'],
        status: 'Active' as const,
        startDates: ['2024-06-01', '2024-07-15', '2024-08-01', '2024-09-15'],
        included: ['Luxury lodge accommodation', 'All meals', 'Game drives', 'Park fees', 'Professional guides'],
        notIncluded: ['International flights', 'Visas', 'Travel insurance', 'Tips'],
        itinerary: [
          { day: 1, title: 'Arrival in Arusha', description: 'Meet and greet, transfer to hotel' },
          { day: 2, title: 'Tarangire National Park', description: 'Full day game drive' },
          { day: 3, title: 'Serengeti National Park', description: 'Enter the endless plains' },
          { day: 4, title: 'Serengeti Full Day', description: 'Follow the Great Migration' },
        ],
        featured: false,
      },
      {
        id: '650e8400-e29b-41d4-a716-446655440105',
        name: 'Machu Picchu Discovery',
        title: 'Machu Picchu Discovery - Inca Trail Adventure',
        description: 'Trek the legendary Inca Trail to Machu Picchu. This 6-day adventure combines stunning mountain scenery with fascinating Incan history.',
        location: 'Peru',
        duration: 6,
        pricePerPerson: '1799.00',
        price: '1799.00',
        category: 'Adventure',
        difficulty: 'Moderate',
        maxGroupSize: 12,
        imageUrl: '/images/tours/machu-picchu.jpg',
        images: ['/images/tours/machu-picchu-1.jpg', '/images/tours/machu-picchu-2.jpg'],
        status: 'Active' as const,
        startDates: ['2024-04-01', '2024-05-15', '2024-09-01', '2024-10-15'],
        included: ['Camping equipment', 'Meals during trek', 'Professional guides', 'Porters', 'Train tickets'],
        notIncluded: ['International flights', 'Sleeping bag', 'Tips', 'Personal expenses'],
        itinerary: [
          { day: 1, title: 'Cusco to Wayllabamba', description: 'Start the Inca Trail trek' },
          { day: 2, title: 'Cross Dead Woman\'s Pass', description: 'Highest point of the trek' },
          { day: 3, title: 'Explore Ancient Ruins', description: 'Visit multiple Inca sites' },
          { day: 4, title: 'Sun Gate to Machu Picchu', description: 'Sunrise arrival at Machu Picchu' },
        ],
        featured: false,
      },
      {
        id: '650e8400-e29b-41d4-a716-446655440106',
        name: 'Northern Lights Iceland',
        title: 'Northern Lights Iceland - Arctic Wonder',
        description: 'Chase the Northern Lights across Iceland\'s stunning winter landscape. Experience geothermal hot springs, glaciers, and the magical Aurora Borealis.',
        location: 'Iceland',
        duration: 5,
        pricePerPerson: '2299.00',
        price: '2299.00',
        category: 'Adventure',
        difficulty: 'Easy',
        maxGroupSize: 15,
        imageUrl: '/images/tours/iceland.jpg',
        images: ['/images/tours/iceland-1.jpg', '/images/tours/iceland-2.jpg'],
        status: 'Active' as const,
        startDates: ['2024-11-15', '2024-12-01', '2025-01-15', '2025-02-01'],
        included: ['Hotel accommodation', 'Northern Lights tours', 'Blue Lagoon entry', 'Breakfast', 'Transportation'],
        notIncluded: ['International flights', 'Lunch and dinner', 'Winter clothing rental'],
        itinerary: [
          { day: 1, title: 'Arrival in Reykjavik', description: 'City tour and welcome dinner' },
          { day: 2, title: 'Golden Circle Tour', description: 'Visit Geysir, Gullfoss, and Thingvellir' },
          { day: 3, title: 'South Coast Adventure', description: 'Black sand beaches and waterfalls' },
          { day: 4, title: 'Northern Lights Hunt', description: 'Evening aurora hunting tour' },
        ],
        featured: true,
      },
      {
        id: '650e8400-e29b-41d4-a716-446655440107',
        name: 'Dubai Luxury Experience',
        title: 'Dubai Luxury Experience - Modern Arabian Nights',
        description: 'Experience the height of luxury in Dubai. From world-class shopping to desert safaris, enjoy the perfect blend of modern glamour and Arabian tradition.',
        location: 'UAE',
        duration: 6,
        pricePerPerson: '2599.00',
        price: '2599.00',
        category: 'Luxury',
        difficulty: 'Easy',
        maxGroupSize: 20,
        imageUrl: '/images/tours/dubai.jpg',
        images: ['/images/tours/dubai-1.jpg', '/images/tours/dubai-2.jpg'],
        status: 'Active' as const,
        startDates: ['2024-03-01', '2024-11-15', '2024-12-20', '2025-01-10'],
        included: ['5-star hotel', 'Desert safari', 'Dhow cruise dinner', 'Burj Khalifa tickets', 'Airport transfers'],
        notIncluded: ['International flights', 'Meals except specified', 'Shopping expenses'],
        itinerary: [
          { day: 1, title: 'Arrival in Dubai', description: 'Check-in to luxury hotel' },
          { day: 2, title: 'City Tour', description: 'Visit Burj Khalifa and Dubai Mall' },
          { day: 3, title: 'Desert Safari', description: 'Dune bashing and Bedouin dinner' },
          { day: 4, title: 'Palm Jumeirah', description: 'Explore the Palm and Atlantis' },
        ],
        featured: false,
      },
      {
        id: '650e8400-e29b-41d4-a716-446655440108',
        name: 'Amazon Rainforest Expedition',
        title: 'Amazon Rainforest Expedition - Nature\'s Paradise',
        description: 'Explore the world\'s largest rainforest on this immersive 7-day expedition. Discover incredible biodiversity, meet indigenous communities, and navigate the mighty Amazon River.',
        location: 'Brazil',
        duration: 7,
        pricePerPerson: '2199.00',
        price: '2199.00',
        category: 'Wildlife',
        difficulty: 'Moderate',
        maxGroupSize: 12,
        imageUrl: '/images/tours/amazon.jpg',
        images: ['/images/tours/amazon-1.jpg', '/images/tours/amazon-2.jpg'],
        status: 'Active' as const,
        startDates: ['2024-04-15', '2024-06-01', '2024-08-15', '2024-10-01'],
        included: ['Eco-lodge accommodation', 'All meals', 'Guided jungle walks', 'Boat excursions', 'Wildlife spotting'],
        notIncluded: ['International flights', 'Vaccinations', 'Personal equipment'],
        itinerary: [
          { day: 1, title: 'Arrival in Manaus', description: 'Transfer to jungle lodge' },
          { day: 2, title: 'Jungle Trek', description: 'Learn about medicinal plants' },
          { day: 3, title: 'River Expedition', description: 'Piranha fishing and dolphin watching' },
          { day: 4, title: 'Indigenous Village', description: 'Cultural exchange experience' },
        ],
        featured: false,
      },
    ];

    const insertedTours = await db.insert(tours).values(toursData).returning();
    console.log(`Created ${insertedTours.length} tours`);

    // Create bookings
    console.log('Creating bookings...');
    const bookingsData = [
      {
        userId: '550e8400-e29b-41d4-a716-446655440002',
        tourId: '650e8400-e29b-41d4-a716-446655440101',
        numberOfPeople: 2,
        totalPrice: '5998.00',
        startDate: new Date('2024-03-15'),
        bookingDate: new Date('2024-01-15'),
        status: 'Confirmed' as const,
      },
      {
        userId: '550e8400-e29b-41d4-a716-446655440003',
        tourId: '650e8400-e29b-41d4-a716-446655440102',
        numberOfPeople: 2,
        totalPrice: '3798.00',
        startDate: new Date('2024-05-01'),
        bookingDate: new Date('2024-02-20'),
        status: 'Confirmed' as const,
      },
      {
        userId: '550e8400-e29b-41d4-a716-446655440004',
        tourId: '650e8400-e29b-41d4-a716-446655440103',
        numberOfPeople: 1,
        totalPrice: '3299.00',
        startDate: new Date('2024-04-05'),
        bookingDate: new Date('2024-02-01'),
        status: 'Pending' as const,
      },
      {
        userId: '550e8400-e29b-41d4-a716-446655440002',
        tourId: '650e8400-e29b-41d4-a716-446655440104',
        numberOfPeople: 2,
        totalPrice: '8598.00',
        startDate: new Date('2024-07-15'),
        bookingDate: new Date('2024-03-10'),
        status: 'Confirmed' as const,
      },
      {
        userId: '550e8400-e29b-41d4-a716-446655440005',
        tourId: '650e8400-e29b-41d4-a716-446655440106',
        numberOfPeople: 3,
        totalPrice: '6897.00',
        startDate: new Date('2024-12-01'),
        bookingDate: new Date('2024-09-15'),
        status: 'Pending' as const,
      },
    ];

    const insertedBookings = await db.insert(bookings).values(bookingsData).returning();
    console.log(`Created ${insertedBookings.length} bookings`);

    // Create reviews
    console.log('Creating reviews...');
    const reviewsData = [
      {
        userId: '550e8400-e29b-41d4-a716-446655440002',
        tourId: '650e8400-e29b-41d4-a716-446655440101',
        rating: 5,
        title: 'Trip of a Lifetime!',
        comment: 'The Everest Base Camp trek was absolutely incredible. Our guide was knowledgeable and the views were breathtaking. The accommodation was basic but clean, and the food was better than expected. Highly recommend!',
        bookingId: insertedBookings[0].id,
      },
      {
        userId: '550e8400-e29b-41d4-a716-446655440003',
        tourId: '650e8400-e29b-41d4-a716-446655440102',
        rating: 5,
        title: 'Perfect Greek Getaway',
        comment: 'Santorini exceeded all expectations. The hotel was stunning with amazing caldera views. The wine tasting tour was a highlight, and watching the sunset from Oia was magical. Will definitely book with this agency again!',
        bookingId: insertedBookings[1].id,
      },
      {
        userId: '550e8400-e29b-41d4-a716-446655440004',
        tourId: '650e8400-e29b-41d4-a716-446655440103',
        rating: 4,
        title: 'Amazing Cultural Experience',
        comment: 'Japan was fascinating! The mix of ancient and modern was incredible. The rail pass made travel easy, and our guide was very helpful. Only downside was that some days felt a bit rushed. Overall, great experience!',
      },
      {
        userId: '550e8400-e29b-41d4-a716-446655440002',
        tourId: '650e8400-e29b-41d4-a716-446655440104',
        rating: 5,
        title: 'Safari Dreams Come True',
        comment: 'Seeing the Great Migration was a bucket list item and it did not disappoint! We saw all of the Big Five and the lodges were luxurious. The guides were incredibly knowledgeable about the wildlife. Worth every penny!',
        bookingId: insertedBookings[3].id,
      },
      {
        userId: '550e8400-e29b-41d4-a716-446655440005',
        tourId: '650e8400-e29b-41d4-a716-446655440101',
        rating: 4,
        title: 'Challenging but Rewarding',
        comment: 'The trek was tougher than I expected but the views made it all worthwhile. Altitude sickness was a real challenge for some in our group. Make sure you\'re in good physical condition before attempting this trek.',
      },
      {
        userId: '550e8400-e29b-41d4-a716-446655440003',
        tourId: '650e8400-e29b-41d4-a716-446655440103',
        rating: 5,
        title: 'Japan is Incredible',
        comment: 'Everything about this tour was perfect. From the efficient organization to the cultural experiences, it was all top-notch. The cherry blossoms were in full bloom during our visit which made it extra special!',
      },
    ];

    const insertedReviews = await db.insert(reviews).values(reviewsData).returning();
    console.log(`Created ${insertedReviews.length} reviews`);

    // Create wishlists
    console.log('Creating wishlists...');
    const wishlistsData = [
      { userId: '550e8400-e29b-41d4-a716-446655440002', tourId: '650e8400-e29b-41d4-a716-446655440105' },
      { userId: '550e8400-e29b-41d4-a716-446655440002', tourId: '650e8400-e29b-41d4-a716-446655440106' },
      { userId: '550e8400-e29b-41d4-a716-446655440003', tourId: '650e8400-e29b-41d4-a716-446655440101' },
      { userId: '550e8400-e29b-41d4-a716-446655440003', tourId: '650e8400-e29b-41d4-a716-446655440107' },
      { userId: '550e8400-e29b-41d4-a716-446655440004', tourId: '650e8400-e29b-41d4-a716-446655440108' },
      { userId: '550e8400-e29b-41d4-a716-446655440005', tourId: '650e8400-e29b-41d4-a716-446655440102' },
      { userId: '550e8400-e29b-41d4-a716-446655440005', tourId: '650e8400-e29b-41d4-a716-446655440103' },
    ];

    const insertedWishlists = await db.insert(wishlists).values(wishlistsData).returning();
    console.log(`Created ${insertedWishlists.length} wishlist items`);

    // Create admin logs
    console.log('Creating admin logs...');
    const adminLogsData = [
      {
        adminId: '550e8400-e29b-41d4-a716-446655440001',
        action: 'Approved booking for Everest Base Camp Trek',
        affectedEntity: 'Booking',
        entityId: insertedBookings[0].id,
      },
      {
        adminId: '550e8400-e29b-41d4-a716-446655440001',
        action: 'Updated tour status to Active',
        affectedEntity: 'Tour',
        entityId: '650e8400-e29b-41d4-a716-446655440101',
      },
      {
        adminId: '550e8400-e29b-41d4-a716-446655440001',
        action: 'Confirmed booking payment received',
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
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
