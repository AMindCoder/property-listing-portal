'use client'

import Link from 'next/link'
import Footer from '../../components/Footer'
import Header from '../../components/Header'

export default function ConstructionServices() {
    return (
        <div className="container">
            <Header backLink="/" backLabel="Back to Listings" />

            <main className="py-12 max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4 text-[var(--copper-500)]">Premium Construction Services</h1>
                    <p className="text-xl text-gray-600">Turn your plot into a dream home with our expert construction partners.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-white p-8 rounded-lg shadow-md border border-[var(--copper-100)]">
                        <h2 className="text-2xl font-bold mb-4">Why Choose Us?</h2>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2">
                                <span>✅</span>
                                <span>Experienced Architects & Engineers</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span>✅</span>
                                <span>Quality Material Guarantee</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span>✅</span>
                                <span>On-time Project Delivery</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span>✅</span>
                                <span>Transparent Pricing</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white p-8 rounded-lg shadow-md border border-[var(--copper-100)]">
                        <h2 className="text-2xl font-bold mb-4">Our Services</h2>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2">
                                <span>🏗️</span>
                                <span>Residential Construction</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span>🏢</span>
                                <span>Commercial Complexes</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span>🎨</span>
                                <span>Interior Design & Renovation</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span>📐</span>
                                <span>Architectural Planning</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="bg-[var(--copper-50)] p-8 rounded-lg text-center">
                    <h2 className="text-3xl font-bold mb-6">Ready to Start Building?</h2>
                    <p className="text-lg mb-8">Contact us today for a free consultation and quote.</p>

                    <div className="flex flex-col md:flex-row justify-center gap-6">
                        <a href="tel:+919876543210" className="btn btn-primary text-lg py-3 px-8 flex items-center justify-center gap-2">
                            <span>📞</span> Call +91 98765 43210
                        </a>
                        <a href="mailto:construction@propertyhub.com" className="btn btn-secondary text-lg py-3 px-8 flex items-center justify-center gap-2">
                            <span>✉️</span> Email Us
                        </a>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
