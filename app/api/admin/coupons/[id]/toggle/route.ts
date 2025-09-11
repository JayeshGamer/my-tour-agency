import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
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

    const { isActive } = await request.json();

    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: { isActive },
    });

    return new Response(
      JSON.stringify({
        message: "Coupon status updated successfully",
        coupon: {
          id: coupon.id,
          code: coupon.code,
          isActive: coupon.isActive
        }
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating coupon status:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update coupon status" }),
      { status: 500 }
    );
  }
}
