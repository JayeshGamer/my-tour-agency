import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await the params promise

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user || session.user.role !== "Admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return Response.json(
        { error: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    // Update coupon active status
    const updatedCoupon = await db
      .update(coupons)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(coupons.id, id))
      .returning();

    if (!updatedCoupon[0]) {
      return Response.json({ error: "Coupon not found" }, { status: 404 });
    }

    return Response.json({
      message: `Coupon ${isActive ? "activated" : "deactivated"} successfully`,
      coupon: updatedCoupon[0],
    });
  } catch (error) {
    console.error("Error toggling coupon status:", error);
    return Response.json(
      { error: "Failed to update coupon status" },
      { status: 500 }
    );
  }
}
