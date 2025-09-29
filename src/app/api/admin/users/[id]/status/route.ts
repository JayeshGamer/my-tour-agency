import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function PATCH(
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

    const { emailVerified } = await request.json();

    const updatedUsers = await db
      .update(users)
      .set({ emailVerified })
      .where(eq(users.id, id))
      .returning();
    
    if (updatedUsers.length === 0) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404 }
      );
    }
    
    const user = updatedUsers[0];

    return new Response(
      JSON.stringify({
        message: "User status updated successfully",
        user: {
          id: user.id,
          emailVerified: user.emailVerified
        }
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating user status:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update user status" }),
      { status: 500 }
    );
  }
}
