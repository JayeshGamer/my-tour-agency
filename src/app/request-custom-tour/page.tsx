import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import CustomTourRequestForm from "@/components/tours/CustomTourRequestForm";
import { Target } from "lucide-react";

export default async function RequestCustomTourPage() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList
    });

    if (!session?.user) {
      redirect("/login");
    }

    return (
      <div className="w-full bg-gray-50 dark:bg-gray-950 min-h-screen pt-6">
        {/* Form Section */}
        <section className="py-6 px-6 sm:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-2 border-gray-900 dark:border-white">
                <Target className="h-4 w-4" />
                <span className="text-xs font-bold tracking-wider uppercase">Start Your Journey</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                Tell Us About Your
                <br />
                <span className="relative inline-block">
                  Dream Trip
                  <svg className="absolute -bottom-1 left-0 w-full" height="10" viewBox="0 0 300 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 8C50 3 250 3 298 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </span>
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed pt-2">
                Fill out our smart form below. Our AI will analyze your preferences and our expert curators will design the perfect itinerary just for you.
              </p>
            </div>

            <CustomTourRequestForm />
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error("Request custom tour page error:", error);
    redirect("/login");
  }
}
