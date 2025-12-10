# Search Feature Spec 3: Advanced Filters Integration

## Overview

Integration of the search bar with advanced filtering capabilities, allowing users to combine text search with structured filters (price range, bedrooms, bathrooms, property type, area) for precise property discovery.

---

## Goals

1. Allow users to combine free-text search with structured filters
2. Provide clear visibility of all active filters
3. Enable quick filter modification without losing search context
4. Support filter presets for common search patterns
5. Maintain URL state for shareable filtered searches

---

## Technical Approach

**Filter Architecture:**
- URL-based state management for all filters
- Combined Prisma query with search + filters
- Client-side filter UI with server-side execution
- Debounced filter changes to reduce API calls

**Query Combination:**
- Text search (ILIKE/pg_trgm) AND structured filters
- Filters applied as WHERE clauses in same query
- Results sorted by relevance then by date

---

## Functional Requirements

### FR-1: Filter Types

The system must support the following filter types.

| Filter | Type | Options |
|--------|------|---------|
| Price Range | Range slider or min/max inputs | Min: 0, Max: unlimited |
| Bedrooms | Discrete selection | Any, 1, 2, 3, 4, 5+ |
| Bathrooms | Discrete selection | Any, 1, 2, 3, 4+ |
| Property Type | Multi-select | Plot, House, Flat, Rental |
| Area | Single-select dropdown | Dynamic from database |
| Status | Single-select | Available, Sold, All |
| Size (sq ft) | Range | Min/Max inputs |

### FR-2: Filter + Search Combination

Text search and filters must work together seamlessly.

| Scenario | Behavior |
|----------|----------|
| Search then filter | Results narrow to match both |
| Filter then search | Search within filtered set |
| Clear search | Filters remain active |
| Clear filter | Search remains active |
| Clear all | Reset both search and filters |

### FR-3: Active Filter Display

Users must clearly see what filters are active.

| Display Element | Description |
|-----------------|-------------|
| Filter chips/tags | Show each active filter as removable chip |
| Count badge | Number of active filters on filter button |
| Summary text | "Showing X properties in [Area] under [Price]" |
| Clear all button | One-click to clear all filters |

### FR-4: Filter Persistence

Filter state must be maintained appropriately.

| Scenario | Behavior |
|----------|----------|
| URL parameters | All filters reflected in URL |
| Page refresh | Filters restored from URL |
| Back button | Previous filter state restored |
| Share link | Recipient sees same filters |
| New session | Filters cleared (fresh start) |

### FR-5: Filter UI Modes

The filter interface must adapt to screen size.

| Mode | Trigger | Layout |
|------|---------|--------|
| Inline | Desktop (> 1024px) | Filters beside/below search bar |
| Collapsible | Tablet (768-1024px) | Expandable filter section |
| Modal/Sheet | Mobile (< 768px) | Full-screen filter panel |

### FR-6: Price Range Filter

Specific requirements for price filtering.

| Feature | Description |
|---------|-------------|
| Input type | Two inputs (min/max) or dual-thumb slider |
| Validation | Min cannot exceed max |
| Quick presets | Under 50L, 50L-1Cr, 1Cr-2Cr, Above 2Cr |
| Format | Display in lakhs/crores format |
| Any option | "Any" for no limit |

### FR-7: Bedroom/Bathroom Filter

Specific requirements for room count filtering.

| Feature | Description |
|---------|-------------|
| Display | Button group or pill selector |
| Options | Any, 1, 2, 3, 4, 5+ |
| Multi-select | Optional: allow "2 or 3 bedrooms" |
| "+" handling | 5+ means >= 5 |

### FR-8: Result Count Update

Filter changes must update result count.

| Behavior | Description |
|----------|-------------|
| Live count | Show matching count before applying |
| Loading state | Show spinner during count update |
| Zero results | Warn before applying if zero matches |
| Suggestion | "Try removing [filter] to see more results" |

---

## User Experience Requirements

### UX-1: Desktop Filter Layout

| Element | Specification |
|---------|---------------|
| Position | Below search bar, horizontal row |
| Filter buttons | Dropdown triggers for each filter |
| Spacing | 12-16px between filters |
| Alignment | Left-aligned with search bar |
| Active indicator | Highlight/badge on active filters |

### UX-2: Mobile Filter Experience

| Element | Specification |
|---------|---------------|
| Filter button | Prominent "Filters" button with count badge |
| Panel type | Bottom sheet or full-screen modal |
| Panel height | 80-90% viewport height |
| Apply button | Sticky at bottom "Show X Results" |
| Close | X button or swipe down to dismiss |

### UX-3: Filter Chips

| Element | Specification |
|---------|---------------|
| Size | Compact, 28-32px height |
| Content | Filter name + value + X button |
| Position | Below search bar, horizontal scroll on mobile |
| Interaction | Click X to remove, click chip to edit |
| Max display | Show first 3-4, "+N more" for rest |

### UX-4: Price Range UI

| Element | Specification |
|---------|---------------|
| Desktop | Dual-thumb slider with input fields |
| Mobile | Separate min/max input fields |
| Formatting | Auto-format as user types (10,00,000) |
| Presets | Quick buttons for common ranges |

### UX-5: Filter Dropdown/Modal

| Element | Specification |
|---------|---------------|
| Width | 280-320px for dropdowns |
| Max height | 400px with scroll |
| Sections | Grouped by filter type |
| Reset | "Reset" link per filter group |
| Apply | "Apply" button (mobile only) |

### UX-6: No Results State

| Element | Specification |
|---------|---------------|
| Message | "No properties match your filters" |
| Suggestions | Show which filters to remove |
| Similar results | "X properties if you remove [filter]" |
| Clear action | Prominent "Clear all filters" button |

---

## Non-Functional Requirements

### NFR-1: Performance

| Metric | Target |
|--------|--------|
| Filter change response | < 300ms |
| Count preview | < 200ms |
| URL update | Instant (no delay) |
| Filter panel open | < 100ms animation |

### NFR-2: URL Structure

| Parameter | Format | Example |
|-----------|--------|---------|
| Search | q | `?q=villa` |
| Min price | minPrice | `?minPrice=5000000` |
| Max price | maxPrice | `?maxPrice=10000000` |
| Bedrooms | beds | `?beds=3` |
| Bathrooms | baths | `?baths=2` |
| Property type | type | `?type=House` |
| Area | area | `?area=Ganganagar` |
| Status | status | `?status=AVAILABLE` |

### NFR-3: Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Filter labels | Associated labels for all inputs |
| Slider | Keyboard accessible with ARIA |
| Announcements | Announce filter changes to screen reader |
| Focus trap | Modal/sheet traps focus appropriately |

---

## Out of Scope

- Saved filter presets (user accounts)
- Filter-based email alerts
- Map-based location filtering
- Custom filter creation
- Filter analytics

---

## Dependencies

- Search bar component (Spec 1)
- Existing filter dropdowns
- Property listing API with filter support
- URL state management

---

## Validation & Test Cases (P0 - MVP)

### TC-1: Filter UI Rendering

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-1.1: Filters visible | 1. Open listing page | Filter controls visible |
| TC-1.2: Desktop layout | 1. View on desktop | Filters in horizontal row |
| TC-1.3: Mobile filter button | 1. View on mobile | "Filters" button with badge |
| TC-1.4: Mobile filter panel | 1. Tap filter button on mobile | Filter panel opens |

### TC-2: Price Range Filter

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-2.1: Set min price | 1. Enter min price 2. Apply | Properties >= min price shown |
| TC-2.2: Set max price | 1. Enter max price 2. Apply | Properties <= max price shown |
| TC-2.3: Set range | 1. Set min and max | Properties within range shown |
| TC-2.4: Invalid range | 1. Set min > max | Validation error or auto-swap |
| TC-2.5: Price preset | 1. Click price preset | Range auto-filled |

### TC-3: Bedroom/Bathroom Filter

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-3.1: Select bedrooms | 1. Select "3" bedrooms | 3-bedroom properties shown |
| TC-3.2: Select bathrooms | 1. Select "2" bathrooms | 2-bathroom properties shown |
| TC-3.3: Select 5+ | 1. Select "5+" bedrooms | Properties with 5+ bedrooms shown |
| TC-3.4: Any option | 1. Select "Any" | All bedroom counts shown |

### TC-4: Property Type Filter

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-4.1: Select type | 1. Select "House" | Only houses shown |
| TC-4.2: Multiple types | 1. Select House and Flat | Houses and flats shown |
| TC-4.3: Clear type | 1. Deselect all types | All types shown |

### TC-5: Area Filter

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-5.1: Select area | 1. Select area from dropdown | Properties in that area |
| TC-5.2: Change area | 1. Select different area | Results update |
| TC-5.3: All areas | 1. Select "All Areas" | All areas shown |

### TC-6: Search + Filter Combination

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-6.1: Search then filter | 1. Search "villa" 2. Filter by 3 beds | Villas with 3 beds shown |
| TC-6.2: Filter then search | 1. Filter by area 2. Search "modern" | Modern properties in area |
| TC-6.3: Multiple filters | 1. Set price + beds + type | Results match all filters |
| TC-6.4: Clear search keeps filters | 1. Search + filter 2. Clear search | Filters remain, search cleared |
| TC-6.5: Clear filter keeps search | 1. Search + filter 2. Clear filter | Search remains, filter cleared |

### TC-7: Active Filter Display

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-7.1: Filter chips shown | 1. Apply filters | Chips appear for each filter |
| TC-7.2: Remove via chip | 1. Click X on chip | Filter removed, results update |
| TC-7.3: Filter count badge | 1. Apply 3 filters | Badge shows "3" |
| TC-7.4: Clear all | 1. Click "Clear all" | All filters removed |

### TC-8: URL State

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-8.1: Filters in URL | 1. Apply filters 2. Check URL | URL contains filter params |
| TC-8.2: Load from URL | 1. Navigate to URL with filters | Filters pre-applied |
| TC-8.3: Share filtered URL | 1. Copy URL 2. Open new tab | Same filters applied |
| TC-8.4: Back button | 1. Apply filter 2. Change filter 3. Back | Previous filter restored |

### TC-9: Mobile Filter Panel

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-9.1: Open panel | 1. Tap filter button | Panel slides up |
| TC-9.2: Close panel | 1. Tap X or swipe down | Panel closes |
| TC-9.3: Apply filters | 1. Set filters 2. Tap "Show Results" | Panel closes, results update |
| TC-9.4: Result count | 1. Change filter | "Show X Results" updates |

### TC-10: No Results Handling

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-10.1: No matches | 1. Apply restrictive filters | "No properties found" message |
| TC-10.2: Suggestion shown | 1. No results state | Suggestions to modify filters |
| TC-10.3: Clear from no results | 1. Click "Clear filters" | Results appear |

### TC-11: Edge Cases

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-11.1: All filters active | 1. Apply all filter types | Combined results shown |
| TC-11.2: Rapid filter changes | 1. Change filters quickly | Final state reflected |
| TC-11.3: Refresh with filters | 1. Apply filters 2. Refresh | Filters preserved |

### TC-12: Accessibility

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-12.1: Keyboard filter | 1. Tab through filters | All filters accessible |
| TC-12.2: Screen reader | 1. Use screen reader | Filter options announced |
| TC-12.3: Focus trap mobile | 1. Open mobile panel | Focus trapped in panel |

---

## Success Criteria

1. Users can combine any text search with any filters
2. Active filters are always clearly visible
3. Filter state persists in URL for sharing
4. Mobile filter experience is intuitive and touch-friendly
5. Filter changes reflect in results within 300ms
6. No results state provides actionable guidance
