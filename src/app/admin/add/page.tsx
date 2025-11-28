'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AddProperty() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        location: '',
        area: '',
        bedrooms: '',
        bathrooms: '',
        propertyType: 'House',
        status: 'AVAILABLE',
        size: '',
        frontSize: '',
        backSize: '',
        images: '' // Text area for multiple URLs
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Parse images from textarea (one per line or comma separated)
        const imagesArray = formData.images
            .split(/[\n,]+/)
            .map(url => url.trim())
            .filter(url => url.length > 0)

        const payload = {
            ...formData,
            price: parseFloat(formData.price),
            bedrooms: parseInt(formData.bedrooms) || 0,
            bathrooms: parseInt(formData.bathrooms) || 0,
            size: formData.size ? parseFloat(formData.size) : null,
            frontSize: formData.frontSize ? parseFloat(formData.frontSize) : null,
            backSize: formData.backSize ? parseFloat(formData.backSize) : null,
            images: imagesArray
        }

        try {
            const response = await fetch('/api/properties', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                router.push('/admin')
            } else {
                alert('Failed to add property')
            }
        } catch (error) {
            console.error('Error adding property:', error)
            alert('Error adding property')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container">
            <header className="header">
                <div className="header-content">
                    <Link href="/" className="logo">PropertyHub</Link>
                    <Link href="/admin" className="btn btn-secondary">Back to Dashboard</Link>
                </div>
            </header>

            <main className="py-8 max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Add New Property</h1>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                            <label className="block mb-2 font-medium">Title</label>
                            <input
                                type="text"
                                name="title"
                                required
                                className="w-full p-2 border rounded"
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="block mb-2 font-medium">Price</label>
                            <input
                                type="number"
                                name="price"
                                required
                                className="w-full p-2 border rounded"
                                value={formData.price}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="block mb-2 font-medium">Location (City/State)</label>
                            <input
                                type="text"
                                name="location"
                                required
                                className="w-full p-2 border rounded"
                                value={formData.location}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="block mb-2 font-medium">Area (Neighborhood)</label>
                            <input
                                type="text"
                                name="area"
                                required
                                className="w-full p-2 border rounded"
                                value={formData.area}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="block mb-2 font-medium">Property Type</label>
                            <select
                                name="propertyType"
                                className="w-full p-2 border rounded"
                                value={formData.propertyType}
                                onChange={handleChange}
                            >
                                <option value="House">House</option>
                                <option value="Flat">Flat</option>
                                <option value="Plot">Plot</option>
                                <option value="Rental">Rental</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="block mb-2 font-medium">Status</label>
                            <select
                                name="status"
                                className="w-full p-2 border rounded"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="AVAILABLE">Available</option>
                                <option value="SOLD">Sold</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="block mb-2 font-medium">Bedrooms</label>
                            <input
                                type="number"
                                name="bedrooms"
                                className="w-full p-2 border rounded"
                                value={formData.bedrooms}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="block mb-2 font-medium">Bathrooms</label>
                            <input
                                type="number"
                                name="bathrooms"
                                className="w-full p-2 border rounded"
                                value={formData.bathrooms}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="block mb-2 font-medium">Size (sq ft)</label>
                            <input
                                type="number"
                                name="size"
                                className="w-full p-2 border rounded"
                                value={formData.size}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="block mb-2 font-medium">Front Size</label>
                            <input
                                type="number"
                                name="frontSize"
                                className="w-full p-2 border rounded"
                                value={formData.frontSize}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="block mb-2 font-medium">Back Size</label>
                            <input
                                type="number"
                                name="backSize"
                                className="w-full p-2 border rounded"
                                value={formData.backSize}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="block mb-2 font-medium">Description</label>
                        <textarea
                            name="description"
                            required
                            rows={4}
                            className="w-full p-2 border rounded"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="block mb-2 font-medium">Image URLs (one per line)</label>
                        <textarea
                            name="images"
                            rows={4}
                            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                            className="w-full p-2 border rounded font-mono text-sm"
                            value={formData.images}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn btn-primary py-3 text-lg"
                    >
                        {loading ? 'Adding Property...' : 'Add Property'}
                    </button>
                </form>
            </main>
        </div>
    )
}
