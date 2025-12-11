import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, UnauthorizedError, ForbiddenError } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const area = searchParams.get('area')
    const propertyType = searchParams.get('propertyType')

    const where: any = {}

    if (status && status !== 'ALL') {
        where.status = status
    } else if (!status) {
        // Default to AVAILABLE
        where.status = 'AVAILABLE'
    }

    if (minPrice) {
        where.price = { ...where.price, gte: parseFloat(minPrice) }
    }
    if (maxPrice) {
        where.price = { ...where.price, lte: parseFloat(maxPrice) }
    }

    if (area && area !== 'ALL') {
        where.area = area
    }

    if (propertyType && propertyType !== 'ALL') {
        where.propertyType = propertyType
    }

    try {
        const properties = await prisma.property.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(properties)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 })
    }
}

// GET distinct areas for filter dropdown
export async function OPTIONS() {
    try {
        const areas = await prisma.property.findMany({
            select: { area: true },
            distinct: ['area'],
            orderBy: { area: 'asc' }
        })
        return NextResponse.json(areas.map(a => a.area))
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch areas' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        // Require admin access for creating properties
        await requireAdmin()

        const body = await request.json()

        // Auto-calculate size if frontSize and backSize are provided but size is not
        if (body.frontSize && body.backSize && !body.size) {
            body.size = body.frontSize * body.backSize
        }

        const property = await prisma.property.create({
            data: body
        })
        return NextResponse.json(property)
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return NextResponse.json({ error: error.message, code: 'UNAUTHORIZED' }, { status: 401 })
        }
        if (error instanceof ForbiddenError) {
            return NextResponse.json({ error: error.message, code: 'FORBIDDEN' }, { status: 403 })
        }
        console.error('Error creating property:', error)
        return NextResponse.json({ error: 'Failed to create property', details: String(error) }, { status: 500 })
    }
}
