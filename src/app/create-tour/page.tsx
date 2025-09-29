import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import CreateTourForm from "@/components/tours/CreateTourForm";

export default async function CreateTourPage() {
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
            <h1 className="text-4xl font-bold text-gray-900">Create Your Own Tour Package</h1>
            <p className="text-gray-600 mt-2 text-lg">
              Design your perfect custom tour. Our team will review your submission and contact you with approval and pricing details.
            </p>
          </div>

          <CreateTourForm />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Create tour page error:", error);
    redirect("/login");
  }
}
