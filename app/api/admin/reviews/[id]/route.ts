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

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: params.id }
    });

    if (!review) {
      return new Response(
        JSON.stringify({ error: "Review not found" }),
        { status: 404 }
      );
    }

    // Delete the review
    await prisma.review.delete({
      where: { id: params.id }
    });

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
