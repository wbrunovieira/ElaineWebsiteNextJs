import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  // card.elainevieira-us.com → serve the digital business card at /card
  if (host.startsWith('card.')) {
    const { pathname } = request.nextUrl;
    // Let the /card route and any static file (has an extension, e.g. /elaine.vcf) pass through
    if (pathname.startsWith('/card') || pathname.includes('.')) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = `/card${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(url);
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
