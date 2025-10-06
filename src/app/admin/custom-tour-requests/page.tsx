import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import AdminCustomTourRequests from "@/components/admin/AdminCustomTourRequests";

export default async function AdminCustomTourRequestsPage() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList
    });

    if (!session?.user || session.user.role !== 'Admin') {
      redirect("/admin");
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Custom Tour Requests</h1>
          <p className="text-gray-600 mt-2">
            Manage customer requests, provide quotes, and convert them to bookings.
          </p>
        </div>

        <AdminCustomTourRequests />
      </div>
    );
  } catch (error) {
    console.error("Admin custom tour requests page error:", error);
    redirect("/admin");
  }
}
