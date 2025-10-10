import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import BookingHistoryClient from "@/components/bookings/BookingHistoryClient";
import { headers } from "next/headers";
import { Sparkles } from "lucide-react";

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Content */}
        <div className="relative z-10 pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            {/* Header Section */}
            <div className="mb-12 space-y-6">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 dark:bg-white border border-gray-900 dark:border-white">
                <Sparkles className="h-4 w-4 text-white dark:text-gray-900" />
                <span className="text-sm font-medium text-white dark:text-gray-900 tracking-wide">Travel Dashboard</span>
              </div>

              <div>
                <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                  My Bookings
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-2xl">
                  Track and manage all your upcoming adventures in one place
                </p>
              </div>
            </div>

            {/* Bookings Component */}
            <BookingHistoryClient />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Bookings page error:", error);
    redirect("/login");
  }
}