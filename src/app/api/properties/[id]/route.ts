import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { StorageFactory } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const property = await prisma.property.findUnique({
            where: { id }
        })

        if (!property) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 })
        }

        return NextResponse.json(property)
    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        // Get the current property to compare images
        const currentProperty = await prisma.property.findUnique({
            where: { id }
        })

        // If images were updated, delete removed images from storage
        if (currentProperty && body.images) {
            const removedImages = currentProperty.images.filter(
                (img: string) => !body.images.includes(img)
            )

            if (removedImages.length > 0) {
                try {
                    const storage = StorageFactory.getProvider()
                    await storage.deleteMultiple(removedImages)
                    console.log(`[API] Deleted ${removedImages.length} removed images from storage`)
                } catch (error) {
                    console.warn('[API] Failed to delete removed images from storage:', error)
                    // Don't fail the update if storage deletion fails
                }
            }
        }

        const property = await prisma.property.update({
            where: { id },
            data: body
        })
        return NextResponse.json(property)
    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Failed to update property' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        console.log(`[API] Attempting to delete property with ID: ${id}`)

        // Get the property first to access its images
        const property = await prisma.property.findUnique({
            where: { id }
        })

        if (!property) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 })
        }

        // Delete the property from database
        const deleted = await prisma.property.delete({
            where: { id }
        })

        // Delete associated images from blob storage
        if (property.images && property.images.length > 0) {
            try {
                const storage = StorageFactory.getProvider()
                await storage.deleteMultiple(property.images)
                console.log(`[API] Deleted ${property.images.length} images from storage`)
            } catch (error) {
                console.warn('[API] Failed to delete images from storage:', error)
                // Don't fail the delete if storage deletion fails
            }
        }

        console.log(`[API] Successfully deleted property: ${id}`)
        return NextResponse.json({ message: 'Property deleted successfully', deleted })
    } catch (error) {
        console.error('[API] Error deleting property:', error)
        return NextResponse.json({ error: 'Failed to delete property', details: String(error) }, { status: 500 })
    }
}
