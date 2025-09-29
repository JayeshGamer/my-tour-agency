import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, bookings, reviews, wishlists } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { headers } from "next/headers";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params as required by Next.js 15
    const { id } = await params;
    
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user || session.user.role !== "Admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Admin access required" }),
        { status: 401 }
      );
    }

    // Prevent deleting self
    if (session.user.id === id) {
      return new Response(
        JSON.stringify({ error: "You cannot delete your own account" }),
        { status: 400 }
      );
    }

    // Check if user exists
    const userExists = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
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
      .where(eq(bookings.userId, id));

    const userReviews = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.userId, id));

    const hasBookings = userBookings[0]?.count > 0;
    const hasReviews = userReviews[0]?.count > 0;

    // If user has bookings or reviews, we should handle this more carefully
    if (hasBookings || hasReviews) {
      // Delete related data first
      if (hasReviews) {
        await db.delete(reviews).where(eq(reviews.userId, id));
      }
      if (hasBookings) {
        await db.delete(bookings).where(eq(bookings.userId, id));
      }
    }

    // Delete wishlists first to avoid foreign key constraint
    await db.delete(wishlists).where(eq(wishlists.userId, id));

    // Delete the user
    await db.delete(users).where(eq(users.id, id));

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
