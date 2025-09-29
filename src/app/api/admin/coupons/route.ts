import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user || session.user.role !== "Admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Admin access required" }),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      code, 
      type, 
      value, 
      isActive = true, 
      usageLimit, 
      validFrom, 
      validUntil, 
      minOrderAmount, 
      maxDiscountAmount 
    } = body;

    // Validate required fields
    if (!code || !type || value === undefined) {
      return new Response(
        JSON.stringify({ error: "Code, type, and value are required" }),
        { status: 400 }
      );
    }

    // Validate type
    if (!["percentage", "fixed"].includes(type)) {
      return new Response(
        JSON.stringify({ error: "Type must be 'percentage' or 'fixed'" }),
        { status: 400 }
      );
    }

    // Check if coupon with same code exists
    const existingCoupon = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code.toUpperCase()))
      .limit(1);

    if (existingCoupon.length > 0) {
      return new Response(
        JSON.stringify({ error: "A coupon with this code already exists" }),
        { status: 400 }
      );
    }

    // Create coupon
    const newCoupon = await db
      .insert(coupons)
      .values({
        code: code.toUpperCase(),
        type,
        value: value.toString(),
        isActive,
        usageCount: 0,
        usageLimit,
        validFrom: new Date(validFrom || new Date()),
        validUntil: validUntil ? new Date(validUntil) : null,
        minOrderAmount: minOrderAmount ? minOrderAmount.toString() : null,
        maxDiscountAmount: maxDiscountAmount ? maxDiscountAmount.toString() : null
      })
      .returning();
    
    const coupon = newCoupon[0];

    return new Response(
      JSON.stringify({
        message: "Coupon created successfully",
        coupon
      }),
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating coupon:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create coupon" }),
      { status: 500 }
    );
  }
}
