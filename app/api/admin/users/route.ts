import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
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

    const { name, email, role, emailVerified, password } = await request.json();

    // Validate required fields
    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Name, email, and password are required" }),
        { status: 400 }
      );
    }

    // Validate role
    if (!["User", "Admin"].includes(role)) {
      return new Response(
        JSON.stringify({ error: "Invalid role. Must be 'User' or 'Admin'" }),
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return new Response(
        JSON.stringify({ error: "User with this email already exists" }),
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        role: role as any,
        emailVerified: emailVerified || false,
        passwordHash: hashedPassword,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt
      });

    const user = newUser[0];

    return new Response(
      JSON.stringify({
        message: "User created successfully",
        user
      }),
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating user:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create user" }),
      { status: 500 }
    );
  }
}
