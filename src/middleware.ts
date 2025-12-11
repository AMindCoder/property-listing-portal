import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

const protectedRoutes = ['/admin']
const publicRoutes = ['/login']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => path === route)

  const sessionCookie = request.cookies.get('admin_session')?.value

  // Verify the session token
  let isAuthenticated = false
  if (sessionCookie) {
    try {
      await jwtVerify(sessionCookie, JWT_SECRET)
      isAuthenticated = true
    } catch {
      isAuthenticated = false
    }
  }

  // Redirect to login if trying to access protected route without auth
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.nextUrl.origin)
    // Store the intended destination to redirect after login
    loginUrl.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to admin if already authenticated and trying to access login
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin', request.nextUrl.origin))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login'
  ]
}
