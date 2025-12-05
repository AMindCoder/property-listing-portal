import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const leads = await prisma.lead.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                property: {
                    select: {
                        title: true,
                        location: true
                    }
                }
            }
        })
        return NextResponse.json(leads)
    } catch (error) {
        console.error('Error fetching leads:', error)
        return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()

        const lead = await prisma.lead.create({
            data: {
                name: body.name,
                phone: body.phone,
                purpose: body.purpose,
                notes: body.notes,
                propertyId: body.propertyId || null,
                status: 'NEW'
            }
        })

        return NextResponse.json(lead)
    } catch (error) {
        console.error('Error creating lead:', error)
        return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
    }
}
