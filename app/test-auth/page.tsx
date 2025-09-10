"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestAuthPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
          <CardDescription>Debug authentication and role information</CardDescription>
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
                <h3 className="font-semibold mb-2">Full Session Data:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => router.push("/admin/dashboard")}
                  variant="default"
                >
                  Try Admin Dashboard
                </Button>
                <Button 
                  onClick={() => router.push("/")}
                  variant="outline"
                >
                  Go Home
                </Button>
              </div>
            </>
          )}
          
          {!session && (
            <div className="flex gap-3">
              <Button onClick={() => router.push("/login")}>
                Login
              </Button>
              <Button onClick={() => router.push("/signup")} variant="outline">
                Sign Up
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
