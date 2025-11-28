import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
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
