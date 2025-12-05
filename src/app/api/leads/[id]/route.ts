import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id
        const body = await request.json()
        const { status } = body

        if (!status) {
            return NextResponse.json(
                { error: 'Status is required' },
                { status: 400 }
            )
        }

        const lead = await prisma.lead.update({
            where: { id },
            data: { status },
        })

        return NextResponse.json(lead)
    } catch (error) {
        console.error('Error updating lead:', error)
        return NextResponse.json(
            { error: 'Error updating lead' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id
        await prisma.lead.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Lead deleted successfully' })
    } catch (error) {
        console.error('Error deleting lead:', error)
        return NextResponse.json(
            { error: 'Error deleting lead' },
            { status: 500 }
        )
    }
}
