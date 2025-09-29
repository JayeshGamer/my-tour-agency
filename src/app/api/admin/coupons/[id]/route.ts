import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await the params promise

    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user || session.user.role !== 'Admin') {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the coupon
    await db.delete(coupons).where(eq(coupons.id, id));

    return Response.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return Response.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await the params promise

    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user || session.user.role !== 'Admin') {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      code,
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maxDiscount,
      usageLimit,
      validFrom,
      validUntil,
      isActive
    } = body;

    // Validate required fields
    if (!code || !discountType || discountValue === undefined) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if another coupon with the same code exists (excluding current)
    const existingCoupon = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code))
      .limit(1);

    if (existingCoupon.length > 0 && existingCoupon[0].id !== id) {
      return Response.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      );
    }

    // Update coupon
    const updatedCoupon = await db
      .update(coupons)
      .set({
        code,
        description: description || null,
        discountType,
        discountValue: discountValue.toString(),
        minimumOrderAmount: minimumOrderAmount?.toString() || null,
        maxDiscount: maxDiscount?.toString() || null,
        usageLimit: usageLimit || null,
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        isActive: isActive ?? true,
        updatedAt: new Date()
      })
      .where(eq(coupons.id, id))
      .returning();

    if (!updatedCoupon[0]) {
      return Response.json({ error: "Coupon not found" }, { status: 404 });
    }

    return Response.json(updatedCoupon[0]);
  } catch (error: any) {
    console.error('Error updating coupon:', error);
    return Response.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    );
  }
}
