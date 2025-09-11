import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, bookings, reviews } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";

export async function DELETE(
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

    // Prevent deleting self
    if (session.user.id === params.id) {
      return new Response(
        JSON.stringify({ error: "You cannot delete your own account" }),
        { status: 400 }
      );
    }

    // Check if user exists
    const userExists = await db
      .select()
      .from(users)
      .where(eq(users.id, params.id))
      .limit(1);

    if (userExists.length === 0) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404 }
      );
    }

    // Check if user has bookings or reviews
    const userBookings = await db
      .select({ count: count() })
      .from(bookings)
      .where(eq(bookings.userId, params.id));

    const userReviews = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.userId, params.id));

    const hasBookings = userBookings[0]?.count > 0;
    const hasReviews = userReviews[0]?.count > 0;

    // If user has bookings or reviews, we should handle this more carefully
    if (hasBookings || hasReviews) {
      // Delete related data first
      if (hasReviews) {
        await db.delete(reviews).where(eq(reviews.userId, params.id));
      }
      if (hasBookings) {
        await db.delete(bookings).where(eq(bookings.userId, params.id));
      }
    }

    // Delete the user
    await db.delete(users).where(eq(users.id, params.id));

    return new Response(
      JSON.stringify({
        message: "User deleted successfully"
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete user" }),
      { status: 500 }
    );
  }
}
