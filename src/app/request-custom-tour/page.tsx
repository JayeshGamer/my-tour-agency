import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import CustomTourRequestForm from "@/components/tours/CustomTourRequestForm";

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
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-4xl mx-auto px-6 pb-16">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Request Your Custom Tour</h1>
            <p className="text-gray-600 mt-2 text-lg">
              Tell us about your dream destination and travel preferences. Our expert team will create a personalized itinerary and provide you with a detailed quote.
            </p>
          </div>

          <CustomTourRequestForm />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Request custom tour page error:", error);
    redirect("/login");
  }
}
