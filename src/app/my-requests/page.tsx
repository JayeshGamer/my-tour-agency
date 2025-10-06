import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import MyRequestsList from "@/components/tours/MyRequestsList";

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
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-6xl mx-auto px-6 pb-16">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">My Custom Tour Requests</h1>
            <p className="text-gray-600 mt-2 text-lg">
              Track the status of your custom tour requests and view quotes from our team.
            </p>
          </div>

          <MyRequestsList />
        </div>
      </div>
    );
  } catch (error) {
    console.error("My requests page error:", error);
    redirect("/login");
  }
}
