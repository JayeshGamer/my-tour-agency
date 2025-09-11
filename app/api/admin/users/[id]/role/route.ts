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

    const { role } = await request.json();

    // Validate role
    if (!["User", "Admin"].includes(role)) {
      return new Response(
        JSON.stringify({ error: "Invalid role. Must be 'User' or 'Admin'" }),
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { role },
    });

    return new Response(
      JSON.stringify({
        message: "User role updated successfully",
        user: {
          id: user.id,
          role: user.role
        }
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating user role:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update user role" }),
      { status: 500 }
    );
  }
}
