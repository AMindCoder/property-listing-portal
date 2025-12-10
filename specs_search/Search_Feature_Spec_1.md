# Search Feature Spec 1: Search Bar & Text Search

## Overview

A unified search bar that allows users to search properties by typing free-form text. The search should match against property title, description, location, and area fields with support for partial matches and typo tolerance.

---

## Goals

1. Enable users to find properties quickly by typing any relevant text
2. Provide instant feedback as user types (typeahead experience)
3. Support fuzzy matching to handle typos and misspellings
4. Work seamlessly on both desktop and mobile devices
5. Integrate naturally with existing filter functionality

---

## Technical Approach

**Database:** PostgreSQL with Prisma ORM (existing infrastructure)

**Search Method:**
- Primary: Prisma `contains` with `mode: 'insensitive'` for basic ILIKE search
- Enhanced: PostgreSQL `pg_trgm` extension for fuzzy/typo-tolerant matching
- Multi-column search across: title, description, location, area

**Why This Approach:**
- Zero additional infrastructure cost
- Real-time data (no sync delays)
- pg_trgm handles typos like "viila" → "villa"
- Leverages existing Vercel Postgres

---

## Functional Requirements

### FR-1: Search Bar Component

The system must provide a prominent search input field.

| Requirement | Description |
|-------------|-------------|
| Placement | Top of the property listing page, always visible |
| Placeholder text | "Search properties by name, location, area..." |
| Clear button | "X" icon to clear search text when input has value |
| Search icon | Magnifying glass icon on left side of input |
| Input type | Text input with search semantics |

### FR-2: Search Behavior

The search must respond to user input in real-time.

| Behavior | Description |
|----------|-------------|
| Trigger | Search executes as user types (typeahead) |
| Debounce | 300ms delay after last keystroke before API call |
| Minimum characters | Search triggers from 1st character |
| Empty search | Shows all properties (default listing) |
| Case sensitivity | Case-insensitive matching |

### FR-3: Searchable Fields

The search must query across multiple property fields.

| Field | Priority | Match Type |
|-------|----------|------------|
| title | High | Partial match (contains) |
| location | High | Partial match (contains) |
| area | High | Partial match (contains) |
| description | Medium | Partial match (contains) |
| propertyType | Low | Exact or partial match |

### FR-4: Fuzzy Matching (Typo Tolerance)

The search should handle common typos and misspellings.

| Scenario | User Types | Should Match |
|----------|------------|--------------|
| Missing letter | "vila" | "villa" |
| Extra letter | "villla" | "villa" |
| Swapped letters | "vlila" | "villa" |
| Similar sounds | "flat" | "flat", "flats" |
| Partial word | "gang" | "Ganganagar" |

### FR-5: Search Results Display

Search results must clearly indicate matches.

| Requirement | Description |
|-------------|-------------|
| Result count | Display "X properties found" or "No properties found" |
| Result order | Relevance-based (best matches first) |
| Loading state | Show spinner/skeleton while searching |
| No results | Friendly message with suggestions |
| Highlight matches | Optional: highlight matching text in results |

### FR-6: Search Persistence

Search state should persist appropriately.

| Scenario | Behavior |
|----------|----------|
| Page refresh | Clear search (start fresh) |
| Back navigation | Restore previous search if returning to listing |
| URL parameter | Search term in URL for shareable links (`?q=villa`) |
| Filter combination | Search works alongside existing filters |

---

## User Experience Requirements

### UX-1: Desktop Experience

| Element | Specification |
|---------|---------------|
| Search bar width | 400-600px, centered or left-aligned |
| Input height | 44-48px for comfortable typing |
| Font size | 16px minimum |
| Focus state | Visible border/outline change |
| Keyboard shortcut | "/" to focus search bar (optional) |
| Results | Display in existing property grid below |

### UX-2: Mobile Experience

| Element | Specification |
|---------|---------------|
| Search bar width | Full width with padding (16px sides) |
| Input height | 48px minimum (touch-friendly) |
| Font size | 16px (prevents iOS zoom on focus) |
| Keyboard | Search keyboard with "Search" button |
| Clear button | 44x44px touch target minimum |
| Position | Sticky at top or in header |

### UX-3: Search States

| State | Visual Feedback |
|-------|-----------------|
| Empty | Placeholder text visible |
| Typing | Input shows text, clear button appears |
| Loading | Subtle spinner in search bar or results area |
| Results found | Result count + property cards |
| No results | Empty state with message |
| Error | Error message with retry option |

### UX-4: Interaction Feedback

| Interaction | Feedback |
|-------------|----------|
| Focus on input | Border highlight, placeholder fades |
| Typing | Debounce indicator (optional subtle) |
| Clear click | Input clears, results reset |
| Search complete | Smooth transition to results |

---

## Non-Functional Requirements

### NFR-1: Performance

| Metric | Target |
|--------|--------|
| Debounce delay | 300ms |
| API response time | < 200ms for < 10K properties |
| Time to first result | < 500ms from last keystroke |
| No UI blocking | Search runs asynchronously |

### NFR-2: Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Label | Proper aria-label on search input |
| Role | role="search" on container |
| Screen reader | Announce result count changes |
| Keyboard | Full keyboard navigation support |
| Focus management | Logical focus order |

### NFR-3: Error Handling

| Error | Handling |
|-------|----------|
| Network failure | Show error message, allow retry |
| Server error | Graceful degradation, show cached results if available |
| Timeout | Cancel pending request, show timeout message |

---

## Out of Scope

- Voice search
- Image-based search
- AI/ML-powered semantic search
- Search analytics/tracking
- Saved searches
- Search suggestions dropdown (covered in Spec 2)

---

## Dependencies

- Existing property listing page
- Existing property API (`/api/properties`)
- PostgreSQL database with pg_trgm extension

---

## Validation & Test Cases (P0 - MVP)

### TC-1: Search Bar Rendering

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-1.1: Search bar visible | 1. Open property listing page | Search bar visible at top |
| TC-1.2: Placeholder text | 1. View empty search bar | Placeholder text shown |
| TC-1.3: Search icon | 1. View search bar | Magnifying glass icon visible |
| TC-1.4: Mobile responsive | 1. View on mobile width | Search bar full width |

### TC-2: Basic Search Functionality

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-2.1: Search by title | 1. Type property title 2. Wait for results | Matching properties shown |
| TC-2.2: Search by location | 1. Type location name | Properties in that location shown |
| TC-2.3: Search by area | 1. Type area name | Properties in that area shown |
| TC-2.4: Partial match | 1. Type partial word "vil" | "Villa" properties shown |
| TC-2.5: Case insensitive | 1. Type "VILLA" | Same results as "villa" |

### TC-3: Fuzzy/Typo Matching

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-3.1: Missing letter | 1. Type "vila" | "Villa" properties shown |
| TC-3.2: Extra letter | 1. Type "villla" | "Villa" properties shown |
| TC-3.3: Swapped letters | 1. Type "vlila" | "Villa" properties shown |
| TC-3.4: Near match | 1. Type "gangangar" | "Ganganagar" properties shown |

### TC-4: Search Behavior

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-4.1: Debounce | 1. Type quickly 2. Observe network | Single API call after 300ms pause |
| TC-4.2: Clear search | 1. Type search 2. Click clear | Input cleared, all properties shown |
| TC-4.3: Empty search | 1. Clear search input | All properties shown (default) |
| TC-4.4: Single character | 1. Type "v" | Search triggers, results shown |

### TC-5: Results Display

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-5.1: Result count | 1. Search for term | "X properties found" displayed |
| TC-5.2: No results | 1. Search for non-existent term | "No properties found" message |
| TC-5.3: Loading state | 1. Search 2. Observe during load | Loading indicator shown |
| TC-5.4: Result order | 1. Search partial term | Best matches appear first |

### TC-6: Filter Combination

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-6.1: Search + area filter | 1. Search "villa" 2. Select area filter | Results match both search and area |
| TC-6.2: Search + price filter | 1. Search term 2. Set price range | Results match search within price |
| TC-6.3: Search + property type | 1. Search 2. Select property type | Combined filter results |
| TC-6.4: Clear filters keeps search | 1. Search + filter 2. Clear filters | Search remains, filters cleared |

### TC-7: Mobile Experience

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-7.1: Touch input | 1. Tap search bar on mobile | Keyboard opens, cursor in input |
| TC-7.2: Touch clear | 1. Type text 2. Tap clear button | Input cleared |
| TC-7.3: No zoom on focus | 1. Focus search on iOS | Page does not zoom in |
| TC-7.4: Search keyboard | 1. Focus search on mobile | Search/Go button on keyboard |

### TC-8: URL & State

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-8.1: URL parameter | 1. Search "villa" 2. Check URL | URL contains `?q=villa` |
| TC-8.2: Direct URL access | 1. Navigate to `/?q=villa` | Search pre-filled, results shown |
| TC-8.3: Share URL | 1. Copy URL with search 2. Open in new tab | Same search results |

### TC-9: Error Handling

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-9.1: Network error | 1. Disconnect network 2. Search | Error message shown |
| TC-9.2: Server error | 1. Simulate 500 error | Graceful error message |
| TC-9.3: Retry after error | 1. Error occurs 2. Retry | Search works after retry |

### TC-10: Accessibility

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-10.1: Keyboard focus | 1. Tab to search bar | Visible focus indicator |
| TC-10.2: Screen reader | 1. Use screen reader on search | Input properly announced |
| TC-10.3: Result announcement | 1. Search 2. Listen for announcement | Result count announced |

---

## Success Criteria

1. Users can find properties by typing any relevant text
2. Search responds within 500ms of user stopping typing
3. Typos and misspellings still return relevant results
4. Search works seamlessly on mobile devices
5. Search integrates with existing filters without conflict
6. Zero increase in infrastructure cost
