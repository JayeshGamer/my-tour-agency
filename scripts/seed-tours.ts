import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { tours } from '../lib/db/schema';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const sampleTours = [
  {
    name: 'Everest Base Camp Trek',
    title: 'Everest Base Camp Trek',
    description: 'Experience the ultimate adventure with our guided trek to Everest Base Camp. This challenging yet rewarding journey takes you through stunning Himalayan landscapes, traditional Sherpa villages, and offers breathtaking views of the world\'s highest peaks.',
    location: 'Nepal, Himalayas',
    duration: 14,
    pricePerPerson: '2999.00',
    price: '2999.00',
    category: 'Adventure',
    difficulty: 'Hard',
    maxGroupSize: 12,
    imageUrl: '/images/tours/everest-trek.jpg',
    images: ['/images/tours/everest-trek.jpg'],
    status: 'Active' as const,
    startDates: ['2024-03-15', '2024-04-15', '2024-05-15', '2024-09-15', '2024-10-15'],
    included: ['Professional guide', 'Accommodation', 'All meals', 'Permits', 'Porter service'],
    notIncluded: ['International flights', 'Personal equipment', 'Insurance', 'Tips'],
    itinerary: [
      { day: 1, title: 'Arrival in Kathmandu', description: 'Meet your guide and final preparations' },
      { day: 2, title: 'Flight to Lukla', description: 'Scenic mountain flight and trek to Phakding' },
      { day: 3, title: 'Trek to Namche Bazaar', description: 'Enter Sagarmatha National Park' }
    ],
    featured: true
  },
  {
    name: 'Machu Picchu Explorer',
    title: 'Machu Picchu Explorer',
    description: 'Discover the mysteries of the ancient Inca civilization with our comprehensive Machu Picchu tour. Visit the Sacred Valley, explore traditional markets, and witness the sunrise over the iconic ruins.',
    location: 'Peru, Cusco',
    duration: 7,
    pricePerPerson: '1899.00',
    price: '1899.00',
    category: 'Cultural',
    difficulty: 'Moderate',
    maxGroupSize: 16,
    imageUrl: '/images/tours/machu-picchu.jpg',
    images: ['/images/tours/machu-picchu.jpg'],
    status: 'Active' as const,
    startDates: ['2024-04-01', '2024-05-01', '2024-06-01', '2024-08-01', '2024-09-01'],
    included: ['Expert guide', 'Accommodation', 'Train tickets', 'Entrance fees', 'Some meals'],
    notIncluded: ['International flights', 'All meals', 'Personal expenses', 'Tips'],
    itinerary: [
      { day: 1, title: 'Arrival in Cusco', description: 'City tour and acclimatization' },
      { day: 2, title: 'Sacred Valley', description: 'Pisac market and Ollantaytambo' },
      { day: 3, title: 'Machu Picchu', description: 'Early morning train and guided tour' }
    ],
    featured: true
  },
  {
    name: 'Iceland Northern Lights',
    title: 'Iceland Northern Lights Adventure',
    description: 'Chase the magical Northern Lights across Iceland\'s dramatic landscapes. Visit glaciers, geysers, and hot springs while enjoying the best chances to see the Aurora Borealis.',
    location: 'Iceland, Reykjavik',
    duration: 8,
    pricePerPerson: '2499.00',
    price: '2499.00',
    category: 'Nature',
    difficulty: 'Easy',
    maxGroupSize: 20,
    imageUrl: '/images/tours/iceland.jpg',
    images: ['/images/tours/iceland.jpg'],
    status: 'Active' as const,
    startDates: ['2024-11-01', '2024-12-01', '2025-01-01', '2025-02-01', '2025-03-01'],
    included: ['Professional guide', 'Accommodation', 'Transportation', 'Northern Lights tours'],
    notIncluded: ['Flights', 'Most meals', 'Optional activities', 'Personal expenses'],
    itinerary: [
      { day: 1, title: 'Arrival in Reykjavik', description: 'City exploration and preparation' },
      { day: 2, title: 'Golden Circle', description: 'Geysir, Gullfoss, and Thingvellir' },
      { day: 3, title: 'Northern Lights Hunt', description: 'Evening aurora viewing expedition' }
    ],
    featured: true
  },
  {
    name: 'Santorini Sunset Romance',
    title: 'Santorini Sunset Romance',
    description: 'Experience the romance of Greece with stunning sunsets, white-washed villages, and crystal-clear waters. Perfect for couples seeking a magical getaway.',
    location: 'Greece, Santorini',
    duration: 5,
    pricePerPerson: '1699.00',
    price: '1699.00',
    category: 'Romance',
    difficulty: 'Easy',
    maxGroupSize: 14,
    imageUrl: '/images/tours/santorini.jpg',
    images: ['/images/tours/santorini.jpg'],
    status: 'Active' as const,
    startDates: ['2024-05-15', '2024-06-15', '2024-07-15', '2024-08-15', '2024-09-15'],
    included: ['Luxury accommodation', 'Private transfers', 'Wine tasting', 'Sunset cruise'],
    notIncluded: ['Flights', 'All meals', 'Personal expenses', 'Optional activities'],
    itinerary: [
      { day: 1, title: 'Arrival & Fira', description: 'Explore the capital and caldera views' },
      { day: 2, title: 'Oia Village', description: 'Famous sunset viewpoint and shopping' },
      { day: 3, title: 'Wine Tour', description: 'Visit local wineries and beaches' }
    ],
    featured: false
  },
  {
    name: 'Japan Cultural Journey',
    title: 'Japan Cultural Journey',
    description: 'Immerse yourself in Japan\'s rich culture, from ancient temples to modern cities. Experience traditional tea ceremonies, stay in ryokans, and witness cherry blossoms.',
    location: 'Japan, Tokyo & Kyoto',
    duration: 12,
    pricePerPerson: '3499.00',
    price: '3499.00',
    category: 'Cultural',
    difficulty: 'Easy',
    maxGroupSize: 18,
    imageUrl: '/images/tours/japan.jpg',
    images: ['/images/tours/japan.jpg'],
    status: 'Active' as const,
    startDates: ['2024-03-20', '2024-04-05', '2024-10-10', '2024-11-15'],
    included: ['Expert guide', 'Accommodation', 'JR Pass', 'Some meals', 'Cultural activities'],
    notIncluded: ['International flights', 'All meals', 'Personal expenses', 'Visa fees'],
    itinerary: [
      { day: 1, title: 'Tokyo Arrival', description: 'Welcome dinner and orientation' },
      { day: 2, title: 'Tokyo Sights', description: 'Senso-ji Temple, Meiji Shrine' },
      { day: 3, title: 'Tokyo to Kyoto', description: 'Bullet train experience' }
    ],
    featured: false
  }
];

async function seedTours() {
  try {
    console.log('Seeding tours...');
    
    for (const tour of sampleTours) {
      await db.insert(tours).values(tour);
      console.log(`Added tour: ${tour.name}`);
    }
    
    console.log('Tours seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding tours:', error);
  }
}

// Run the seeding function
seedTours();