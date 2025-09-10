import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import AdminNavigation from "../../components/admin/AdminNavigation";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
          <p className="text-gray-600 mb-4">You do not have permission to access this area.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminNavigation user={session.user} />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-8 text-center">
            <p className="text-sm text-gray-500">
              Admin Dashboard v2.0 • {new Date().getFullYear()} Tour Agency Platform
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
