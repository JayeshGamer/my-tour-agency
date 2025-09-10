# Stripe Checkout Setup Instructions

## ⚠️ IMPORTANT: TEST MODE ONLY

**This implementation operates in Stripe test mode and will NOT process real payments or charge real money. This is a demonstration system for development and testing purposes only.**

- ✅ Simulates payment flows and UI
- ✅ Creates booking records in database
- ❌ No real money transactions
- ❌ No actual payment processing
- ❌ Cards are not charged

## Prerequisites
1. Create a Stripe account at https://dashboard.stripe.com
2. Get your **TEST** API keys from https://dashboard.stripe.com/test/apikeys

## Environment Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Stripe keys to `.env.local`:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"
   STRIPE_SECRET_KEY="sk_test_your_secret_key_here"
   ```

## Testing the Checkout

### 🗺️ Test Mode Verification

To confirm you're in test mode:
1. Check that your publishable key starts with `pk_test_`
2. Look for "TEST MODE" indicators in the Stripe dashboard
3. Notice the test mode warnings in the checkout UI

### Test Card Numbers
**IMPORTANT**: These are test cards that simulate different scenarios but process NO REAL MONEY:

- **Successful Payment**: `4242424242424242`
- **Payment Declined**: `4000000000000002`
- **Requires Authentication**: `4000002500003155`
- **Insufficient Funds**: `4000000000009995`

### Test Details (Any Values Work):
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)
- **Name**: Any name

## Available Coupon Codes

Test these coupon codes in the checkout:

- `WELCOME10` - 10% off any order
- `SAVE100` - $100 off orders over $500
- `SUMMER20` - 20% off orders over $300
- `NEWUSER` - $50 off orders over $200

## Checkout Flow

1. Browse tours at `/tours`
2. Click "Book Now" on any tour
3. Select date and options
4. Click "Book Now" to go to checkout
5. Review booking details
6. Add coupon code (optional)
7. Fill in payment details
8. Complete payment

## Features Implemented

✅ **Desktop-Only Responsive Design**
✅ **Pre-filled User Information** (name, email from session)
✅ **Booking Summary** with tour details and pricing breakdown
✅ **Coupon System** with validation and discount calculation
✅ **Stripe Payment Integration** with CardElement
✅ **Payment Intent Creation** and confirmation
✅ **Booking Creation** in database after successful payment
✅ **Error Handling** for payment failures
✅ **Loading States** and user feedback
✅ **Security Notice** and payment method logos

## Database Schema

The checkout creates records in the `bookings` table with:
- User ID (from session)
- Tour ID
- Number of people
- Total price
- Start date
- Payment Intent ID from Stripe
- Booking status ('Confirmed')

## API Endpoints

- `POST /api/checkout` - Complete booking after payment
- `POST /api/checkout/create-payment-intent` - Create Stripe payment intent
- `POST /api/checkout/apply-coupon` - Validate and apply coupon codes
