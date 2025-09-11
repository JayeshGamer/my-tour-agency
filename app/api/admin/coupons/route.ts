import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
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
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code }
    });

    if (existingCoupon) {
      return new Response(
        JSON.stringify({ error: "A coupon with this code already exists" }),
        { status: 400 }
      );
    }

    // Create coupon
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        type,
        value,
        isActive,
        usageCount: 0,
        usageLimit,
        validFrom: new Date(validFrom || new Date()),
        validUntil: validUntil ? new Date(validUntil) : null,
        minOrderAmount,
        maxDiscountAmount
      }
    });

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
