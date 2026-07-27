import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

// Define public auth and protected dashboard routes
const publicRoutes = ['/login', '/register'];
const protectedRoutes = ['/dashboard'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));
  const isRootRoute = path === '/';

  const sessionCookie = request.cookies.get('session')?.value;
  const session = sessionCookie ? await decrypt(sessionCookie) : null;

  // 1. If user is NOT logged in and attempting to access protected route (/dashboard), redirect to /login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If user IS logged in and attempting to access auth routes (/login, /register) or root (/), redirect to /dashboard
  if ((isPublicRoute || isRootRoute) && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login', '/register'],
};
