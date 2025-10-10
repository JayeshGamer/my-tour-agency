import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth check
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== 'Admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
          <p className="text-muted-foreground mb-4">You do not have permission to access this area.</p>
          <Link href="/" className="text-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return <AdminLayoutClient user={session.user}>{children}</AdminLayoutClient>;
}
