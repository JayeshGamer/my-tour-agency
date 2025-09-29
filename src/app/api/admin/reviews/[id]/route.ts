import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
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

    // Check if review exists and delete it
    const deletedReviews = await db
      .delete(reviews)
      .where(eq(reviews.id, id))
      .returning();

    if (deletedReviews.length === 0) {
      return new Response(
        JSON.stringify({ error: "Review not found" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Review deleted successfully"
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting review:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete review" }),
      { status: 500 }
    );
  }
}
