'use client'

import React from 'react'
import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="footer-section">
            <div className="footer-container">
                <div className="footer-grid">
                    {/* Brand */}
                    <div className="footer-brand">
                        <h3 className="footer-logo">PropertyHub</h3>
                        <p className="footer-tagline">
                            Your trusted partner in finding the perfect property.
                            From plots to luxury homes, we connect you with your dreams.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-column">
                        <h4 className="footer-heading">Quick Links</h4>
                        <nav className="footer-nav">
                            <Link href="/" className="footer-link">Home</Link>
                            <Link href="/services" className="footer-link">Services</Link>
                            <Link href="/admin" className="footer-link">Admin Portal</Link>
                        </nav>
                    </div>

                    {/* Legal */}
                    <div className="footer-column">
                        <h4 className="footer-heading">Legal</h4>
                        <nav className="footer-nav">
                            <a href="#" className="footer-link">Privacy Policy</a>
                            <a href="#" className="footer-link">Terms of Service</a>
                        </nav>
                    </div>

                    {/* Contact */}
                    <div className="footer-column">
                        <h4 className="footer-heading">Contact Us</h4>
                        <div className="footer-contact">
                            <div className="footer-contact-item">
                                <span>📧</span>
                                <span>info@propertyhub.com</span>
                            </div>
                            <div className="footer-contact-item">
                                <span>📞</span>
                                <span>+91 98765 43210</span>
                            </div>
                            <div className="footer-contact-item">
                                <span>📍</span>
                                <span>123 Property Lane, Real Estate City, India</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} PropertyHub. All rights reserved.</p>
                    <div className="footer-social">
                        <a href="#" className="footer-social-link">Twitter</a>
                        <a href="#" className="footer-social-link">LinkedIn</a>
                        <a href="#" className="footer-social-link">Instagram</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
