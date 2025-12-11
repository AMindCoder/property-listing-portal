'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

export type UserRole = 'admin' | 'viewer'

interface User {
  username: string
  role: UserRole
  canModify: boolean
}

interface UserContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  refetch: () => Promise<void>
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSession = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/auth/session')
      const data = await response.json()

      if (data.authenticated && data.user) {
        setUser({
          username: data.user.username,
          role: data.user.role,
          canModify: data.user.canModify
        })
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error('Failed to fetch session:', err)
      setError('Failed to fetch session')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  const value: UserContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    refetch: fetchSession
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser(): UserContextValue {
  const context = useContext(UserContext)

  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }

  return context
}
