import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, UnauthorizedError, ForbiddenError } from '@/lib/auth'

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Require admin access for updating leads
        await requireAdmin()

        const { id } = await params
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
        if (error instanceof UnauthorizedError) {
            return NextResponse.json({ error: error.message, code: 'UNAUTHORIZED' }, { status: 401 })
        }
        if (error instanceof ForbiddenError) {
            return NextResponse.json({ error: error.message, code: 'FORBIDDEN' }, { status: 403 })
        }
        console.error('Error updating lead:', error)
        return NextResponse.json(
            { error: 'Error updating lead' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Require admin access for deleting leads
        await requireAdmin()

        const { id } = await params
        await prisma.lead.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Lead deleted successfully' })
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            return NextResponse.json({ error: error.message, code: 'UNAUTHORIZED' }, { status: 401 })
        }
        if (error instanceof ForbiddenError) {
            return NextResponse.json({ error: error.message, code: 'FORBIDDEN' }, { status: 403 })
        }
        console.error('Error deleting lead:', error)
        return NextResponse.json(
            { error: 'Error deleting lead' },
            { status: 500 }
        )
    }
}
