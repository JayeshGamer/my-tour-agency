import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { db } from '@/lib/db';
import { coupons } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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

    // Fetch coupon from database
    const couponData = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, couponCode.toUpperCase()))
      .limit(1);

    if (couponData.length === 0) {
      return NextResponse.json(
        { error: 'Invalid coupon code' },
        { status: 400 }
      );
    }

    const coupon = couponData[0];

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json(
        { error: 'This coupon is no longer active' },
        { status: 400 }
      );
    }

    // Check if coupon has expired
    const now = new Date();
    if (coupon.validUntil && coupon.validUntil < now) {
      return NextResponse.json(
        { error: 'This coupon has expired' },
        { status: 400 }
      );
    }

    // Check if coupon is valid yet
    if (coupon.validFrom && coupon.validFrom > now) {
      return NextResponse.json(
        { error: 'This coupon is not yet valid' },
        { status: 400 }
      );
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: 'This coupon has reached its usage limit' },
        { status: 400 }
      );
    }

    // Check minimum amount
    const minimumAmount = coupon.minimumAmount ? parseFloat(coupon.minimumAmount.toString()) : 0;
    if (subtotal < minimumAmount) {
      return NextResponse.json(
        { error: `Minimum order amount of ₹${minimumAmount.toLocaleString('en-IN')} required for this coupon` },
        { status: 400 }
      );
    }

    // Calculate discount
    let discount = 0;
    const discountValue = parseFloat(coupon.discountValue.toString());

    if (coupon.discountType === 'percentage') {
      discount = subtotal * (discountValue / 100);
    } else {
      discount = discountValue;
    }

    // Apply maximum discount cap if specified
    if (coupon.maximumDiscount) {
      const maxDiscount = parseFloat(coupon.maximumDiscount.toString());
      discount = Math.min(discount, maxDiscount);
    }

    // Ensure discount doesn't exceed subtotal
    discount = Math.min(discount, subtotal);

    return NextResponse.json({
      success: true,
      discount: parseFloat(discount.toFixed(2)),
      couponCode: couponCode.toUpperCase(),
      couponId: coupon.id,
      type: coupon.discountType,
    });

  } catch (error) {
    console.error('Coupon API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
