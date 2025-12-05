'use client'

import React from 'react'
import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-12 mt-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">PropertyHub</h3>
                        <p className="text-[var(--copper-100)]">
                            Your trusted partner in finding the perfect property.
                            From plots to luxury homes, we have it all.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-[var(--copper-100)] hover:text-[var(--copper-300)] transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/services/construction" className="text-[var(--copper-100)] hover:text-[var(--copper-300)] transition-colors">
                                    Construction Services
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin" className="text-[var(--copper-100)] hover:text-[var(--copper-300)] transition-colors">
                                    Admin Login
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-4">Contact Us</h3>
                        <ul className="space-y-2 text-[var(--copper-100)]">
                            <li>Email: info@propertyhub.com</li>
                            <li>Phone: +91 98765 43210</li>
                            <li>Address: 123 Property Lane, Real Estate City</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-[var(--copper-200)]">
                    <p>&copy; {new Date().getFullYear()} PropertyHub. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
