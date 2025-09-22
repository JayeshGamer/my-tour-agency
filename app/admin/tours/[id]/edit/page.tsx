import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tours } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import TourForm from "@/components/admin/TourForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

async function getTour(tourId: string) {
  const tour = await db
    .select()
    .from(tours)
    .where(eq(tours.id, tourId))
    .limit(1);

  if (tour.length === 0) {
    return null;
  }

  return tour[0];
}

export default async function EditTourPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params as required by Next.js 15
  const { id } = await params;
  
  // Check authentication and admin role
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== 'Admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
          <p className="text-gray-600 mb-4">You do not have permission to access this area.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const tour = await getTour(id);

  if (!tour) {
    notFound();
  }

  // Format data for the form
  const formData = {
    ...tour,
    images: tour.images ? (tour.images as string[]).join(", ") : "",
    startDates: tour.startDates ? (tour.startDates as string[]).join(", ") : "",
    included: tour.included ? (tour.included as string[]).join(", ") : "",
    notIncluded: tour.notIncluded ? (tour.notIncluded as string[]).join(", ") : "",
    itinerary: tour.itinerary ? 
      (tour.itinerary as Array<{ day: number; title: string; description: string }>)
        .map(item => item.description)
        .join("\n") : "",
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/tours">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Tour</h1>
          <p className="text-gray-500 mt-1">Update tour package details</p>
        </div>
      </div>

      {/* Tour Form */}
      <TourForm initialData={formData} />
    </div>
  );
}
