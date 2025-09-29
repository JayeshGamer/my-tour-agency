import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { contactSubmissions, systemLogs, notifications } from "@/lib/db/schema";

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  inquiryType: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: ContactFormData = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.subject || !data.message) {
      return new Response(
        JSON.stringify({ error: "Name, email, subject, and message are required" }),
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400 }
      );
    }

    // Store the contact form submission in the dedicated table
    const [submission] = await db.insert(contactSubmissions).values({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject,
      message: data.message,
      inquiryType: data.inquiryType,
      priority: data.inquiryType === 'emergency' ? 'urgent' : 
                data.inquiryType === 'support' ? 'high' : 'normal',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    }).returning({ id: contactSubmissions.id });

    // Also log it in system logs for audit purposes
    await db.insert(systemLogs).values({
      type: 'contact_form',
      message: `Contact form submission from ${data.name} (${data.email}) - Subject: ${data.subject}`,
      metadata: {
        submissionId: submission.id,
        inquiryType: data.inquiryType,
        priority: data.inquiryType === 'emergency' ? 'urgent' : 'normal'
      }
    });

    // Create a notification for admins about the new contact submission
    try {
      await db.insert(notifications).values({
        title: `New ${data.inquiryType} inquiry from ${data.name}`,
        message: `${data.name} (${data.email}) submitted a ${data.inquiryType} inquiry: "${data.subject}"`,
        type: 'contact_form',
        priority: data.inquiryType === 'emergency' ? 'urgent' : 
                  data.inquiryType === 'support' ? 'high' : 'normal',
        relatedEntityType: 'contact_submission',
        relatedEntityId: submission.id,
        metadata: {
          submissionId: submission.id,
          inquiryType: data.inquiryType,
          userEmail: data.email,
          userPhone: data.phone
        }
      });
    } catch (notificationError) {
      // If notification creation fails, log it but don't fail the whole request
      console.warn('Failed to create notification for contact submission:', notificationError);
    }

    // In a real application, you would:
    // 1. Send an email to your support team
    // 2. Send an auto-reply confirmation to the user
    // 3. Store in a dedicated contact_submissions table
    // 4. Integrate with a CRM system

    // For now, we'll simulate email sending
    console.log('Contact form submission:', {
      name: data.name,
      email: data.email,
      subject: data.subject,
      inquiryType: data.inquiryType
    });

    return new Response(
      JSON.stringify({
        message: "Message sent successfully! We'll get back to you within 24 hours.",
        submissionId: submission.id,
        status: 'received'
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error: any) {
    console.error("Error processing contact form:", error);

    // Log the error
    try {
      await db.insert(systemLogs).values({
        type: 'error',
        message: `Contact form submission error: ${error.message}`,
        metadata: {
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        }
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return new Response(
      JSON.stringify({ 
        error: "Failed to send message. Please try again or contact us directly." 
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
