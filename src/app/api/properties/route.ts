import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

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

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const property = await prisma.property.create({
            data: body
        })
        return NextResponse.json(property)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create property' }, { status: 500 })
    }
}
