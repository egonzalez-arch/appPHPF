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
    pathname.startsWith('/login')
  ) {
    return NextResponse.next();
  }

  // Temporarily disable JWT check for development
  // const jwtCookie = req.cookies.get('jwt');
  // if (!jwtCookie) {
  //   return NextResponse.redirect(new URL('/login', req.url));
  // }
  return NextResponse.next();
}