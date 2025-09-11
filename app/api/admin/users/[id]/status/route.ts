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

    const { emailVerified } = await request.json();

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { emailVerified },
    });

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
