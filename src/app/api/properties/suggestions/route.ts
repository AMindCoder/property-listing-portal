import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const q = searchParams.get('q')?.trim() || ''
        const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 20)

        if (!q) {
            return NextResponse.json({
                success: true,
                data: {
                    areas: [],
                    types: [],
                    properties: []
                }
            })
        }

        if (q.length > 100) {
            return NextResponse.json(
                { success: false, error: { code: 'INVALID_PARAMETER', message: 'Query too long' } },
                { status: 400 }
            )
        }

        // Get matching areas
        const areaResults = await prisma.property.findMany({
            where: {
                area: {
                    contains: q,
                    mode: 'insensitive'
                }
            },
            select: { area: true },
            distinct: ['area'],
            take: limit
        })
        const areas = areaResults.map(r => r.area)

        // Get matching property types
        const PROPERTY_TYPES = ['Plot', 'House', 'Flat', 'Shop', 'Rental']
        const types = PROPERTY_TYPES.filter(type =>
            type.toLowerCase().includes(q.toLowerCase())
        ).slice(0, limit)

        // Get matching properties by title
        const properties = await prisma.property.findMany({
            where: {
                OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { location: { contains: q, mode: 'insensitive' } }
                ],
                status: 'AVAILABLE'
            },
            select: {
                id: true,
                title: true,
                location: true,
                area: true,
                price: true
            },
            take: limit,
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({
            success: true,
            data: {
                areas: areas.slice(0, 5),
                types: types.slice(0, 4),
                properties: properties.slice(0, 5)
            }
        })

    } catch (error) {
        console.error('Suggestions API error:', error)
        return NextResponse.json(
            {
                success: false,
                error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch suggestions' }
            },
            { status: 500 }
        )
    }
}
