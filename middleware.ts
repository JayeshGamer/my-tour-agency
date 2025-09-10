import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check if the request is for an admin route
  if (path.startsWith('/admin')) {
    try {
      // Get session from Better Auth
      const sessionResponse = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      });

      if (!sessionResponse.ok) {
        // No session, redirect to login
        return NextResponse.redirect(new URL('/login?redirect=/admin/dashboard', request.url));
      }

      const session = await sessionResponse.json();

      // Check if user has admin role
      if (!session?.user || session.user.role !== 'Admin') {
        // Not an admin, redirect to home with error
        const response = NextResponse.redirect(new URL('/', request.url));
        response.headers.set('x-middleware-error', 'unauthorized');
        return response;
      }

      // Admin verified, allow request to proceed
      return NextResponse.next();
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
