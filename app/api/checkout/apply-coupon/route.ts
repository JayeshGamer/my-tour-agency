import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';

// Mock coupon data - in a real app, this would come from a database
const COUPONS = {
  'WELCOME10': { discount: 0.10, type: 'percentage', minAmount: 0 },
  'SAVE100': { discount: 100, type: 'fixed', minAmount: 500 },
  'SUMMER20': { discount: 0.20, type: 'percentage', minAmount: 300 },
  'NEWUSER': { discount: 50, type: 'fixed', minAmount: 200 },
} as const;

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { couponCode, subtotal } = body;

    if (!couponCode || !subtotal) {
      return NextResponse.json(
        { error: 'Coupon code and subtotal are required' },
        { status: 400 }
      );
    }

    const coupon = COUPONS[couponCode.toUpperCase() as keyof typeof COUPONS];

    if (!coupon) {
      return NextResponse.json(
        { error: 'Invalid coupon code' },
        { status: 400 }
      );
    }

    if (subtotal < coupon.minAmount) {
      return NextResponse.json(
        { error: `Minimum order amount of $${coupon.minAmount} required for this coupon` },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = subtotal * coupon.discount;
    } else {
      discount = coupon.discount;
    }

    // Ensure discount doesn't exceed subtotal
    discount = Math.min(discount, subtotal);

    return NextResponse.json({
      success: true,
      discount: parseFloat(discount.toFixed(2)),
      couponCode: couponCode.toUpperCase(),
      type: coupon.type,
    });

  } catch (error) {
    console.error('Coupon API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
