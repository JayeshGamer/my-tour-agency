import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import MyRequestsList from "@/components/tours/MyRequestsList";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { RainbowButton } from "@/components/ui/rainbow-button";

export default async function MyRequestsPage() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList
    });

    if (!session?.user) {
      redirect("/login");
    }

    return (
      <div className="w-full bg-gray-50 dark:bg-gray-950 min-h-screen">
        {/* Simple Header */}
        <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  My Custom Tour Requests
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Track and manage your custom tour requests
                </p>
              </div>
              <RainbowButton
                variant="black"
                asChild
              >
                <Link href="/request-custom-tour">
                  <Sparkles className="h-4 w-4 mr-2 inline" />
                  Create New Request
                </Link>
              </RainbowButton>
            </div>
          </div>
        </section>

        {/* Main Content Section */}
        <section className="py-8 px-6 sm:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <MyRequestsList />
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error("My requests page error:", error);
    redirect("/login");
  }
}
