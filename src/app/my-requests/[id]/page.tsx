import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import RequestDetailView from "@/components/tours/RequestDetailView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RequestDetailPage({ params }: PageProps) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList
    });

    if (!session?.user) {
      redirect("/login");
    }

    const resolvedParams = await params;

    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-4xl mx-auto px-6 pb-16">
          <RequestDetailView requestId={resolvedParams.id} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Request detail page error:", error);
    redirect("/my-requests");
  }
}
