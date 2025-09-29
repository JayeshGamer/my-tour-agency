import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import BookingHistoryClient from "@/components/bookings/BookingHistoryClient";
import { headers } from "next/headers";

export default async function BookingsPage() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList
    });

    if (!session?.user) {
      redirect("/login");
    }

    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-7xl mx-auto px-6 pb-16">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600 mt-2">
              View and manage your tour bookings
            </p>
          </div>

          <BookingHistoryClient />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Bookings page error:", error);
    redirect("/login");
  }
}