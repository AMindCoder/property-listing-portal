'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImageUploader } from '@/components/ui/image-upload'
import AdminHeader from '@/app/components/AdminHeader'

export default function AddProperty() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [uploadedImages, setUploadedImages] = useState<string[]>([])
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
        ownerName: '',
        ownerPhone: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const removeImage = (index: number) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload = {
            ...formData,
            price: parseFloat(formData.price),
            bedrooms: parseInt(formData.bedrooms) || 0,
            bathrooms: parseInt(formData.bathrooms) || 0,
            size: formData.size ? parseFloat(formData.size) : null,
            frontSize: formData.frontSize ? parseFloat(formData.frontSize) : null,
            backSize: formData.backSize ? parseFloat(formData.backSize) : null,
            images: uploadedImages
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
        <div className="page-gradient">
            <div className="noise-overlay" />
            <AdminHeader breadcrumbs={[{ label: 'Add Property' }]} />

            <main className="container py-8">
                <div className="max-w-2xl mx-auto">
                    <h1 className="page-title mb-8">Add New Property</h1>

                    <form onSubmit={handleSubmit} className="space-y-6 admin-form-card">
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
                                <option value="Shop">Shop</option>
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
                            <label className="block mb-2 font-medium">Owner Name</label>
                            <input
                                type="text"
                                name="ownerName"
                                className="w-full p-2 border rounded"
                                value={formData.ownerName}
                                onChange={handleChange}
                                placeholder="Optional"
                            />
                        </div>

                        <div className="form-group">
                            <label className="block mb-2 font-medium">Owner Phone</label>
                            <input
                                type="tel"
                                name="ownerPhone"
                                className="w-full p-2 border rounded"
                                value={formData.ownerPhone}
                                onChange={handleChange}
                                placeholder="Optional"
                            />
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
                        <label className="block mb-2 font-medium">Property Images ({uploadedImages.length}/10)</label>
                        <ImageUploader
                            folder="properties"
                            maxFiles={10}
                            onUploadComplete={(urls) => {
                                setUploadedImages(urls);
                            }}
                            onImagesChange={(urls) => {
                                setUploadedImages(urls);
                            }}
                            onUploadError={(error) => {
                                console.error('Upload error:', error);
                                alert('Failed to upload images. Please try again.');
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn py-3 text-lg"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                                Saving Property...
                            </span>
                        ) : 'Add Property'}
                    </button>
                    </form>
                </div>
            </main>
        </div>
    )
}
