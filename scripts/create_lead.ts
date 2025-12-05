import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        const lead = await prisma.lead.create({
            data: {
                name: 'Script User',
                phone: '5556667777',
                purpose: 'Buy',
                notes: 'Created via script',
                status: 'NEW'
            }
        })
        console.log('Created lead:', lead)
    } catch (e) {
        console.error('Error creating lead:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
