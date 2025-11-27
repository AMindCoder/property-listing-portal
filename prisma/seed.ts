import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Clear existing data
    await prisma.property.deleteMany()

    const properties = [
        {
            title: 'Modern Apartment in City Center',
            description: 'A beautiful 2-bedroom apartment with city views and modern amenities. Located in the heart of downtown with easy access to public transportation.',
            price: 250000,
            location: 'New York, NY',
            bedrooms: 2,
            bathrooms: 2,
            propertyType: 'Apartment',
            status: 'AVAILABLE',
            imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop',
        },
        {
            title: 'Cozy Family House',
            description: 'Spacious 3-bedroom house with a beautiful backyard garden. Perfect for families looking for a peaceful suburban lifestyle.',
            price: 450000,
            location: 'Austin, TX',
            bedrooms: 3,
            bathrooms: 2,
            propertyType: 'House',
            status: 'AVAILABLE',
            imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&h=400&fit=crop',
        },
        {
            title: 'Luxury Villa',
            description: '5-bedroom villa with private pool, home theater, and panoramic mountain views. The epitome of luxury living.',
            price: 1200000,
            location: 'Los Angeles, CA',
            bedrooms: 5,
            bathrooms: 4,
            propertyType: 'House',
            status: 'SOLD',
            imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop',
        },
        {
            title: 'Downtown Studio',
            description: 'Compact studio apartment near subway station. Ideal for young professionals or students.',
            price: 150000,
            location: 'Chicago, IL',
            bedrooms: 1,
            bathrooms: 1,
            propertyType: 'Apartment',
            status: 'AVAILABLE',
            imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop',
        },
        {
            title: 'Suburban Home',
            description: 'Quiet neighborhood with excellent schools nearby. 4-bedroom house with renovated kitchen and finished basement.',
            price: 350000,
            location: 'Seattle, WA',
            bedrooms: 4,
            bathrooms: 3,
            propertyType: 'House',
            status: 'SOLD',
            imageUrl: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600&h=400&fit=crop',
        },
        {
            title: 'Beachfront Condo',
            description: 'Stunning oceanfront views from this 2-bedroom condo. Wake up to the sound of waves every morning.',
            price: 675000,
            location: 'Miami, FL',
            bedrooms: 2,
            bathrooms: 2,
            propertyType: 'Apartment',
            status: 'AVAILABLE',
            imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop',
        },
        {
            title: 'Mountain Retreat',
            description: 'Secluded 3-bedroom cabin surrounded by nature. Perfect weekend getaway with hiking trails nearby.',
            price: 385000,
            location: 'Denver, CO',
            bedrooms: 3,
            bathrooms: 2,
            propertyType: 'House',
            status: 'AVAILABLE',
            imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&h=400&fit=crop',
        },
        {
            title: 'Historic Brownstone',
            description: 'Beautifully preserved 19th-century brownstone with original hardwood floors and crown molding.',
            price: 890000,
            location: 'Boston, MA',
            bedrooms: 4,
            bathrooms: 3,
            propertyType: 'House',
            status: 'AVAILABLE',
            imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop',
        },
        {
            title: 'Penthouse Suite',
            description: 'Top-floor penthouse with 360-degree city views. Features private elevator access and rooftop terrace.',
            price: 1850000,
            location: 'San Francisco, CA',
            bedrooms: 3,
            bathrooms: 3,
            propertyType: 'Apartment',
            status: 'SOLD',
            imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop',
        },
        {
            title: 'Lakeside Cottage',
            description: 'Charming 2-bedroom cottage with private dock. Perfect for fishing and water sports enthusiasts.',
            price: 275000,
            location: 'Portland, OR',
            bedrooms: 2,
            bathrooms: 1,
            propertyType: 'House',
            status: 'AVAILABLE',
            imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop',
        },
        {
            title: 'Urban Loft',
            description: 'Open-concept industrial loft in revitalized warehouse district. High ceilings and exposed brick.',
            price: 425000,
            location: 'Philadelphia, PA',
            bedrooms: 2,
            bathrooms: 2,
            propertyType: 'Apartment',
            status: 'AVAILABLE',
            imageUrl: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=600&h=400&fit=crop',
        },
        {
            title: 'Ranch Estate',
            description: '10-acre ranch property with main house and guest cottage. Includes barn and pasture land.',
            price: 950000,
            location: 'Dallas, TX',
            bedrooms: 5,
            bathrooms: 4,
            propertyType: 'House',
            status: 'AVAILABLE',
            imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop',
        },
        {
            title: 'Garden Apartment',
            description: 'Ground-floor apartment with private patio and community garden access. Pet-friendly building.',
            price: 195000,
            location: 'Nashville, TN',
            bedrooms: 1,
            bathrooms: 1,
            propertyType: 'Apartment',
            status: 'AVAILABLE',
            imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop',
        },
        {
            title: 'Smart Home Villa',
            description: 'Fully automated smart home with solar panels, EV charging, and energy-efficient systems.',
            price: 825000,
            location: 'Phoenix, AZ',
            bedrooms: 4,
            bathrooms: 3,
            propertyType: 'House',
            status: 'SOLD',
            imageUrl: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&h=400&fit=crop',
        },
        {
            title: 'Victorian Manor',
            description: 'Restored Victorian-era mansion with turret, wraparound porch, and original stained glass.',
            price: 1100000,
            location: 'Portland, ME',
            bedrooms: 6,
            bathrooms: 4,
            propertyType: 'House',
            status: 'AVAILABLE',
            imageUrl: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=600&h=400&fit=crop',
        },
        {
            title: 'Minimalist Townhouse',
            description: 'Contemporary 3-story townhouse with sleek design and premium finishes. Walk to shops and cafes.',
            price: 535000,
            location: 'Minneapolis, MN',
            bedrooms: 3,
            bathrooms: 2,
            propertyType: 'House',
            status: 'AVAILABLE',
            imageUrl: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&h=400&fit=crop',
        },
        {
            title: 'Eco-Friendly Home',
            description: 'LEED-certified home with rainwater collection, geothermal heating, and native landscaping.',
            price: 465000,
            location: 'Boulder, CO',
            bedrooms: 3,
            bathrooms: 2,
            propertyType: 'House',
            status: 'AVAILABLE',
            imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&h=400&fit=crop',
        },
        {
            title: 'Skyline View Apartment',
            description: 'High-rise apartment with floor-to-ceiling windows and stunning city skyline views.',
            price: 380000,
            location: 'Atlanta, GA',
            bedrooms: 2,
            bathrooms: 2,
            propertyType: 'Apartment',
            status: 'SOLD',
            imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&h=400&fit=crop',
        },
    ]

    for (const p of properties) {
        await prisma.property.create({
            data: p,
        })
    }

    console.log(`Seeded ${properties.length} properties`)
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
