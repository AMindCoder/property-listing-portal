import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Adding ownerName column...')
        await prisma.$executeRawUnsafe(`ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "ownerName" TEXT;`)
        console.log('Added ownerName.')

        console.log('Adding ownerPhone column...')
        await prisma.$executeRawUnsafe(`ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "ownerPhone" TEXT;`)
        console.log('Added ownerPhone.')

        console.log('Schema update successful.')
    } catch (e) {
        console.error('Error updating schema:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
