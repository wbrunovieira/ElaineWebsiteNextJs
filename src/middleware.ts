import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // card.elainevieira-us.com → serve the digital business card at /card
  if (host.startsWith('card.')) {
    // Let the /card route and any static file (has an extension, e.g. /elaine.vcf) pass through
    if (pathname.startsWith('/card') || pathname.includes('.')) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = `/card${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(url);
  }

  // Admin auth guard: protect /admin pages and /api/admin routes
  // (login/logout endpoints and the login page stay public).
  const isAdminPage =
    pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApi =
    pathname.startsWith('/api/admin') &&
    !pathname.startsWith('/api/admin/login') &&
    !pathname.startsWith('/api/admin/logout');

  if (isAdminPage || isAdminApi) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const session = await verifySession(token);
    if (!session) {
      if (isAdminApi) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  if (host.includes('vercel.app')) {
    const url = request.nextUrl.clone();
    url.host = 'www.elainevieira-us.com';
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
