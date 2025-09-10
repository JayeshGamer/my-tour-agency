import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('=============================================');
console.log('🧪 TOUR DETAILS PAGE TEST URLS');
console.log('=============================================\n');

console.log('✅ Server should be running at: http://localhost:3000\n');

console.log('📍 Test these URLs to see tour details:\n');

const tourUrls = [
  { name: 'Everest Base Camp Trek', url: 'http://localhost:3000/tours/650e8400-e29b-41d4-a716-446655440101' },
  { name: 'Santorini Island Escape', url: 'http://localhost:3000/tours/650e8400-e29b-41d4-a716-446655440102' },
  { name: 'Japanese Cultural Journey', url: 'http://localhost:3000/tours/650e8400-e29b-41d4-a716-446655440103' },
  { name: 'Serengeti Safari Adventure', url: 'http://localhost:3000/tours/650e8400-e29b-41d4-a716-446655440104' },
];

tourUrls.forEach((tour, index) => {
  console.log(`${index + 1}. ${tour.name}:`);
  console.log(`   ${tour.url}\n`);
});

console.log('📋 What to check on each page:');
console.log('   ✓ Header and navigation');
console.log('   ✓ Image gallery with thumbnails');
console.log('   ✓ Tour name and details');
console.log('   ✓ Price and duration');
console.log('   ✓ Booking section with date selection');
console.log('   ✓ What\'s included/not included');
console.log('   ✓ Full itinerary');
console.log('   ✓ Customer reviews section');
console.log('   ✓ Related tours');
console.log('   ✓ Footer');

console.log('\n=============================================');
