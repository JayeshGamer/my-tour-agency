import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function TestServerAuthPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Server Auth Test</CardTitle>
          <CardDescription>Server-side authentication check</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Session Status:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {session ? "Authenticated" : "Not Authenticated"}
            </pre>
          </div>
          
          {session && (
            <>
              <div>
                <h3 className="font-semibold mb-2">User Information:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(session.user, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">User Role:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {session.user?.role || "No role found"}
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Full Session Data:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
            </>
          )}
          
          <div className="flex gap-3 pt-4">
            {!session && (
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            )}
            {session?.user?.role === 'Admin' && (
              <Link href="/admin/dashboard">
                <Button>Go to Admin Dashboard</Button>
              </Link>
            )}
            <Link href="/">
              <Button variant="outline">Go Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
