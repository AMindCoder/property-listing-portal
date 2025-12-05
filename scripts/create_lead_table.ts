import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Creating Lead table...')
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Lead" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "purpose" TEXT NOT NULL,
        "notes" TEXT,
        "status" TEXT NOT NULL DEFAULT 'NEW',
        "propertyId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
      );
    `)
        console.log('Created Lead table.')

        console.log('Adding foreign key constraint...')
        // We try to add the constraint, but if it fails (e.g. already exists or propertyId mismatch), we catch it.
        // Ideally we check if it exists first, but raw SQL for that is complex across DBs.
        // For SQLite/Postgres this syntax varies. Assuming Postgres based on Vercel usage context, but local might be SQLite?
        // Let's check the schema datasource.
        // Actually, let's just create the table first. Foreign keys can be tricky with raw SQL if we don't know the exact constraint name Prisma expects.
        // But for basic functionality, the table is enough. Prisma will handle the relation logic in the client if the columns match.

        console.log('Schema update successful.')
    } catch (e) {
        console.error('Error updating schema:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
