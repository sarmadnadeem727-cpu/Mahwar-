import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // Define public routes
  const isDashboardRoute = path.startsWith('/dashboard');
  const isApiRoute = path.startsWith('/api');
  const isAdminRoute = path.startsWith('/admin');

  // Stripe webhook is public
  const isPublicApiRoute = path === '/api/billing/webhook';

  // If user is trying to access dashboard or admin or protected API routes, check authentication
  if (isDashboardRoute || isAdminRoute || (isApiRoute && !isPublicApiRoute)) {
    if (!user) {
      if (isApiRoute) {
        return new NextResponse(
          JSON.stringify({ error: 'unauthorized', message: 'Authentication required' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      url.pathname = '/login';
      // Store redirect URL
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }

    // Role check for admin route
    if (isAdminRoute) {
      // We will perform role checks in the API or Server Component directly by querying profiles,
      // but in middleware we could do a quick check if needed. Since profiles is in public schema, 
      // let's do role check inside the admin page itself to keep middleware lightweight.
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
