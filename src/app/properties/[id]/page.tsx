import { prisma } from '@/lib/prisma'
import PropertyDetailClient from './PropertyDetailClient'

export default async function PropertyDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    // Server-side data fetching
    const property = await prisma.property.findUnique({
        where: { id }
    })

    return <PropertyDetailClient property={property} />
}
