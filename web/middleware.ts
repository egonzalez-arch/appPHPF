import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('next-auth.session-token');
  if (!token && !req.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  // RBAC: Example admin/doctor
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const role = req.cookies.get('role');
    if (role !== 'ADMIN') return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  if (req.nextUrl.pathname.startsWith('/doctor')) {
    const role = req.cookies.get('role');
    if (role !== 'DOCTOR') return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  return NextResponse.next();
}