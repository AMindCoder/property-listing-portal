# Search Feature Spec 5: Search API & Backend

## Overview

Backend API specification for the property search functionality, including endpoint design, query handling, database optimization, and response formats.

---

## Goals

1. Define clear API contracts for search functionality
2. Ensure efficient database queries for fast response
3. Support all search and filter combinations
4. Enable future extensibility without breaking changes
5. Maintain consistency with existing API patterns

---

## Technical Approach

**Database:**
- PostgreSQL with Prisma ORM
- pg_trgm extension for fuzzy matching
- GIN indexes for text search performance

**Query Strategy:**
- Primary: Prisma `contains` with `mode: 'insensitive'`
- Enhanced: Raw SQL with pg_trgm `similarity()` function
- Combined: Text search + filter conditions in single query

**Caching:**
- Optional: Cache distinct areas/types (rarely change)
- No caching for search results (real-time data)

---

## Functional Requirements

### FR-1: Search API Endpoint

Primary search endpoint specification.

| Attribute | Value |
|-----------|-------|
| Method | GET |
| Path | `/api/properties/search` |
| Content-Type | application/json |
| Authentication | None (public endpoint) |

### FR-2: Query Parameters

All supported query parameters.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| q | string | No | - | Search query text |
| area | string | No | - | Filter by area |
| propertyType | string | No | - | Filter by type (Plot, House, Flat, Rental) |
| minPrice | number | No | - | Minimum price |
| maxPrice | number | No | - | Maximum price |
| bedrooms | number | No | - | Number of bedrooms (5 = 5+) |
| bathrooms | number | No | - | Number of bathrooms |
| status | string | No | AVAILABLE | Property status |
| minSize | number | No | - | Minimum size (sq ft) |
| maxSize | number | No | - | Maximum size (sq ft) |
| page | number | No | 1 | Page number |
| limit | number | No | 12 | Results per page (max 50) |
| sort | string | No | relevance | Sort order |

### FR-3: Search Query Processing

How search text should be processed.

| Processing | Description |
|------------|-------------|
| Trim whitespace | Remove leading/trailing spaces |
| Normalize case | Convert to lowercase for matching |
| Split words | Optional: search each word independently |
| Special chars | Escape or remove SQL-unsafe characters |
| Min length | No minimum (search from 1 char) |
| Max length | 200 characters |

### FR-4: Search Fields & Weights

Fields to search with relative importance.

| Field | Weight | Match Type |
|-------|--------|------------|
| title | 1.0 | Contains + similarity |
| location | 0.9 | Contains + similarity |
| area | 0.9 | Contains + similarity |
| description | 0.5 | Contains only |
| propertyType | 0.3 | Exact or contains |

### FR-5: Response Format

Standard response structure.

```json
{
  "success": true,
  "data": {
    "properties": [...],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 12,
      "totalPages": 4,
      "hasNext": true,
      "hasPrev": false
    },
    "query": {
      "q": "villa",
      "filters": {
        "area": "Ganganagar",
        "minPrice": 5000000
      }
    }
  }
}
```

### FR-6: Property Object in Response

Each property in results.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Property UUID |
| title | string | Property title |
| description | string | Full description |
| price | number | Price in INR |
| location | string | Address/location |
| area | string | Neighborhood/area |
| bedrooms | number | Bedroom count |
| bathrooms | number | Bathroom count |
| propertyType | string | Type of property |
| status | string | AVAILABLE/SOLD |
| size | number | Size in sq ft |
| images | string[] | Image URLs |
| createdAt | string | ISO timestamp |
| _relevance | number | Optional: relevance score |
| _matchedFields | string[] | Optional: which fields matched |

### FR-7: Error Response Format

Error response structure.

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "minPrice must be a positive number",
    "field": "minPrice"
  }
}
```

### FR-8: Sorting Options

Available sort options.

| Value | Description |
|-------|-------------|
| relevance | Best match first (default for search) |
| newest | Most recent first |
| oldest | Oldest first |
| price_asc | Price low to high |
| price_desc | Price high to low |
| size_asc | Size small to large |
| size_desc | Size large to small |

### FR-9: Suggestions Endpoint

Endpoint for autocomplete suggestions.

| Attribute | Value |
|-----------|-------|
| Method | GET |
| Path | `/api/properties/suggestions` |
| Parameters | q (required), limit (default: 10) |

**Response:**
```json
{
  "success": true,
  "data": {
    "areas": ["Ganganagar", "Gandhi Nagar"],
    "types": ["House"],
    "properties": [
      { "id": "...", "title": "..." }
    ]
  }
}
```

### FR-10: Areas Endpoint

Endpoint for filter dropdown options.

| Attribute | Value |
|-----------|-------|
| Method | GET |
| Path | `/api/areas` |
| Parameters | None |

**Response:**
```json
{
  "success": true,
  "data": ["Area 1", "Area 2", "Area 3"]
}
```

---

## Database Requirements

### DB-1: pg_trgm Extension

Enable fuzzy search capability.

| Requirement | Description |
|-------------|-------------|
| Extension | CREATE EXTENSION IF NOT EXISTS pg_trgm |
| When | Run once on database setup |
| Vercel Postgres | Should be available by default |

### DB-2: Indexes for Search

Indexes to optimize search performance.

| Index | Fields | Type | Purpose |
|-------|--------|------|---------|
| idx_property_title_trgm | title | GIN (gin_trgm_ops) | Fuzzy title search |
| idx_property_location_trgm | location | GIN (gin_trgm_ops) | Fuzzy location search |
| idx_property_area | area | B-tree | Area filter |
| idx_property_price | price | B-tree | Price range filter |
| idx_property_status | status | B-tree | Status filter |
| idx_property_created | createdAt | B-tree DESC | Sort by date |

### DB-3: Prisma Schema Updates

No schema changes required, only raw SQL for pg_trgm queries.

---

## Non-Functional Requirements

### NFR-1: Performance

| Metric | Target |
|--------|--------|
| Response time (p50) | < 100ms |
| Response time (p95) | < 300ms |
| Response time (p99) | < 500ms |
| Max concurrent requests | Handle Vercel serverless limits |

### NFR-2: Rate Limiting

| Limit | Value |
|-------|-------|
| Requests per minute | 60 per IP (suggested) |
| Burst limit | 10 requests |
| Response on limit | 429 Too Many Requests |

### NFR-3: Input Validation

| Validation | Rule |
|------------|------|
| q | Max 200 chars, sanitized |
| page | Positive integer, max 100 |
| limit | 1-50, integer |
| minPrice/maxPrice | Positive numbers |
| bedrooms/bathrooms | Positive integers |

### NFR-4: Security

| Requirement | Implementation |
|-------------|----------------|
| SQL Injection | Parameterized queries only |
| XSS | Sanitize output |
| Input validation | Strict type checking |
| Error messages | No internal details exposed |

---

## Out of Scope

- Full Elasticsearch integration
- Search analytics/logging
- A/B testing for search algorithms
- Personalized search results
- Geo-spatial queries

---

## Dependencies

- PostgreSQL database
- pg_trgm extension availability
- Prisma ORM
- Existing Property model

---

## Validation & Test Cases (P0 - MVP)

### TC-1: Basic Search Endpoint

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-1.1: Endpoint exists | 1. GET /api/properties/search | 200 response |
| TC-1.2: Empty search | 1. GET without params | All properties returned |
| TC-1.3: Search with q | 1. GET ?q=villa | Matching properties returned |
| TC-1.4: Response format | 1. Any search | Response matches spec format |

### TC-2: Text Search

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-2.1: Title match | 1. Search property title | Property in results |
| TC-2.2: Location match | 1. Search location | Properties at location |
| TC-2.3: Area match | 1. Search area name | Properties in area |
| TC-2.4: Description match | 1. Search description term | Properties with term |
| TC-2.5: Case insensitive | 1. Search "VILLA" | Same as "villa" |
| TC-2.6: Partial match | 1. Search "vil" | Matches "villa" |

### TC-3: Fuzzy/Typo Matching

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-3.1: Missing letter | 1. Search "vila" | Matches "villa" |
| TC-3.2: Extra letter | 1. Search "villla" | Matches "villa" |
| TC-3.3: Swapped letters | 1. Search "vlila" | Matches "villa" |
| TC-3.4: Similarity threshold | 1. Search with typo | Only reasonably similar matches |

### TC-4: Filter Parameters

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-4.1: Area filter | 1. ?area=Ganganagar | Only Ganganagar properties |
| TC-4.2: Property type | 1. ?propertyType=House | Only houses |
| TC-4.3: Min price | 1. ?minPrice=5000000 | Price >= 5000000 |
| TC-4.4: Max price | 1. ?maxPrice=10000000 | Price <= 10000000 |
| TC-4.5: Price range | 1. ?minPrice=X&maxPrice=Y | Within range |
| TC-4.6: Bedrooms | 1. ?bedrooms=3 | 3-bedroom properties |
| TC-4.7: Bathrooms | 1. ?bathrooms=2 | 2-bathroom properties |
| TC-4.8: Status | 1. ?status=SOLD | Only sold properties |

### TC-5: Combined Search + Filters

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-5.1: Search + area | 1. ?q=villa&area=X | Villas in area X |
| TC-5.2: Search + price | 1. ?q=villa&maxPrice=Y | Villas under Y |
| TC-5.3: Search + multiple | 1. ?q=villa&area=X&bedrooms=3 | 3-bed villas in X |
| TC-5.4: All filters | 1. All params set | Matches all criteria |

### TC-6: Pagination

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-6.1: Default page | 1. No page param | Page 1 returned |
| TC-6.2: Specific page | 1. ?page=2 | Page 2 results |
| TC-6.3: Custom limit | 1. ?limit=24 | 24 results returned |
| TC-6.4: Pagination info | 1. Any request | Pagination object in response |
| TC-6.5: hasNext/hasPrev | 1. Check middle page | Both flags correct |
| TC-6.6: Beyond last page | 1. ?page=999 | Empty results, valid response |

### TC-7: Sorting

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-7.1: Default sort | 1. Search with q | Sorted by relevance |
| TC-7.2: Newest first | 1. ?sort=newest | Most recent first |
| TC-7.3: Price ascending | 1. ?sort=price_asc | Lowest price first |
| TC-7.4: Price descending | 1. ?sort=price_desc | Highest price first |

### TC-8: Suggestions Endpoint

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-8.1: Endpoint exists | 1. GET /api/properties/suggestions?q=a | 200 response |
| TC-8.2: Areas returned | 1. Search area prefix | Matching areas in response |
| TC-8.3: Types returned | 1. Search type prefix | Matching types in response |
| TC-8.4: Properties returned | 1. Search title prefix | Matching property titles |
| TC-8.5: Limit respected | 1. ?q=a&limit=5 | Max 5 suggestions per category |

### TC-9: Input Validation

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-9.1: Invalid page | 1. ?page=-1 | 400 error |
| TC-9.2: Invalid limit | 1. ?limit=1000 | Error or capped at 50 |
| TC-9.3: Invalid price | 1. ?minPrice=abc | 400 error |
| TC-9.4: Long query | 1. ?q=[201 chars] | Error or truncated |
| TC-9.5: SQL injection | 1. ?q='; DROP TABLE-- | Safely handled, no error |

### TC-10: Error Handling

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-10.1: Error format | 1. Trigger error | Error matches spec format |
| TC-10.2: No stack trace | 1. Cause server error | No internal details exposed |
| TC-10.3: Graceful degradation | 1. pg_trgm unavailable | Falls back to ILIKE |

### TC-11: Performance

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-11.1: Response time | 1. Search 2. Measure | < 300ms |
| TC-11.2: Concurrent requests | 1. 10 simultaneous requests | All succeed |
| TC-11.3: Large result set | 1. Search returning 100+ | Paginated, fast response |

### TC-12: Areas Endpoint

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-12.1: Get areas | 1. GET /api/areas | List of distinct areas |
| TC-12.2: Sorted | 1. Check response | Areas alphabetically sorted |
| TC-12.3: No duplicates | 1. Check response | Each area unique |

---

## Migration Steps

1. Enable pg_trgm extension on database
2. Create GIN indexes for text search
3. Implement search endpoint with Prisma + raw SQL
4. Add input validation and error handling
5. Implement suggestions endpoint
6. Test performance and optimize queries

---

## Success Criteria

1. Search API responds within 300ms for 95% of requests
2. Typo tolerance works for common misspellings
3. All filter combinations work correctly
4. Pagination handles large result sets efficiently
5. API is secure against injection attacks
6. Error responses are informative but safe
