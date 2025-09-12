import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/dashboard-preview')
  ) {
    return NextResponse.next();
  }

  const jwtCookie = req.cookies.get('jwt');
  if (!jwtCookie) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}