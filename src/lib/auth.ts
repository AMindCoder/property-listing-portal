import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

// Admin credentials (full access)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin416'

// Viewer credentials (read-only access)
const VIEWER_USERNAME = process.env.VIEWER_USERNAME || 'viewer'
const VIEWER_PASSWORD = process.env.VIEWER_PASSWORD || 'viewer123'

// User role type
export type UserRole = 'admin' | 'viewer'

export interface SessionPayload {
  username: string
  role: UserRole
  isAdmin: boolean // Kept for backward compatibility
  expiresAt: Date
}

// Custom error classes for authorization
export class UnauthorizedError extends Error {
  constructor(message: string = 'Not authenticated') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'Admin access required') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export async function createSession(username: string, role: UserRole): Promise<string> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const token = await new SignJWT({
    username,
    role,
    isAdmin: role === 'admin', // Backward compatibility
    expiresAt: expiresAt.toISOString()
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)

  return token
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const role = (payload.role as UserRole) || (payload.isAdmin ? 'admin' : 'viewer')
    return {
      username: payload.username as string,
      role,
      isAdmin: role === 'admin',
      expiresAt: new Date(payload.expiresAt as string)
    }
  } catch {
    return null
  }
}

/**
 * Validates credentials and returns the user role if valid
 * @returns UserRole if credentials match, null otherwise
 */
export async function validateCredentials(username: string, password: string): Promise<UserRole | null> {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return 'admin'
  }
  if (username === VIEWER_USERNAME && password === VIEWER_PASSWORD) {
    return 'viewer'
  }
  return null
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value

  if (!token) {
    return null
  }

  return verifySession(token)
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/'
  })
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
}

// Helper functions for role checking
export function isAdmin(session: SessionPayload): boolean {
  return session.role === 'admin'
}

export function isViewer(session: SessionPayload): boolean {
  return session.role === 'viewer'
}

export function canModify(session: SessionPayload): boolean {
  return session.role === 'admin'
}

/**
 * Requires admin role for the current session
 * @throws UnauthorizedError if not authenticated
 * @throws ForbiddenError if not admin
 */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession()

  if (!session) {
    throw new UnauthorizedError('Not authenticated')
  }

  if (session.role !== 'admin') {
    throw new ForbiddenError('Admin access required')
  }

  return session
}
