import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface SearchParams {
    q?: string
    area?: string
    propertyType?: string
    minPrice?: string
    maxPrice?: string
    bedrooms?: string
    bathrooms?: string
    status?: string
    minSize?: string
    maxSize?: string
    page?: string
    limit?: string
    sort?: string
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)

        // Extract query parameters
        const q = searchParams.get('q')?.trim() || ''
        const area = searchParams.get('area')
        const propertyType = searchParams.get('propertyType')
        const minPrice = searchParams.get('minPrice')
        const maxPrice = searchParams.get('maxPrice')
        const bedrooms = searchParams.get('bedrooms')
        const bathrooms = searchParams.get('bathrooms')
        const status = searchParams.get('status') || 'AVAILABLE'
        const minSize = searchParams.get('minSize')
        const maxSize = searchParams.get('maxSize')
        const page = parseInt(searchParams.get('page') || '1', 10)
        const limit = Math.min(parseInt(searchParams.get('limit') || '12', 10), 50)
        const sort = searchParams.get('sort') || 'relevance'

        // Input validation
        if (q.length > 200) {
            return NextResponse.json(
                { success: false, error: { code: 'INVALID_PARAMETER', message: 'Search query too long (max 200 characters)' } },
                { status: 400 }
            )
        }

        if (page < 1 || limit < 1) {
            return NextResponse.json(
                { success: false, error: { code: 'INVALID_PARAMETER', message: 'Page and limit must be positive integers' } },
                { status: 400 }
            )
        }

        // Build filter conditions
        const where: any = {}

        // Status filter
        if (status && status !== 'ALL') {
            where.status = status
        }

        // Area filter
        if (area && area !== 'ALL') {
            where.area = area
        }

        // Property type filter
        if (propertyType && propertyType !== 'ALL') {
            where.propertyType = propertyType
        }

        // Price range filter
        if (minPrice || maxPrice) {
            where.price = {}
            if (minPrice) {
                const minPriceNum = parseFloat(minPrice)
                if (isNaN(minPriceNum) || minPriceNum < 0) {
                    return NextResponse.json(
                        { success: false, error: { code: 'INVALID_PARAMETER', message: 'minPrice must be a positive number', field: 'minPrice' } },
                        { status: 400 }
                    )
                }
                where.price.gte = minPriceNum
            }
            if (maxPrice) {
                const maxPriceNum = parseFloat(maxPrice)
                if (isNaN(maxPriceNum) || maxPriceNum < 0) {
                    return NextResponse.json(
                        { success: false, error: { code: 'INVALID_PARAMETER', message: 'maxPrice must be a positive number', field: 'maxPrice' } },
                        { status: 400 }
                    )
                }
                where.price.lte = maxPriceNum
            }
        }

        // Bedroom filter
        if (bedrooms) {
            const bedroomsNum = parseInt(bedrooms, 10)
            if (isNaN(bedroomsNum) || bedroomsNum < 0) {
                return NextResponse.json(
                    { success: false, error: { code: 'INVALID_PARAMETER', message: 'bedrooms must be a positive integer' } },
                    { status: 400 }
                )
            }
            // Handle "5+" case
            if (bedroomsNum >= 5) {
                where.bedrooms = { gte: 5 }
            } else {
                where.bedrooms = bedroomsNum
            }
        }

        // Bathroom filter
        if (bathrooms) {
            const bathroomsNum = parseInt(bathrooms, 10)
            if (isNaN(bathroomsNum) || bathroomsNum < 0) {
                return NextResponse.json(
                    { success: false, error: { code: 'INVALID_PARAMETER', message: 'bathrooms must be a positive integer' } },
                    { status: 400 }
                )
            }
            // Handle "4+" case
            if (bathroomsNum >= 4) {
                where.bathrooms = { gte: 4 }
            } else {
                where.bathrooms = bathroomsNum
            }
        }

        // Size range filter
        if (minSize || maxSize) {
            where.size = {}
            if (minSize) {
                where.size.gte = parseFloat(minSize)
            }
            if (maxSize) {
                where.size.lte = parseFloat(maxSize)
            }
        }

        let properties: any[] = []
        let total = 0

        // If there's a search query, use text search
        if (q) {
            // Try fuzzy search with pg_trgm first
            try {
                // Build WHERE clause for filters in raw SQL
                const filterClauses: string[] = []
                const filterParams: any[] = [q]
                let paramIndex = 2

                if (where.status) {
                    filterClauses.push(`status = $${paramIndex}`)
                    filterParams.push(where.status)
                    paramIndex++
                }
                if (where.area) {
                    filterClauses.push(`area = $${paramIndex}`)
                    filterParams.push(where.area)
                    paramIndex++
                }
                if (where.propertyType) {
                    filterClauses.push(`"propertyType" = $${paramIndex}`)
                    filterParams.push(where.propertyType)
                    paramIndex++
                }
                if (where.price?.gte) {
                    filterClauses.push(`price >= $${paramIndex}`)
                    filterParams.push(where.price.gte)
                    paramIndex++
                }
                if (where.price?.lte) {
                    filterClauses.push(`price <= $${paramIndex}`)
                    filterParams.push(where.price.lte)
                    paramIndex++
                }
                if (where.bedrooms) {
                    if (typeof where.bedrooms === 'object' && where.bedrooms.gte) {
                        filterClauses.push(`bedrooms >= $${paramIndex}`)
                        filterParams.push(where.bedrooms.gte)
                    } else {
                        filterClauses.push(`bedrooms = $${paramIndex}`)
                        filterParams.push(where.bedrooms)
                    }
                    paramIndex++
                }
                if (where.bathrooms) {
                    if (typeof where.bathrooms === 'object' && where.bathrooms.gte) {
                        filterClauses.push(`bathrooms >= $${paramIndex}`)
                        filterParams.push(where.bathrooms.gte)
                    } else {
                        filterClauses.push(`bathrooms = $${paramIndex}`)
                        filterParams.push(where.bathrooms)
                    }
                    paramIndex++
                }
                if (where.size?.gte) {
                    filterClauses.push(`size >= $${paramIndex}`)
                    filterParams.push(where.size.gte)
                    paramIndex++
                }
                if (where.size?.lte) {
                    filterClauses.push(`size <= $${paramIndex}`)
                    filterParams.push(where.size.lte)
                    paramIndex++
                }

                const whereClause = filterClauses.length > 0 ? `AND ${filterClauses.join(' AND ')}` : ''

                // Fuzzy search with similarity scoring
                const fuzzyQuery = `
          SELECT 
            id, title, description, price, location, area, bedrooms, bathrooms,
            "propertyType", status, size, "frontSize", "backSize", images,
            "ownerName", "ownerPhone", "createdAt", "updatedAt",
            GREATEST(
              similarity(title, $1),
              similarity(location, $1),
              similarity(area, $1),
              similarity(description, $1) * 0.5
            ) as relevance
          FROM "Property"
          WHERE (
            similarity(title, $1) > 0.2
            OR similarity(location, $1) > 0.2
            OR similarity(area, $1) > 0.2
            OR similarity(description, $1) > 0.15
          )
          ${whereClause}
          ORDER BY relevance DESC
          LIMIT ${limit}
          OFFSET ${(page - 1) * limit}
        `

                properties = await prisma.$queryRawUnsafe(fuzzyQuery, ...filterParams)

                // Get total count for pagination
                const countQuery = `
          SELECT COUNT(*) as count
          FROM "Property"
          WHERE (
            similarity(title, $1) > 0.2
            OR similarity(location, $1) > 0.2
            OR similarity(area, $1) > 0.2
            OR similarity(description, $1) > 0.15
          )
          ${whereClause}
        `
                const countResult: any = await prisma.$queryRawUnsafe(countQuery, ...filterParams)
                total = parseInt(countResult[0]?.count || '0', 10)

            } catch (error: any) {
                // Fallback to basic ILIKE search if pg_trgm is not available
                console.warn('Fuzzy search unavailable, falling back to ILIKE:', error.message)

                where.OR = [
                    { title: { contains: q, mode: 'insensitive' } },
                    { location: { contains: q, mode: 'insensitive' } },
                    { area: { contains: q, mode: 'insensitive' } },
                    { description: { contains: q, mode: 'insensitive' } }
                ]

                const [items, count] = await Promise.all([
                    prisma.property.findMany({
                        where,
                        orderBy: sort === 'newest' ? { createdAt: 'desc' } :
                            sort === 'oldest' ? { createdAt: 'asc' } :
                                sort === 'price_asc' ? { price: 'asc' } :
                                    sort === 'price_desc' ? { price: 'desc' } :
                                        sort === 'size_asc' ? { size: 'asc' } :
                                            sort === 'size_desc' ? { size: 'desc' } :
                                                { createdAt: 'desc' },
                        skip: (page - 1) * limit,
                        take: limit
                    }),
                    prisma.property.count({ where })
                ])

                properties = items
                total = count
            }
        } else {
            // No search query, just apply filters
            const orderBy =
                sort === 'newest' ? { createdAt: 'desc' as const } :
                    sort === 'oldest' ? { createdAt: 'asc' as const } :
                        sort === 'price_asc' ? { price: 'asc' as const } :
                            sort === 'price_desc' ? { price: 'desc' as const } :
                                sort === 'size_asc' ? { size: 'asc' as const } :
                                    sort === 'size_desc' ? { size: 'desc' as const } :
                                        { createdAt: 'desc' as const }

            const [items, count] = await Promise.all([
                prisma.property.findMany({
                    where,
                    orderBy,
                    skip: (page - 1) * limit,
                    take: limit
                }),
                prisma.property.count({ where })
            ])

            properties = items
            total = count
        }

        // Calculate pagination info
        const totalPages = Math.ceil(total / limit)
        const hasNext = page < totalPages
        const hasPrev = page > 1

        // Build response
        return NextResponse.json({
            success: true,
            data: {
                properties,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages,
                    hasNext,
                    hasPrev
                },
                query: {
                    q: q || undefined,
                    filters: {
                        area: area && area !== 'ALL' ? area : undefined,
                        propertyType: propertyType && propertyType !== 'ALL' ? propertyType : undefined,
                        minPrice: minPrice ? parseFloat(minPrice) : undefined,
                        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
                        bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
                        bathrooms: bathrooms ? parseInt(bathrooms, 10) : undefined,
                        status: status !== 'ALL' ? status : undefined
                    }
                }
            }
        })

    } catch (error) {
        console.error('Search API error:', error)
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'An error occurred while searching properties'
                }
            },
            { status: 500 }
        )
    }
}
