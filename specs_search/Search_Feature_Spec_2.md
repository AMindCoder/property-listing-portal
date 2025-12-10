# Search Feature Spec 2: Search Suggestions & Autocomplete

## Overview

An autocomplete dropdown that appears below the search bar as users type, showing suggested searches, matching areas, property types, and recent searches to help users find properties faster.

---

## Goals

1. Reduce typing effort by suggesting completions
2. Help users discover available areas and property types
3. Show recent searches for quick repeat access
4. Guide users toward successful search queries
5. Provide instant visual feedback during typing

---

## Technical Approach

**Data Sources:**
- Distinct areas from database
- Distinct property types from database
- Recent searches from localStorage (client-side)
- Matching property titles (top 5)

**Implementation:**
- Client-side component with API call for suggestions
- Debounced requests (200ms) for performance
- Local caching of area/propertyType lists
- localStorage for recent searches (no server storage)

---

## Functional Requirements

### FR-1: Suggestion Dropdown

The system must display a dropdown with categorized suggestions.

| Category | Source | Max Items |
|----------|--------|-----------|
| Recent Searches | localStorage | 3 |
| Areas | Database (distinct areas) | 5 |
| Property Types | Database (distinct types) | 4 |
| Properties | Database (title match) | 5 |

### FR-2: Suggestion Categories Display

Each category must be visually distinct.

| Category | Icon | Label |
|----------|------|-------|
| Recent Searches | Clock icon | "Recent" |
| Areas | Map pin icon | "Areas" |
| Property Types | Building icon | "Types" |
| Properties | Home icon | "Properties" |

### FR-3: Suggestion Matching

Suggestions must match user input intelligently.

| Behavior | Description |
|----------|-------------|
| Prefix match | "gan" matches "Ganganagar" |
| Contains match | "nagar" matches "Ganganagar" |
| Case insensitive | "VILLA" matches "Villa" |
| Highlight match | Bold the matching portion |

### FR-4: Suggestion Selection

Users must be able to select suggestions easily.

| Action | Result |
|--------|--------|
| Click suggestion | Fills search bar, executes search |
| Keyboard Enter | Selects highlighted suggestion |
| Arrow keys | Navigate through suggestions |
| Escape | Close dropdown, keep text |
| Click outside | Close dropdown, keep text |

### FR-5: Recent Searches

The system must track and display recent searches.

| Behavior | Description |
|----------|-------------|
| Storage | localStorage (client-side only) |
| Max stored | 10 recent searches |
| Display max | 3 most recent |
| Duplicates | Move to top, don't duplicate |
| Clear option | "Clear recent searches" link |

### FR-6: Dropdown Visibility

The dropdown must appear and hide appropriately.

| Trigger | Dropdown State |
|---------|----------------|
| Focus on empty input | Show recent searches only |
| Start typing | Show matching suggestions |
| Clear input | Show recent searches |
| Blur (click outside) | Hide dropdown |
| Select suggestion | Hide dropdown |
| Press Escape | Hide dropdown |
| No matches | Show "No suggestions" or hide |

---

## User Experience Requirements

### UX-1: Desktop Dropdown

| Element | Specification |
|---------|---------------|
| Width | Match search bar width |
| Max height | 400px with scroll |
| Position | Directly below search bar |
| Shadow | Subtle drop shadow for elevation |
| Border | 1px border matching design system |
| Z-index | Above all other content |

### UX-2: Mobile Dropdown

| Element | Specification |
|---------|---------------|
| Width | Full width (match search bar) |
| Max height | 50vh (half viewport height) |
| Position | Below search bar, above keyboard |
| Touch targets | 48px minimum height per item |
| Scroll | Smooth scroll within dropdown |

### UX-3: Suggestion Item Design

| Element | Specification |
|---------|---------------|
| Height | 44-48px per item |
| Padding | 12-16px horizontal |
| Icon | 20px, left-aligned |
| Text | Left of icon, 14-16px font |
| Highlight | Bold matching characters |
| Hover state | Background color change |
| Selected state | Background + border indicator |

### UX-4: Category Headers

| Element | Specification |
|---------|---------------|
| Font size | 12px, uppercase |
| Color | Muted/secondary text color |
| Padding | 8px horizontal, 4px vertical |
| Sticky | Optional: stick to top while scrolling category |

### UX-5: Keyboard Navigation

| Key | Action |
|-----|--------|
| Arrow Down | Move to next suggestion |
| Arrow Up | Move to previous suggestion |
| Enter | Select current suggestion |
| Escape | Close dropdown |
| Tab | Close dropdown, move focus |

### UX-6: Loading & Empty States

| State | Display |
|-------|---------|
| Loading suggestions | Subtle spinner or skeleton |
| No matches | "No suggestions found" message |
| Empty recent | Don't show "Recent" category |
| API error | Fallback to recent searches only |

---

## Non-Functional Requirements

### NFR-1: Performance

| Metric | Target |
|--------|--------|
| Dropdown appear | < 100ms after typing pause |
| Suggestion fetch | < 150ms API response |
| Render suggestions | < 50ms |
| No layout shift | Dropdown doesn't push content |

### NFR-2: Accessibility

| Requirement | Implementation |
|-------------|----------------|
| ARIA role | combobox with listbox |
| aria-expanded | true when dropdown open |
| aria-activedescendant | ID of highlighted item |
| aria-autocomplete | "list" |
| Screen reader | Announce suggestions count |

### NFR-3: Data Privacy

| Requirement | Implementation |
|-------------|----------------|
| Recent searches | Client-side only (localStorage) |
| No tracking | Don't send search history to server |
| Clear data | User can clear recent searches |

---

## Out of Scope

- Server-side search history
- Personalized suggestions based on user behavior
- Trending searches
- Search suggestions based on other users' searches
- Geo-location based suggestions

---

## Dependencies

- Search bar component (Spec 1)
- Property listing API
- Areas API endpoint
- localStorage availability

---

## Validation & Test Cases (P0 - MVP)

### TC-1: Dropdown Rendering

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-1.1: Dropdown appears on focus | 1. Click/focus search bar | Dropdown appears below |
| TC-1.2: Dropdown width | 1. Open dropdown | Width matches search bar |
| TC-1.3: Dropdown closes on blur | 1. Open dropdown 2. Click outside | Dropdown closes |
| TC-1.4: Mobile dropdown | 1. Focus search on mobile | Dropdown fits above keyboard |

### TC-2: Recent Searches

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-2.1: Show recent on focus | 1. Have recent searches 2. Focus empty input | Recent searches shown |
| TC-2.2: Save search | 1. Search "villa" 2. Re-focus input | "villa" in recent searches |
| TC-2.3: Max 3 displayed | 1. Have 5 recent 2. Focus input | Only 3 most recent shown |
| TC-2.4: Clear recent | 1. Click "Clear recent" | Recent searches removed |
| TC-2.5: No duplicates | 1. Search "villa" twice | Only one "villa" in recent |

### TC-3: Area Suggestions

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-3.1: Areas appear | 1. Type "gang" | "Ganganagar" in Areas section |
| TC-3.2: Area category label | 1. View area suggestions | "Areas" header visible |
| TC-3.3: Select area | 1. Click area suggestion | Search filters by that area |
| TC-3.4: Multiple areas match | 1. Type "nagar" | All matching areas shown |

### TC-4: Property Type Suggestions

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-4.1: Types appear | 1. Type "hou" | "House" in Types section |
| TC-4.2: Type selection | 1. Click type suggestion | Search filters by type |
| TC-4.3: All types shown | 1. Type "p" | "Plot" appears |

### TC-5: Property Title Suggestions

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-5.1: Titles appear | 1. Type property name | Matching titles in Properties section |
| TC-5.2: Max 5 titles | 1. Type common term | Maximum 5 property suggestions |
| TC-5.3: Select property | 1. Click property suggestion | Navigates to property or searches |

### TC-6: Match Highlighting

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-6.1: Prefix highlight | 1. Type "vil" | "vil" bold in "Villa" |
| TC-6.2: Contains highlight | 1. Type "agar" | "agar" bold in "Ganganagar" |
| TC-6.3: Case insensitive | 1. Type "VIL" | Matches "Villa", highlights correctly |

### TC-7: Keyboard Navigation

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-7.1: Arrow down | 1. Open dropdown 2. Press down arrow | First item highlighted |
| TC-7.2: Arrow up | 1. Highlight item 2. Press up | Previous item highlighted |
| TC-7.3: Enter to select | 1. Highlight item 2. Press Enter | Item selected, search executes |
| TC-7.4: Escape closes | 1. Open dropdown 2. Press Escape | Dropdown closes |
| TC-7.5: Wrap around | 1. At last item 2. Press down | Wraps to first item |

### TC-8: Category Organization

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-8.1: Categories ordered | 1. Type text with matches | Recent → Areas → Types → Properties order |
| TC-8.2: Empty category hidden | 1. Type with no area match | Areas section not shown |
| TC-8.3: Category icons | 1. View dropdown | Correct icons per category |

### TC-9: Mobile Experience

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-9.1: Touch to select | 1. Tap suggestion | Suggestion selected |
| TC-9.2: Scroll suggestions | 1. Many suggestions 2. Scroll | Smooth scrolling |
| TC-9.3: Keyboard doesn't cover | 1. Focus input on mobile | Dropdown visible above keyboard |
| TC-9.4: Touch target size | 1. Measure suggestion height | Minimum 48px height |

### TC-10: Edge Cases

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-10.1: No matches | 1. Type "xyz123" | "No suggestions" or empty dropdown |
| TC-10.2: Special characters | 1. Type "@#$" | Handled gracefully, no errors |
| TC-10.3: Very long input | 1. Type 100+ characters | Handled, suggestions attempted |
| TC-10.4: Rapid typing | 1. Type very fast | Debounce prevents excessive calls |

### TC-11: Accessibility

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-11.1: Screen reader | 1. Use screen reader 2. Open dropdown | Suggestions announced |
| TC-11.2: ARIA attributes | 1. Inspect HTML | Correct ARIA roles and states |
| TC-11.3: Focus visible | 1. Keyboard navigate | Clear focus indicator |

---

## Success Criteria

1. Suggestions appear within 200ms of typing pause
2. Users can navigate suggestions with keyboard only
3. Recent searches persist across browser sessions
4. Suggestions help users find properties with fewer keystrokes
5. Dropdown is fully accessible via screen reader
6. Mobile experience is touch-friendly and doesn't interfere with keyboard
