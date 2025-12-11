'use client'

import { useState, useEffect, useRef } from 'react'
import AdminHeader from '../../components/AdminHeader'
import TableRowSkeleton from '../../components/skeletons/TableRowSkeleton'

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
                className={`icon-btn ${hasReminder ? 'icon-btn-active' : ''} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{
                    background: hasReminder ? 'hsla(40, 80%, 50%, 0.15)' : 'transparent',
                    color: hasReminder ? 'hsl(40, 80%, 50%)' : 'var(--text-secondary)'
                }}
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
                <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg border z-50" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-medium)' }}>
                    <div className="p-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {hasReminder ? 'Update Reminder' : 'Set Follow-up Reminder'}
                        </span>
                    </div>
                    <div className="py-1">
                        {PRESET_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSetReminder(option.value)}
                                className="w-full text-left px-4 py-2 text-sm transition-colors"
                                style={{ color: 'var(--text-secondary)' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    {hasReminder && (
                        <>
                            <div style={{ height: '1px', background: 'var(--border-subtle)' }} />
                            <button
                                onClick={handleCancelReminder}
                                className="w-full text-left px-4 py-2 text-sm flex items-center gap-2"
                                style={{ color: 'hsl(0, 60%, 60%)' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'hsla(0, 60%, 40%, 0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
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
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    useEffect(() => {
        fetchLeads()
    }, [])

    const fetchLeads = async () => {
        try {
            const response = await fetch('/api/leads?t=' + Date.now())
            if (response.ok) {
                const data = await response.json()
                setLeads(data.leads || data)
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

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'NEW':
                return { background: 'var(--success-bg)', color: 'var(--success-text)' }
            case 'LOST':
                return { background: 'hsla(0, 60%, 40%, 0.15)', color: 'hsl(0, 60%, 60%)' }
            case 'CONVERTED':
                return { background: 'hsla(210, 80%, 40%, 0.15)', color: 'hsl(210, 80%, 60%)' }
            default:
                return { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }
        }
    }

    return (
        <div className="page-gradient noise-overlay">
            <AdminHeader breadcrumbs={[{ label: 'Leads' }]} />

            <main className="container py-8 page-enter">
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 className="text-display" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Leads Management</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Track and manage your property inquiries</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <label className="filter-label" style={{ marginBottom: 0 }}>Filter:</label>
                        <select
                            className="filter-select"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{ minWidth: '150px' }}
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
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                        <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderBottom: '1px solid var(--border-medium)' }}>
                            <div className="table-skeleton-row" style={{ borderBottom: 'none' }}>
                                <div className="skeleton" style={{ height: '0.75rem', width: '60px' }} />
                                <div className="skeleton" style={{ height: '0.75rem', width: '60px' }} />
                                <div className="skeleton" style={{ height: '0.75rem', width: '60px' }} />
                                <div className="skeleton" style={{ height: '0.75rem', width: '60px' }} />
                                <div className="skeleton" style={{ height: '0.75rem', width: '80px' }} />
                                <div className="skeleton" style={{ height: '0.75rem', width: '60px' }} />
                                <div className="skeleton" style={{ height: '0.75rem', width: '60px' }} />
                            </div>
                        </div>
                        {[...Array(5)].map((_, i) => (
                            <TableRowSkeleton key={i} />
                        ))}
                    </div>
                ) : filteredLeads.length === 0 ? (
                    <div className="empty-state" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '4rem 2rem' }}>
                        <div className="empty-icon">📋</div>
                        <h2 className="empty-title">No Leads Found</h2>
                        <p className="empty-message">No leads match the current filter criteria.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--copper-400)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: 600 }}>Date</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--copper-400)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: 600 }}>Name</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--copper-400)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: 600 }}>Contact</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--copper-400)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: 600 }}>Purpose</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--copper-400)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: 600 }}>Property Interest</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--copper-400)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: 600 }}>Status</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--copper-400)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: 600 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeads.map((lead, index) => (
                                    <tr
                                        key={lead.id}
                                        className="animate-stagger"
                                        style={{ animationDelay: `${index * 30}ms`, borderTop: '1px solid var(--border-subtle)' }}
                                    >
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{formatDate(lead.createdAt)}</td>
                                        <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>{lead.name}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{lead.phone}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ padding: '0.25rem 0.75rem', background: 'hsla(210, 80%, 50%, 0.15)', color: 'hsl(210, 80%, 65%)', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500 }}>
                                                {lead.purpose}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {lead.property ? (
                                                <div>
                                                    <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{lead.property.title}</div>
                                                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>{lead.property.location}</div>
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--text-tertiary)' }}>-</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <select
                                                value={lead.status}
                                                onChange={(e) => handleStatusUpdate(lead.id, e.target.value)}
                                                style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    ...getStatusStyle(lead.status)
                                                }}
                                            >
                                                <option value="NEW">New</option>
                                                <option value="CONTACTED">Contacted</option>
                                                <option value="INTERESTED">Interested</option>
                                                <option value="CONVERTED">Converted</option>
                                                <option value="LOST">Lost</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {features.notifications && (
                                                    <ReminderButton
                                                        lead={lead}
                                                        onReminderSet={handleReminderSet}
                                                        onReminderCancel={handleReminderCancel}
                                                    />
                                                )}
                                                <button
                                                    onClick={() => handleDelete(lead.id)}
                                                    className="icon-btn icon-btn-danger"
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
