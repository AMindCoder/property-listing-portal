'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
}

export default function LeadsDashboard() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('ALL')

    useEffect(() => {
        fetchLeads()
    }, [])

    const fetchLeads = async () => {
        try {
            const response = await fetch('/api/leads?t=' + Date.now())
            if (response.ok) {
                const data = await response.json()
                setLeads(data)
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
        <div className="container">
            <header className="header">
                <div className="header-content">
                    <Link href="/" className="logo">PropertyHub</Link>
                    <div className="flex gap-4">
                        <Link href="/admin" className="btn btn-secondary">Back to Dashboard</Link>
                    </div>
                </div>
            </header>

            <main className="py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Leads Management</h1>
                    <div className="flex gap-2 items-center">
                        <span className="font-medium">Filter Status:</span>
                        <select
                            className="p-2 border rounded"
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
                                            <button
                                                onClick={() => handleDelete(lead.id)}
                                                className="text-red-500 hover:text-red-700"
                                                title="Delete Lead"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    )
}

