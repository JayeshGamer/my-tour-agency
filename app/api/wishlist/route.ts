import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { wishlists } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user's wishlist
    const userWishlist = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.userId, session.user.id));

    return NextResponse.json(userWishlist);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { tourId } = await request.json();

    if (!tourId) {
      return NextResponse.json(
        { error: "Tour ID is required" },
        { status: 400 }
      );
    }

    // Check if already in wishlist
    const existing = await db
      .select()
      .from(wishlists)
      .where(
        and(
          eq(wishlists.userId, session.user.id),
          eq(wishlists.tourId, tourId)
        )
      );

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "Tour already in wishlist" },
        { status: 200 }
      );
    }

    // Add to wishlist
    const newWishlistItem = await db
      .insert(wishlists)
      .values({
        userId: session.user.id,
        tourId: tourId,
      })
      .returning();

    return NextResponse.json(newWishlistItem[0], { status: 201 });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { tourId } = await request.json();

    if (!tourId) {
      return NextResponse.json(
        { error: "Tour ID is required" },
        { status: 400 }
      );
    }

    // Remove from wishlist
    await db
      .delete(wishlists)
      .where(
        and(
          eq(wishlists.userId, session.user.id),
          eq(wishlists.tourId, tourId)
        )
      );

    return NextResponse.json(
      { message: "Removed from wishlist" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}
