'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Reminder {
    id: string
    scheduledAt: string
    sent: boolean
}

interface Lead {
    id: string
    name: string
    phone: string
    purpose: string
    notes: string | null
    status: string
    createdAt: string
    property?: {
        title: string
        location: string
    }
    reminder?: Reminder | null
}

type ReminderPreset = 'tomorrow_morning' | 'tomorrow_afternoon' | 'in_2_days' | 'in_3_days' | 'in_1_week'

const PRESET_OPTIONS: { value: ReminderPreset; label: string }[] = [
    { value: 'tomorrow_morning', label: 'Tomorrow Morning' },
    { value: 'tomorrow_afternoon', label: 'Tomorrow Afternoon' },
    { value: 'in_2_days', label: 'In 2 Days' },
    { value: 'in_3_days', label: 'In 3 Days' },
    { value: 'in_1_week', label: 'In 1 Week' },
]

// Toast component
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000)
        return () => clearTimeout(timer)
    }, [onClose])

    return (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
            type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
            {type === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
            )}
            {message}
        </div>
    )
}

// Reminder button with dropdown
function ReminderButton({
    lead,
    onReminderSet,
    onReminderCancel
}: {
    lead: Lead
    onReminderSet: (leadId: string, preset: ReminderPreset, formattedTime: string) => void
    onReminderCancel: (leadId: string, reminderId: string) => void
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const hasReminder = lead.reminder && !lead.reminder.sent

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Close on escape
    useEffect(() => {
        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') setIsOpen(false)
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [])

    const formatReminderTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        })
    }

    const handleSetReminder = async (preset: ReminderPreset) => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/reminders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId: lead.id, preset })
            })
            const data = await response.json()
            if (data.success) {
                onReminderSet(lead.id, preset, data.formattedTime)
                setIsOpen(false)
            } else {
                throw new Error(data.error)
            }
        } catch (error) {
            console.error('Failed to set reminder:', error)
            alert('Failed to set reminder')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancelReminder = async () => {
        if (!lead.reminder) return
        setIsLoading(true)
        try {
            const response = await fetch(`/api/reminders/${lead.reminder.id}`, {
                method: 'DELETE'
            })
            const data = await response.json()
            if (data.success) {
                onReminderCancel(lead.id, lead.reminder.id)
                setIsOpen(false)
            } else {
                throw new Error(data.error)
            }
        } catch (error) {
            console.error('Failed to cancel reminder:', error)
            alert('Failed to cancel reminder')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                className={`p-2 rounded-lg transition-colors ${
                    hasReminder
                        ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={hasReminder ? `Reminder: ${formatReminderTime(lead.reminder!.scheduledAt)}` : 'Set reminder'}
            >
                {isLoading ? (
                    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={hasReminder ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-700">
                            {hasReminder ? 'Update Reminder' : 'Set Follow-up Reminder'}
                        </span>
                    </div>
                    <div className="py-1">
                        {PRESET_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSetReminder(option.value)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    {hasReminder && (
                        <>
                            <div className="border-t border-gray-100" />
                            <button
                                onClick={handleCancelReminder}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                                Cancel Reminder
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

interface Features {
    notifications: boolean
}

export default function LeadsDashboard() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [features, setFeatures] = useState<Features>({ notifications: false })
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('ALL')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
    const pathname = usePathname()

    useEffect(() => {
        fetchLeads()
    }, [])

    const fetchLeads = async () => {
        try {
            const response = await fetch('/api/leads?t=' + Date.now())
            if (response.ok) {
                const data = await response.json()
                setLeads(data.leads || data) // Handle both new and old response format
                if (data.features) {
                    setFeatures(data.features)
                }
            }
        } catch (error) {
            console.error('Failed to fetch leads:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            const response = await fetch(`/api/leads/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })

            if (response.ok) {
                setLeads(leads.map(lead =>
                    lead.id === id ? { ...lead, status: newStatus } : lead
                ))
            } else {
                alert('Failed to update status')
            }
        } catch (error) {
            console.error('Error updating status:', error)
            alert('Error updating status')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this lead?')) return

        try {
            const response = await fetch(`/api/leads/${id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                setLeads(leads.filter(lead => lead.id !== id))
            } else {
                alert('Failed to delete lead')
            }
        } catch (error) {
            console.error('Error deleting lead:', error)
            alert('Error deleting lead')
        }
    }

    const handleReminderSet = async (leadId: string, _preset: ReminderPreset, formattedTime: string) => {
        // Refresh lead data to get the new reminder
        const response = await fetch(`/api/reminders?leadId=${leadId}`)
        const data = await response.json()
        if (data.success && data.reminder) {
            setLeads(leads.map(lead =>
                lead.id === leadId ? { ...lead, reminder: data.reminder } : lead
            ))
        }
        setToast({ message: `Reminder set for ${formattedTime}`, type: 'success' })
    }

    const handleReminderCancel = (leadId: string, _reminderId: string) => {
        setLeads(leads.map(lead =>
            lead.id === leadId ? { ...lead, reminder: null } : lead
        ))
        setToast({ message: 'Reminder cancelled', type: 'success' })
    }

    const filteredLeads = filterStatus === 'ALL'
        ? leads
        : leads.filter(lead => lead.status === filterStatus)

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div>
            <header className="header">
                <div className="container">
                    <div className="header-content">
                        <div className="header-left">
                            <Link href="/" className="logo">PropertyHub</Link>
                        </div>

                        <nav className="main-nav">
                            <Link href="/" className={`nav-link ${pathname === '/' ? 'nav-link-active' : ''}`}>
                                Home
                            </Link>
                            <Link href="/services" className={`nav-link ${pathname?.startsWith('/services') ? 'nav-link-active' : ''}`}>
                                Services
                            </Link>
                            <Link href="/admin" className={`nav-link ${pathname?.startsWith('/admin') ? 'nav-link-active' : ''}`}>
                                Admin
                            </Link>
                        </nav>

                        <button
                            className="mobile-menu-toggle"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                {mobileMenuOpen ? (
                                    <path d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path d="M3 12h18M3 6h18M3 18h18" />
                                )}
                            </svg>
                        </button>
                    </div>

                    {mobileMenuOpen && (
                        <nav className="mobile-nav">
                            <Link href="/" className={`mobile-nav-link ${pathname === '/' ? 'mobile-nav-link-active' : ''}`}>
                                Home
                            </Link>
                            <Link href="/services" className={`mobile-nav-link ${pathname?.startsWith('/services') ? 'mobile-nav-link-active' : ''}`}>
                                Services
                            </Link>
                            <Link href="/admin" className={`mobile-nav-link ${pathname?.startsWith('/admin') ? 'mobile-nav-link-active' : ''}`}>
                                Admin
                            </Link>
                        </nav>
                    )}
                </div>
            </header>

            <main className="container py-8">
                {/* Breadcrumb */}
                <nav className="breadcrumb">
                    <Link href="/admin" className="breadcrumb-link">Admin</Link>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-current">Leads</span>
                </nav>

                {/* Page Header */}
                <div className="page-header">
                    <h1 className="page-title">Leads Management</h1>
                    <div className="page-actions">
                        <label className="filter-label-inline">Filter:</label>
                        <select
                            className="filter-select-inline"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="NEW">New</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="INTERESTED">Interested</option>
                            <option value="CONVERTED">Converted</option>
                            <option value="LOST">Lost</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Loading leads...</div>
                ) : filteredLeads.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-xl text-gray-500">No leads found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-4 text-left">Date</th>
                                    <th className="p-4 text-left">Name</th>
                                    <th className="p-4 text-left">Contact</th>
                                    <th className="p-4 text-left">Purpose</th>
                                    <th className="p-4 text-left">Property Interest</th>
                                    <th className="p-4 text-left">Status</th>
                                    <th className="p-4 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="border-t hover:bg-gray-50">
                                        <td className="p-4 text-sm text-gray-600">{formatDate(lead.createdAt)}</td>
                                        <td className="p-4 font-medium">{lead.name}</td>
                                        <td className="p-4">
                                            <div>{lead.phone}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                {lead.purpose}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {lead.property ? (
                                                <div className="text-sm">
                                                    <div className="font-medium">{lead.property.title}</div>
                                                    <div className="text-gray-500">{lead.property.location}</div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={lead.status}
                                                onChange={(e) => handleStatusUpdate(lead.id, e.target.value)}
                                                className={`px-2 py-1 rounded-full text-xs font-medium border-none cursor-pointer ${lead.status === 'NEW' ? 'bg-green-100 text-green-800' :
                                                    lead.status === 'LOST' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                <option value="NEW">New</option>
                                                <option value="CONTACTED">Contacted</option>
                                                <option value="INTERESTED">Interested</option>
                                                <option value="CONVERTED">Converted</option>
                                                <option value="LOST">Lost</option>
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {features.notifications && (
                                                    <ReminderButton
                                                        lead={lead}
                                                        onReminderSet={handleReminderSet}
                                                        onReminderCancel={handleReminderCancel}
                                                    />
                                                )}
                                                <button
                                                    onClick={() => handleDelete(lead.id)}
                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Lead"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Toast notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    )
}
