# Search Feature Spec 4: Search Results & Relevance

## Overview

Definition of how search results are displayed, ordered, and presented to users, including relevance ranking, result highlighting, pagination, and empty states.

---

## Goals

1. Display search results in a clear, scannable format
2. Order results by relevance to user's search query
3. Help users understand why each result matched
4. Handle edge cases (no results, single result, many results)
5. Provide smooth pagination for large result sets

---

## Technical Approach

**Relevance Ranking:**
- pg_trgm similarity score for fuzzy matches
- Field weighting: title > location > area > description
- Combine relevance score with recency for final ordering

**Result Display:**
- Reuse existing PropertyCard component
- Add search context (match highlights, relevance indicators)
- Server-side pagination for performance

---

## Functional Requirements

### FR-1: Result Ordering

Search results must be ordered by relevance.

| Factor | Weight | Description |
|--------|--------|-------------|
| Title match | Highest | Direct match in property title |
| Location match | High | Match in location field |
| Area match | High | Match in area field |
| Description match | Medium | Match in description text |
| Similarity score | Variable | pg_trgm similarity percentage |
| Recency | Tie-breaker | Newer properties first for same relevance |

### FR-2: Relevance Scoring

The system should calculate relevance for ranking.

| Match Type | Score Boost |
|------------|-------------|
| Exact match | Highest |
| Prefix match | High |
| Contains match | Medium |
| Fuzzy match | Lower (based on similarity %) |
| Multiple field match | Cumulative boost |

### FR-3: Result Count Display

Users must see how many results matched.

| Scenario | Display |
|----------|---------|
| Has results | "X properties found" |
| Single result | "1 property found" |
| No results | "No properties found" |
| With filters | "X properties found in [Area]" |
| Loading | Skeleton or "Searching..." |

### FR-4: Match Highlighting

Matching text should be highlighted in results.

| Field | Highlighting |
|-------|--------------|
| Title | Bold or highlight matching portion |
| Location | Highlight if matched |
| Area | Highlight if matched |
| Description | Show snippet with highlighted match |

### FR-5: Result Card Information

Each result card must display key information.

| Information | Display Priority |
|-------------|------------------|
| Primary image | Large, prominent |
| Title | Bold, with highlight |
| Price | Prominent display |
| Location/Area | Secondary text |
| Key specs | Beds, baths, size |
| Property type | Badge or label |
| Match reason | Optional: "Matched: title" |

### FR-6: Pagination

Large result sets must be paginated.

| Feature | Specification |
|---------|---------------|
| Page size | 12, 24, or 48 items (user choice) |
| Default | 12 items |
| Navigation | Previous/Next + page numbers |
| Scroll position | Return to top on page change |
| URL state | Page number in URL |

### FR-7: Infinite Scroll (Alternative)

Mobile may use infinite scroll instead of pagination.

| Feature | Specification |
|---------|---------------|
| Initial load | 12 items |
| Load more trigger | 200px from bottom |
| Load more button | Fallback "Load more" button |
| Loading indicator | Spinner at bottom |
| End indicator | "No more properties" |

---

## User Experience Requirements

### UX-1: Results Grid Layout

| Element | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Columns | 3-4 | 2-3 | 1-2 |
| Card size | 280-320px | 240-280px | Full width or 160px |
| Gap | 24px | 16px | 12px |
| Image ratio | 3:2 or 4:3 | 3:2 | 3:2 |

### UX-2: Result Card Design

| Element | Specification |
|---------|---------------|
| Image | Top, full-width, lazy loaded |
| Title | 16-18px, bold, max 2 lines |
| Price | 18-20px, prominent color |
| Location | 14px, secondary color |
| Specs | Icons + text, 12-14px |
| Hover | Subtle lift/shadow effect |
| Click | Entire card clickable |

### UX-3: Loading States

| State | Display |
|-------|---------|
| Initial load | Skeleton cards (6-12 placeholders) |
| Search in progress | Subtle loading indicator |
| Page change | Quick fade or skeleton |
| Load more | Spinner at bottom |

### UX-4: Empty State Design

| Element | Specification |
|---------|---------------|
| Icon | House with magnifying glass |
| Heading | "No properties found" |
| Message | Context-aware suggestion |
| Actions | "Clear search" / "Clear filters" buttons |
| Alternatives | Show similar/popular properties |

### UX-5: Pagination UI

| Element | Desktop | Mobile |
|---------|---------|--------|
| Position | Bottom of results | Bottom, sticky option |
| Style | Page numbers with prev/next | Prev/Next only or infinite |
| Current page | Highlighted |
| Disabled state | Greyed out |

### UX-6: Match Highlight Style

| Element | Specification |
|---------|---------------|
| Highlight color | Accent color background or bold |
| Contrast | Must meet WCAG AA |
| Subtlety | Not overwhelming |
| Context | Show surrounding text |

---

## Non-Functional Requirements

### NFR-1: Performance

| Metric | Target |
|--------|--------|
| Time to first result | < 500ms |
| Results render | < 100ms for 12 items |
| Image lazy load | Below-fold images deferred |
| Pagination load | < 300ms |

### NFR-2: SEO

| Requirement | Implementation |
|-------------|----------------|
| Crawlable | Results server-rendered |
| Pagination | rel="next/prev" links |
| Structured data | JSON-LD for property listings |
| Meta tags | Dynamic based on search |

### NFR-3: Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Result announcement | "X results found" announced |
| Card semantics | article or list item role |
| Image alt text | Descriptive alt for each image |
| Pagination | Proper nav landmarks |

---

## Out of Scope

- Map view of results
- Compare properties feature
- Sort options (price low-high, etc.) - could be Spec 5
- Saved/favorited properties display
- Sponsored/featured listings

---

## Dependencies

- Search API (Spec 1)
- PropertyCard component (existing)
- Pagination component
- Skeleton component

---

## Validation & Test Cases (P0 - MVP)

### TC-1: Results Display

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-1.1: Results grid | 1. Search with results | Properties shown in grid |
| TC-1.2: Result count | 1. Search 2. Check count | "X properties found" displayed |
| TC-1.3: Card information | 1. View result card | Image, title, price, specs shown |
| TC-1.4: Desktop columns | 1. View on desktop | 3-4 column grid |
| TC-1.5: Mobile columns | 1. View on mobile | 1-2 column grid |

### TC-2: Relevance Ordering

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-2.1: Title match first | 1. Search property title | Exact title match appears first |
| TC-2.2: Better match higher | 1. Search partial term | Closer matches rank higher |
| TC-2.3: Multiple matches | 1. Search common term | Ordered by relevance |
| TC-2.4: Same relevance | 1. Results with equal relevance | Newer property first |

### TC-3: Match Highlighting

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-3.1: Title highlighted | 1. Search term in title | Term highlighted in result title |
| TC-3.2: Location highlighted | 1. Search location | Location highlighted |
| TC-3.3: Partial highlight | 1. Search "vil" | "vil" highlighted in "Villa" |
| TC-3.4: Case preserved | 1. Search "VILLA" | Highlighting respects original case |

### TC-4: No Results State

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-4.1: No results message | 1. Search non-existent term | "No properties found" shown |
| TC-4.2: Suggestions shown | 1. No results state | Helpful suggestions displayed |
| TC-4.3: Clear search button | 1. No results 2. Click clear | Search cleared, all results shown |
| TC-4.4: Clear filters option | 1. No results with filters | "Clear filters" option available |

### TC-5: Loading States

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-5.1: Initial skeleton | 1. Load page first time | Skeleton cards shown briefly |
| TC-5.2: Search loading | 1. Type search 2. Observe | Loading indicator during search |
| TC-5.3: No flash | 1. Fast response | No jarring flash between states |

### TC-6: Pagination

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-6.1: Pagination shown | 1. Have > 12 results | Pagination controls appear |
| TC-6.2: Next page | 1. Click "Next" | Next page of results shown |
| TC-6.3: Previous page | 1. Go to page 2 2. Click "Previous" | Page 1 shown |
| TC-6.4: Page number click | 1. Click page "3" | Page 3 results shown |
| TC-6.5: URL updates | 1. Change page | URL includes page parameter |
| TC-6.6: Direct URL access | 1. Navigate to `?page=2` | Page 2 results shown |

### TC-7: Infinite Scroll (Mobile)

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-7.1: Initial load | 1. View on mobile | First 12 results shown |
| TC-7.2: Scroll to load | 1. Scroll to bottom | More results load automatically |
| TC-7.3: Loading indicator | 1. Trigger load more | Spinner shown at bottom |
| TC-7.4: End of results | 1. Scroll through all | "No more properties" shown |

### TC-8: Result Card Interaction

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-8.1: Card click | 1. Click result card | Navigates to property detail |
| TC-8.2: Hover effect | 1. Hover over card (desktop) | Visual hover feedback |
| TC-8.3: Image loads | 1. View card | Property image displays |
| TC-8.4: Lazy loading | 1. Scroll down | Below-fold images load on scroll |

### TC-9: Result Information

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-9.1: Price displayed | 1. View result | Price clearly visible |
| TC-9.2: Location shown | 1. View result | Location/area displayed |
| TC-9.3: Specs shown | 1. View result | Beds, baths, size visible |
| TC-9.4: Property type | 1. View result | Type badge/label shown |

### TC-10: Edge Cases

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-10.1: Single result | 1. Search unique term | "1 property found", shows 1 card |
| TC-10.2: Many results | 1. Broad search | Results paginated, count accurate |
| TC-10.3: Long title | 1. Property with long title | Title truncated appropriately |
| TC-10.4: No image | 1. Property without image | Placeholder image shown |

### TC-11: Performance

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-11.1: Fast search | 1. Search 2. Measure time | Results in < 500ms |
| TC-11.2: Smooth scroll | 1. Scroll through results | No janky scrolling |
| TC-11.3: Image performance | 1. Load page with images | Images load progressively |

### TC-12: Accessibility

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-12.1: Result announcement | 1. Search 2. Listen to screen reader | "X results found" announced |
| TC-12.2: Card keyboard nav | 1. Tab through results | Each card focusable |
| TC-12.3: Image alt text | 1. Inspect image alt | Descriptive alt text |
| TC-12.4: Pagination accessible | 1. Keyboard navigate pagination | All controls accessible |

---

## Success Criteria

1. Results appear in order of relevance to search query
2. Users can identify why each result matched their search
3. Pagination handles any number of results smoothly
4. Empty state provides actionable guidance
5. Results load within 500ms of search completion
6. Mobile and desktop experiences are both optimized
