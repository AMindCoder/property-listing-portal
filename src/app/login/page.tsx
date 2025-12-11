'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '../components/Header'

function LoginForm() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') || '/admin'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            })

            const data = await response.json()

            if (response.ok) {
                router.push(callbackUrl)
                router.refresh()
            } else {
                setError(data.error || 'Invalid username or password')
            }
        } catch {
            setError('An error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="filter-group">
                <label htmlFor="username" className="filter-label">
                    Username
                </label>
                <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="filter-input"
                    placeholder="Enter username"
                    autoFocus
                    required
                    disabled={isLoading}
                />
            </div>

            <div className="filter-group">
                <label htmlFor="password" className="filter-label">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="filter-input"
                    placeholder="Enter password"
                    required
                    disabled={isLoading}
                />
            </div>

            {error && (
                <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm text-center font-medium mt-4">
                    {error}
                </div>
            )}

            <button
                type="submit"
                className="btn w-full mt-6"
                disabled={isLoading}
                style={{ opacity: isLoading ? 0.7 : 1 }}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        Signing In...
                    </span>
                ) : (
                    'Sign In'
                )}
            </button>

            <div className="text-center mt-6">
                <Link href="/" className="text-sm text-white hover:text-[var(--copper-400)] transition-colors inline-flex items-center gap-1.5 justify-center underline underline-offset-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Return to Home
                </Link>
            </div>
        </form>
    )
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)] grid grid-rows-[auto_1fr]">
            <Header />

            <main className="grid place-items-center p-4 sm:p-6">
                <div className="w-full max-w-md bg-[var(--bg-secondary)] p-8 sm:p-10 rounded-xl shadow-2xl border border-[var(--border-medium)]">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--bg-tertiary)] mb-5 text-[var(--copper-500)] border border-[var(--border-subtle)]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)] font-playfair mb-2">Admin Portal</h1>
                        <p className="text-[var(--text-secondary)] text-sm">Sign in to access the dashboard</p>
                    </div>

                    <Suspense fallback={<div className="text-center text-[var(--text-secondary)]">Loading...</div>}>
                        <LoginForm />
                    </Suspense>
                </div>
            </main>
        </div>
    )
}
