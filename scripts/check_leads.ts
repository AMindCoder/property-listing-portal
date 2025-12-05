import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        const leads = await prisma.lead.findMany()
        console.log('Leads in DB:', leads)
    } catch (e) {
        console.error('Error fetching leads:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
