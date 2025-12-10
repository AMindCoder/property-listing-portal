# Spec 1: Services Feature Overview & Navigation Structure

## Overview

A portfolio showcase feature that allows a property builder/construction company to display their construction quality through categorized image galleries. The feature replaces the existing static "Construction Services" page with a dynamic "Services" dropdown menu containing multiple service categories, each with its own dedicated gallery page.

---

## Goals

1. Provide a structured way to showcase construction portfolio across different building components
2. Enable the admin to upload and manage images with descriptions for each service category
3. Allow potential customers to browse construction quality examples by category
4. Replace the existing static construction services page with dynamic, content-managed pages
5. Improve navigation with a dropdown menu structure for services

---

## Service Categories

The Services menu will contain the following categories (Option 1 structure):

| Category | URL Slug | Description |
|----------|----------|-------------|
| Foundations & Structure | `/services/foundations` | Foundation work, basement construction, structural framework |
| Walls & Masonry | `/services/walls` | Brick work, block laying, plastering, wall finishes |
| Interiors & Finishes | `/services/interiors` | Interior design, flooring, painting, fixtures, woodwork |
| Roofing & Ceilings | `/services/ceilings` | Ceiling designs, false ceilings, roofing work |
| Stairs & Railings | `/services/stairs` | Staircase construction, railings, balustrades |
| Exteriors & Landscaping | `/services/exteriors` | External finishes, landscaping, driveways, boundary walls |

---

## Functional Requirements

### FR-1: Navigation Menu Structure

The main navigation must be updated to include a Services dropdown menu.

**Menu Behavior:**

| Aspect | Requirement |
|--------|-------------|
| Menu Label | "Services" |
| Menu Type | Dropdown (hover/click to expand) |
| Items | 6 service category links |
| Mobile Behavior | Expandable accordion-style submenu |
| Active State | Highlight parent "Services" when any child page is active |

**Desktop Navigation:**
- Services label in main nav
- Dropdown appears on hover (with slight delay to prevent accidental triggers)
- Dropdown shows all 6 category links
- Clicking a category navigates to that service page

**Mobile Navigation:**
- Services label in mobile menu
- Tapping expands to show all 6 category links inline
- Visual indicator (chevron/arrow) to show expandable state

### FR-2: URL Structure

All service pages must follow a consistent URL pattern.

| Page | URL |
|------|-----|
| Foundations & Structure | `/services/foundations` |
| Walls & Masonry | `/services/walls` |
| Interiors & Finishes | `/services/interiors` |
| Roofing & Ceilings | `/services/ceilings` |
| Stairs & Railings | `/services/stairs` |
| Exteriors & Landscaping | `/services/exteriors` |

### FR-3: Services Landing Page (Optional)

An optional landing page at `/services` that provides an overview of all service categories.

| Element | Description |
|---------|-------------|
| Hero Section | Brief introduction about the company's construction services |
| Category Cards | Visual cards linking to each of the 6 service categories |
| Card Content | Category name, brief description, representative image (latest from gallery) |
| Navigation | Clicking a card navigates to the respective service page |

### FR-4: Deprecation of Old Page

The existing static construction services page must be deprecated.

| Action | Description |
|--------|-------------|
| Remove Old Route | `/services/construction` route to be removed |
| Redirect | Any existing links to `/services/construction` should redirect to `/services` |
| Content Migration | Existing contact information to be retained in footer or contact page |

---

## Non-Functional Requirements

### NFR-1: Navigation Performance

- Dropdown menu must render without layout shift
- Menu animation must be smooth (60fps)
- No blocking of main content loading

### NFR-2: SEO Considerations

- Each service page must have unique meta title and description
- URL structure must be clean and descriptive
- Breadcrumb support for service pages

### NFR-3: Accessibility

- Dropdown menu must be keyboard navigable
- Proper ARIA attributes for expandable menus
- Focus management for mobile accordion

### NFR-4: Responsive Design

- Desktop: Horizontal dropdown below nav item
- Tablet: Same as desktop or touch-friendly dropdown
- Mobile: Accordion-style expansion in mobile menu

---

## Out of Scope

- Gallery functionality (covered in Spec 3)
- Image upload functionality (covered in Spec 4)
- Data model details (covered in Spec 2)
- Admin management interface (covered in Spec 4)

---

## Dependencies

- Existing Header component
- Existing Footer component
- Current routing structure

---

## Success Criteria

1. Services dropdown menu appears in both desktop and mobile navigation
2. All 6 service category links are accessible from the dropdown
3. Navigation to each service page works correctly
4. Old construction services page is redirected appropriately
5. Menu is fully responsive and accessible

---

## User Flows

### UF-1: Public User Browses Services

```
User lands on homepage
    → Hovers over "Services" in navigation
    → Dropdown appears with 6 categories
    → Clicks "Walls & Masonry"
    → Navigates to /services/walls
    → Views gallery of wall construction images
```

### UF-2: Mobile User Browses Services

```
User opens mobile menu (hamburger)
    → Taps "Services"
    → Submenu expands showing 6 categories
    → Taps "Interiors & Finishes"
    → Navigates to /services/interiors
    → Views gallery of interior work images
```

---

## Visual Requirements

### VR-1: Dropdown Menu Appearance

| Element | Specification |
|---------|---------------|
| Background | Match site theme (dark navy) |
| Border | Subtle border matching design system |
| Shadow | Soft drop shadow for elevation |
| Spacing | Adequate padding for touch targets |
| Hover State | Highlight background on item hover |
| Active State | Visual indicator for current page |

### VR-2: Mobile Submenu Appearance

| Element | Specification |
|---------|---------------|
| Indicator | Chevron icon showing expand/collapse state |
| Animation | Smooth height transition on expand/collapse |
| Indentation | Child items visually indented from parent |
| Separator | Visual separation between parent and children |
