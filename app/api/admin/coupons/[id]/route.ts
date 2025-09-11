import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "Admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Admin access required" }),
        { status: 401 }
      );
    }

    // Check if coupon exists
    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id }
    });

    if (!coupon) {
      return new Response(
        JSON.stringify({ error: "Coupon not found" }),
        { status: 404 }
      );
    }

    // Delete the coupon
    await prisma.coupon.delete({
      where: { id: params.id }
    });

    return new Response(
      JSON.stringify({
        message: "Coupon deleted successfully"
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting coupon:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete coupon" }),
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      isActive, 
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

    // Check if coupon with same code exists (excluding current coupon)
    const existingCoupon = await prisma.coupon.findFirst({
      where: { 
        code,
        NOT: { id: params.id }
      }
    });

    if (existingCoupon) {
      return new Response(
        JSON.stringify({ error: "A coupon with this code already exists" }),
        { status: 400 }
      );
    }

    // Update coupon
    const updatedCoupon = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        code,
        type,
        value,
        isActive,
        usageLimit,
        validFrom: new Date(validFrom),
        validUntil: validUntil ? new Date(validUntil) : null,
        minOrderAmount,
        maxDiscountAmount
      }
    });

    return new Response(
      JSON.stringify({
        message: "Coupon updated successfully",
        coupon: updatedCoupon
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating coupon:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update coupon" }),
      { status: 500 }
    );
  }
}
