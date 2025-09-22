import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, verifications } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (!user[0]) {
      // For security, don't reveal whether the email exists or not
      return NextResponse.json(
        { success: true, message: 'If an account with this email exists, you will receive a password reset link.' },
        { status: 200 }
      );
    }

    // Generate a reset token
    const resetToken = Math.random().toString(36).substr(2, 32) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    // Store the verification token
    await db.insert(verifications).values({
      identifier: email,
      value: resetToken,
      expiresAt,
    });

    // In a real application, you would send an email here
    // For demo purposes, we'll just log the reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    console.log('Password reset URL (demo):', resetUrl);

    return NextResponse.json(
      { 
        success: true, 
        message: 'If an account with this email exists, you will receive a password reset link.',
        // In demo mode, include the reset URL in the response
        resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}