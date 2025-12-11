import { NextRequest, NextResponse } from 'next/server'
import { validateCredentials, createSession, setSessionCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const role = await validateCredentials(username, password)

    if (!role) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    const token = await createSession(username, role)
    await setSessionCookie(token)

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      role
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
