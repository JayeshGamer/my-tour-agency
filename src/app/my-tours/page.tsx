import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import MyToursClient from "@/components/tours/MyToursClient";

export default async function MyToursPage() {
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
            <h1 className="text-3xl font-bold text-gray-900">My Custom Tours</h1>
            <p className="text-gray-600 mt-2">
              Manage your submitted custom tours and track their approval status
            </p>
          </div>

          <MyToursClient />
        </div>
      </div>
    );
  } catch (error) {
    console.error("My tours page error:", error);
    redirect("/login");
  }
}
