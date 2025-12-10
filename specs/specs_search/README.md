# Search Feature Specifications

## Overview

This folder contains detailed specifications for implementing the property search feature for the Property Listing Portal. The search functionality enables users to find properties through free-text search with typo tolerance, combined with structured filters.

---

## Technical Approach Summary

| Aspect | Choice | Rationale |
|--------|--------|-----------|
| **Database** | PostgreSQL (existing) | Zero additional cost |
| **Primary Search** | Prisma `contains` with `mode: 'insensitive'` | Simple ILIKE search |
| **Fuzzy Search** | PostgreSQL `pg_trgm` extension | Typo tolerance without new infrastructure |
| **Data Sync** | Real-time | No ETL, same database |
| **Hosting** | Vercel (existing) | No new services |

---

## Specification Index

| Spec | Title | Focus Area |
|------|-------|------------|
| [Spec 1](./Search_Feature_Spec_1.md) | Search Bar & Text Search | Core search input, debouncing, basic + fuzzy matching |
| [Spec 2](./Search_Feature_Spec_2.md) | Search Suggestions & Autocomplete | Dropdown suggestions, recent searches, keyboard navigation |
| [Spec 3](./Search_Feature_Spec_3.md) | Advanced Filters Integration | Price, beds, baths, type, area filters with search |
| [Spec 4](./Search_Feature_Spec_4.md) | Search Results & Relevance | Result display, ordering, pagination, empty states |
| [Spec 5](./Search_Feature_Spec_5.md) | Search API & Backend | API endpoints, database optimization, response formats |

---

## Test Case Summary

| Spec | Test Groups | P0 Test Cases |
|------|-------------|---------------|
| Spec 1 | 10 | 35 |
| Spec 2 | 11 | 38 |
| Spec 3 | 12 | 40 |
| Spec 4 | 12 | 42 |
| Spec 5 | 12 | 45 |
| **Total** | **57** | **200** |

---

## User Stories Covered

1. **As a buyer**, I want to search for properties by typing any text so I can find relevant listings quickly.
2. **As a buyer**, I want search to tolerate my typos so I don't miss properties due to misspellings.
3. **As a buyer**, I want to see suggestions as I type so I can search more efficiently.
4. **As a buyer**, I want to combine text search with filters so I can narrow down to exactly what I need.
5. **As a buyer**, I want results ordered by relevance so the best matches appear first.
6. **As a mobile user**, I want search to work well on my phone with touch-friendly controls.
7. **As a user**, I want to share a search URL so others see the same results.

---

## Implementation Priority

### Phase 1: MVP (Essential)
1. Basic search bar with debouncing
2. Multi-field ILIKE search (title, location, area)
3. Search + existing filters combination
4. Result count and basic pagination
5. Mobile-responsive search UI

### Phase 2: Enhanced (Recommended)
1. pg_trgm fuzzy matching
2. Autocomplete suggestions dropdown
3. Recent searches (localStorage)
4. Match highlighting in results
5. URL state management

### Phase 3: Polish (Nice to Have)
1. Relevance scoring and ordering
2. "No results" suggestions
3. Keyboard shortcuts
4. Search analytics

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| PostgreSQL | ✅ Available | Vercel Postgres |
| Prisma ORM | ✅ Available | Existing setup |
| pg_trgm extension | 🔶 To enable | One-time SQL command |
| GIN indexes | 🔶 To create | Migration required |
| React components | ✅ Available | Existing UI patterns |

---

## Files to Create/Modify

### New Files
```
src/
├── components/
│   └── search/
│       ├── SearchBar.tsx
│       ├── SearchSuggestions.tsx
│       ├── SearchFilters.tsx
│       └── SearchResults.tsx
├── hooks/
│   ├── useSearch.ts
│   └── useDebounce.ts
└── app/
    └── api/
        └── properties/
            ├── search/
            │   └── route.ts
            └── suggestions/
                └── route.ts
```

### Modified Files
```
src/
├── app/
│   └── page.tsx (integrate search)
├── prisma/
│   └── migrations/ (add indexes)
└── lib/
    └── prisma.ts (raw query helpers)
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Search response time | < 500ms (p95) |
| User can find property | Within 3 searches |
| Mobile usability | Touch-friendly, no zoom issues |
| Typo tolerance | Common misspellings handled |
| Zero infrastructure cost | Uses existing PostgreSQL |

---

## Related Documentation

- [Image Upload Specs](../specs/) - Related feature specifications
- [Prisma Documentation](https://www.prisma.io/docs) - ORM reference
- [PostgreSQL pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html) - Fuzzy search extension
