'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Simple client-side check for demonstration. 
        // In a real app, this should be a server-side auth check.
        if (username === 'admin' && password === 'admin123') {
            router.push('/admin')
        } else {
            setError('Invalid username or password')
        }
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] grid grid-rows-[auto_1fr]">
            <header className="header">
                <div className="container">
                    <div className="header-content">
                        <Link href="/" className="logo hover:text-[var(--copper-400)] transition-colors">PropertyHub</Link>
                    </div>
                </div>
            </header>

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
                        >
                            Sign In
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
                </div>
            </main>
        </div>
    )
}
