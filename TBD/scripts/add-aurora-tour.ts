import * as dotenv from 'dotenv';

// Load environment variables BEFORE any other imports
dotenv.config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../src/lib/db/schema';

// Create direct database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Custom tour data - Aurora Borealis Photography Workshop in Iceland
const customTourData = {
  name: "Aurora Borealis Photography Workshop",
  title: "Capture the Northern Lights - Professional Photography Expedition",
  description: "Join our expert photographers on an extraordinary journey to capture the mesmerizing Aurora Borealis in Iceland's pristine wilderness. This specialized workshop combines advanced night photography techniques with breathtaking natural phenomena. Learn from award-winning astrophotographers while staying in carefully selected locations with optimal northern lights visibility. Perfect for photographers seeking to master aurora photography and create stunning portfolio pieces.",
  location: "Reykjavik & South Coast, Iceland",
  duration: 8,
  pricePerPerson: "85000.00", // ₹85,000 for premium experience
  price: "85000.00",
  category: "Photography",
  difficulty: "Moderate",
  maxGroupSize: 6, // Small group for personalized instruction
  imageUrl: "/images/tours/iceland.jpg",
  images: ["/images/tours/iceland.jpg", "/placeholder-tour.svg"],
  status: 'Inactive' as const, // Pending approval
  startDates: [
    "2025-11-15", // Peak aurora season
    "2025-12-01",
    "2025-12-15",
    "2026-01-05",
    "2026-01-20",
    "2026-02-01"
  ],
  included: [
    "Professional aurora photography guide",
    "Specialized night photography equipment rental",
    "4-star accommodation in Reykjavik (4 nights)",
    "Unique aurora hunting locations access",
    "All ground transportation in modified 4WD vehicles",
    "Hot drinks and snacks during night shoots",
    "Photo editing workshop and techniques session",
    "Emergency weather backup indoor activities",
    "Northern lights prediction app and tools training"
  ],
  notIncluded: [
    "International flights to Reykjavik",
    "Personal camera equipment (can be rented)",
    "Meals not specified in itinerary",
    "Travel insurance",
    "Personal expenses and souvenirs",
    "Alcoholic beverages",
    "Optional helicopter tour (available for booking)"
  ],
  itinerary: [
    {
      day: 1,
      title: "Arrival & Equipment Orientation",
      description: "Arrive in Reykjavik, meet your professional photography team. Equipment check and night photography basics workshop. Review aurora forecasting tools and plan first shoot location based on weather conditions."
    },
    {
      day: 2,
      title: "South Coast Aurora Hunt - Jokulsarlon Glacier Lagoon",
      description: "Travel to the famous Jokulsarlon glacier lagoon for our first aurora shoot. Learn advanced camera settings for northern lights photography with icebergs as foreground elements. Return late night after successful aurora capture session."
    },
    {
      day: 3,
      title: "Seljalandsfoss & Skogafoss Aurora Photography",
      description: "Explore Iceland's most photogenic waterfalls during golden hour, then position for aurora photography with waterfall foregrounds. Master long exposure techniques combining flowing water and northern lights."
    },
    {
      day: 4,
      title: "Thingvellir National Park & Advanced Techniques",
      description: "Aurora photography in the historic Thingvellir rift valley. Learn composition techniques using geological features. Advanced post-processing workshop covering aurora enhancement and noise reduction."
    },
    {
      day: 5,
      title: "Reykjanes Peninsula & Lighthouse Aurora Shots",
      description: "Explore rugged coastal landscapes for dramatic aurora compositions. Practice shooting near lighthouses and coastal rock formations. Weather backup: visit geothermal areas and Blue Lagoon."
    },
    {
      day: 6,
      title: "Golden Circle & Secret Aurora Locations",
      description: "Visit Geysir and Gullfoss during day, then access exclusive aurora viewing locations away from light pollution. Final night shoot focusing on perfecting techniques learned throughout the workshop."
    },
    {
      day: 7,
      title: "Photo Review & Portfolio Development",
      description: "Comprehensive photo review session with professional feedback. Learn advanced editing techniques in Lightroom and Photoshop specific to aurora photography. Portfolio planning and print preparation workshop."
    },
    {
      day: 8,
      title: "Departure & Final Sunrise Shoot",
      description: "Optional early morning sunrise shoot at Perlan observation deck overlooking Reykjavik. Final equipment return, portfolio USB delivery, and departure assistance to Keflavik Airport."
    }
  ],
  featured: false
};

async function createCustomTour() {
  try {
    console.log('🚀 Creating custom Aurora Borealis Photography Workshop...');

    // Insert the custom tour
    const newTour = await db.insert(schema.tours).values(customTourData).returning();

    console.log('✅ Custom tour created successfully!');
    console.log('📋 Tour Details:');
    console.log(`   - ID: ${newTour[0].id}`);
    console.log(`   - Name: ${newTour[0].name}`);
    console.log(`   - Location: ${newTour[0].location}`);
    console.log(`   - Duration: ${newTour[0].duration} days`);
    console.log(`   - Price: ₹${newTour[0].pricePerPerson} per person`);
    console.log(`   - Status: ${newTour[0].status} (Pending Admin Approval)`);

    // Create admin notification for the new tour submission
    const notification = await db.insert(schema.notifications).values({
      title: 'New Custom Tour: Aurora Photography Workshop',
      message: `A premium Aurora Borealis Photography Workshop tour has been submitted and requires admin approval. This specialized photography tour offers unique northern lights experiences in Iceland.`,
      type: 'tour_submission',
      priority: 'high', // High priority due to premium nature
      relatedEntityType: 'tour',
      relatedEntityId: newTour[0].id,
      metadata: {
        tourName: customTourData.name,
        location: customTourData.location,
        pricePerPerson: customTourData.pricePerPerson,
        category: customTourData.category,
        submissionType: 'automated_custom_tour'
      }
    }).returning();

    console.log('📢 Admin notification created:');
    console.log(`   - Notification ID: ${notification[0].id}`);
    console.log(`   - Type: ${notification[0].type}`);
    console.log(`   - Priority: ${notification[0].priority}`);

    console.log('\n🎯 Next Steps:');
    console.log('   1. Admin can review the tour in the admin panel');
    console.log('   2. Once approved, the tour will be available for booking');
    console.log('   3. Users can see the tour in the tours listing');

    return newTour[0];

  } catch (error) {
    console.error('❌ Error creating custom tour:', error);
    throw error;
  }
}

// Execute the tour creation
createCustomTour()
  .then(() => {
    console.log('🎉 Custom tour creation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to create custom tour:', error);
    process.exit(1);
  });
