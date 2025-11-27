import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const properties = [
        {
            title: 'Modern Apartment in City Center',
            description: 'A beautiful 2-bedroom apartment with city views.',
            price: 250000,
            location: 'New York, NY',
            bedrooms: 2,
            bathrooms: 2,
            propertyType: 'Apartment',
            status: 'AVAILABLE',
            imageUrl: 'https://placehold.co/600x400',
        },
        {
            title: 'Cozy Family House',
            description: 'Spacious 3-bedroom house with a garden.',
            price: 450000,
            location: 'Austin, TX',
            bedrooms: 3,
            bathrooms: 2,
            propertyType: 'House',
            status: 'AVAILABLE',
            imageUrl: 'https://placehold.co/600x400',
        },
        {
            title: 'Luxury Villa',
            description: '5-bedroom villa with pool.',
            price: 1200000,
            location: 'Los Angeles, CA',
            bedrooms: 5,
            bathrooms: 4,
            propertyType: 'House',
            status: 'SOLD',
            imageUrl: 'https://placehold.co/600x400',
        },
        {
            title: 'Downtown Studio',
            description: 'Compact studio near subway.',
            price: 150000,
            location: 'Chicago, IL',
            bedrooms: 1,
            bathrooms: 1,
            propertyType: 'Apartment',
            status: 'AVAILABLE',
            imageUrl: 'https://placehold.co/600x400',
        },
        {
            title: 'Suburban Home',
            description: 'Quiet neighborhood, great schools.',
            price: 350000,
            location: 'Seattle, WA',
            bedrooms: 4,
            bathrooms: 3,
            propertyType: 'House',
            status: 'SOLD',
            imageUrl: 'https://placehold.co/600x400',
        }
    ]

    for (const p of properties) {
        await prisma.property.create({
            data: p,
        })
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
