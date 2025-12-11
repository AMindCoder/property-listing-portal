'use client'

import { UserProvider } from '@/app/contexts/UserContext'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  )
}
