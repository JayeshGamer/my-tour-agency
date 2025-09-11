import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user || session.user.role !== "Admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Admin access required" }),
        { status: 401 }
      );
    }

    const { status } = await request.json();

    // Validate status
    if (!["pending", "approved", "rejected"].includes(status)) {
      return new Response(
        JSON.stringify({ error: "Invalid status. Must be 'pending', 'approved', or 'rejected'" }),
        { status: 400 }
      );
    }

    const updatedReview = await db
      .update(reviews)
      .set({ status: status as any })
      .where(eq(reviews.id, params.id))
      .returning({
        id: reviews.id,
        status: reviews.status
      });

    const review = updatedReview[0];

    return new Response(
      JSON.stringify({
        message: "Review status updated successfully",
        review: {
          id: review.id,
          status: review.status
        }
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating review status:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update review status" }),
      { status: 500 }
    );
  }
}
