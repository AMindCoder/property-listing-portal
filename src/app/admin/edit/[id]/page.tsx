'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditProperty({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [fetchingData, setFetchingData] = useState(true)
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
    })

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const response = await fetch(`/api/properties/${params.id}`)
                if (response.ok) {
                    const property = await response.json()
                    setFormData({
                        title: property.title || '',
                        description: property.description || '',
                        price: property.price?.toString() || '',
                        location: property.location || '',
                        area: property.area || '',
                        bedrooms: property.bedrooms?.toString() || '',
                        bathrooms: property.bathrooms?.toString() || '',
                        propertyType: property.propertyType || 'House',
                        status: property.status || 'AVAILABLE',
                        size: property.size?.toString() || '',
                        frontSize: property.frontSize?.toString() || '',
                        backSize: property.backSize?.toString() || '',
                    })
                    setUploadedImages(property.images || [])
                } else {
                    alert('Failed to fetch property')
                }
            } catch (error) {
                console.error('Error fetching property:', error)
                alert('Error loading property')
            } finally {
                setFetchingData(false)
            }
        }

        fetchProperty()
    }, [params.id])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setLoading(true)
        const formData = new FormData()

        Array.from(files).forEach(file => {
            formData.append('files', file)
        })

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (response.ok) {
                const data = await response.json()
                setUploadedImages(prev => [...prev, ...data.paths])
            } else {
                alert('Failed to upload images')
            }
        } catch (error) {
            console.error('Error uploading images:', error)
            alert('Error uploading images')
        } finally {
            setLoading(false)
        }
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
            const response = await fetch(`/api/properties/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                router.push('/admin')
            } else {
                alert('Failed to update property')
            }
        } catch (error) {
            console.error('Error updating property:', error)
            alert('Error updating property')
        } finally {
            setLoading(false)
        }
    }

    if (fetchingData) {
        return (
            <div className="container">
                <div className="loading">Loading property...</div>
            </div>
        )
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
                <h1 className="text-3xl font-bold mb-8">Edit Property</h1>

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
                        <label className="block mb-2 font-medium">Property Images</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="w-full p-2 border rounded"
                            disabled={loading}
                        />
                        <p className="text-sm text-gray-500 mt-1">Add more images or keep existing ones</p>

                        {uploadedImages.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                                {uploadedImages.map((imagePath, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={imagePath}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-32 object-cover rounded border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn btn-primary py-3 text-lg"
                    >
                        {loading ? 'Updating Property...' : 'Update Property'}
                    </button>
                </form>
            </main>
        </div>
    )
}
