# Spec 5: Public Service Pages & Gallery Display

## Overview

This specification defines the public-facing service pages where visitors can browse the construction portfolio galleries. Each service category has a dedicated page displaying a gallery of images with descriptions, showcasing the company's construction quality and capabilities.

---

## Goals

1. Provide an attractive, professional gallery display for each service category
2. Enable visitors to view construction work examples with full details
3. Support easy navigation between service categories
4. Optimize for visual impact and user engagement
5. Ensure fast loading and responsive design

---

## Page Structure

### Public Service Routes

| Route | Page Type | Description |
|-------|-----------|-------------|
| `/services` | Landing Page | Overview of all service categories |
| `/services/foundations` | Gallery Page | Foundations & Structure gallery |
| `/services/walls` | Gallery Page | Walls & Masonry gallery |
| `/services/interiors` | Gallery Page | Interiors & Finishes gallery |
| `/services/ceilings` | Gallery Page | Roofing & Ceilings gallery |
| `/services/stairs` | Gallery Page | Stairs & Railings gallery |
| `/services/exteriors` | Gallery Page | Exteriors & Landscaping gallery |

---

## Functional Requirements

### FR-1: Services Landing Page (`/services`)

An overview page showcasing all service categories.

**Page Elements:**

| Element | Description |
|---------|-------------|
| Hero Section | Introduction to construction services |
| Category Grid | Visual cards for each service category |
| Call to Action | Contact information or inquiry prompt |

**Hero Section Content:**

| Element | Content |
|---------|---------|
| Heading | "Our Construction Services" |
| Subheading | Brief value proposition |
| Background | Professional construction-related imagery |

**Category Card Content:**

| Element | Source |
|---------|--------|
| Image | Category cover image or latest gallery image |
| Name | Category display name |
| Description | Category description (truncated) |
| Item Count | "X projects" (gallery item count) |
| Link | Navigate to category gallery page |

### FR-2: Service Category Gallery Page (`/services/[slug]`)

Individual page for each service category displaying the gallery.

**Page Header:**

| Element | Description |
|---------|-------------|
| Breadcrumb | Home > Services > [Category Name] |
| Category Title | Full category name |
| Category Description | Full description from category settings |
| Item Count | "Showing X projects" |

**Gallery Grid:**

| Element | Description |
|---------|-------------|
| Gallery Items | Grid of gallery item cards |
| Empty State | Message when no items exist |
| Layout | Responsive masonry or grid layout |

**Category Navigation:**

| Element | Description |
|---------|-------------|
| Prev/Next Category | Links to adjacent categories |
| Category Tabs/Pills | Quick navigation to other categories |
| Back to Services | Link to services landing page |

### FR-3: Gallery Item Card (Public View)

Display of individual gallery items in the grid.

| Element | Description |
|---------|-------------|
| Image | Gallery item image (click to expand) |
| Title | Gallery item title overlay or below |
| Hover Effect | Visual indication of interactivity |

### FR-4: Gallery Item Detail View

Expanded view when clicking on a gallery item.

**Option A: Lightbox Modal**

| Element | Description |
|---------|-------------|
| Full Image | Large image display |
| Title | Item title |
| Description | Full description text |
| Metadata | Project name, location, date (if available) |
| Navigation | Prev/Next arrows to browse gallery |
| Close Button | Return to gallery grid |
| Keyboard Support | Escape to close, arrows to navigate |

**Option B: Dedicated Detail Page**

| Element | Description |
|---------|-------------|
| Full Image | Large hero image |
| Title | Item title |
| Description | Full description with formatting |
| Metadata Section | Project details |
| Related Items | Other items from same category |
| Back Link | Return to category gallery |

**Recommendation:** Lightbox modal for better UX and engagement.

### FR-5: Empty State Handling

When a category has no gallery items or is inactive.

| Scenario | Display |
|----------|---------|
| No Items | "Gallery coming soon" message |
| Category Inactive | 404 or redirect to services landing |
| All Categories Inactive | Display services landing with message |

### FR-6: Category Navigation Within Gallery Pages

Enable easy browsing between service categories.

| Navigation Element | Description |
|-------------------|-------------|
| Category Pills/Tabs | Horizontal list of category links |
| Current Indicator | Highlight current category |
| Prev/Next Links | Navigate to adjacent category |

---

## Visual Requirements

### VR-1: Gallery Grid Layout

| Aspect | Specification |
|--------|---------------|
| Layout Type | Responsive grid (3-4 columns desktop, 2 tablet, 1 mobile) |
| Aspect Ratio | Maintain image aspect ratio or use uniform containers |
| Spacing | Consistent gap between items |
| Alignment | Top-aligned items |

**Alternative: Masonry Layout**

| Aspect | Specification |
|--------|---------------|
| Layout Type | Pinterest-style masonry |
| Column Count | 3 desktop, 2 tablet, 1 mobile |
| Image Display | Full height, variable per image |

### VR-2: Gallery Item Card Styling

| Element | Styling |
|---------|---------|
| Container | Subtle border or shadow |
| Image | Cover fit, no distortion |
| Hover State | Subtle scale or overlay effect |
| Title Overlay | Semi-transparent background |
| Loading State | Skeleton or placeholder |

### VR-3: Lightbox Modal Styling

| Element | Styling |
|---------|---------|
| Backdrop | Dark semi-transparent overlay |
| Container | Centered, max-width constrained |
| Image | Fit within viewport, maintain ratio |
| Close Button | Top-right corner, clear visibility |
| Navigation Arrows | Left/right positioned |
| Text Content | Below image, scrollable if long |

### VR-4: Theme Consistency

| Aspect | Requirement |
|--------|-------------|
| Colors | Match site theme (copper/navy) |
| Typography | Use site font families |
| Spacing | Follow site spacing system |
| Animations | Subtle, professional transitions |

---

## Content Display

### CD-1: Gallery Item Information Display

What information is shown and where.

**Grid View (Card):**

| Information | Shown |
|-------------|-------|
| Image | Yes (thumbnail/medium size) |
| Title | Yes (overlay or below) |
| Description | No (truncated preview optional) |
| Metadata | No |

**Lightbox/Detail View:**

| Information | Shown |
|-------------|-------|
| Image | Yes (full size) |
| Title | Yes |
| Description | Yes (full text) |
| Project Name | Yes (if available) |
| Project Location | Yes (if available) |
| Completion Date | Yes (if available) |
| Tags | Optional |

### CD-2: Description Formatting

| Feature | Support |
|---------|---------|
| Paragraphs | Yes (preserve line breaks) |
| Lists | Optional (if rich text) |
| Links | No (plain text) |
| HTML | No (sanitized) |
| Max Display Length | Full text, scrollable if needed |

---

## Non-Functional Requirements

### NFR-1: Performance

| Metric | Target |
|--------|--------|
| Page Load (LCP) | < 2.5 seconds |
| Image Loading | Lazy load below-fold images |
| Time to Interactive | < 3 seconds |
| Image Optimization | Responsive image sizes |

### NFR-2: SEO

| Requirement | Implementation |
|-------------|----------------|
| Page Title | "[Category Name] | Construction Services | [Site Name]" |
| Meta Description | Category description or default |
| Heading Structure | Proper H1, H2 hierarchy |
| Image Alt Text | From gallery item alt text field |
| Structured Data | Optional: ImageGallery schema |
| Canonical URL | Proper canonical tags |

### NFR-3: Accessibility

| Requirement | Description |
|-------------|-------------|
| Image Alt Text | All images have descriptive alt text |
| Keyboard Navigation | Gallery and lightbox keyboard accessible |
| Focus Management | Proper focus trap in lightbox |
| Screen Reader | Meaningful announcements |
| Color Contrast | Text readable over images |

### NFR-4: Responsive Design

| Breakpoint | Layout Adjustments |
|------------|-------------------|
| Desktop (> 1200px) | 4-column grid, large images |
| Large Tablet (992-1200px) | 3-column grid |
| Tablet (768-992px) | 2-column grid |
| Mobile (< 768px) | 1-column grid, full-width lightbox |

---

## User Flows

### UF-1: Visitor Browses Service Gallery

```
Visitor lands on homepage
    → Hovers over "Services" in navigation
    → Clicks "Walls & Masonry"
    → Navigates to /services/walls
    → Sees page header with category info
    → Scrolls through gallery grid
    → Clicks on interesting image
    → Lightbox opens with full details
    → Reads description about materials and process
    → Uses arrows to view next image
    → Presses Escape to close lightbox
    → Continues browsing gallery
```

### UF-2: Visitor Navigates Between Categories

```
Visitor is viewing /services/foundations
    → Sees category navigation pills at top
    → Clicks "Interiors & Finishes"
    → Navigates to /services/interiors
    → Gallery loads for new category
```

### UF-3: Visitor Explores from Services Landing

```
Visitor clicks "Services" in navigation
    → Navigates to /services
    → Sees overview of all 6 categories
    → Views category cards with preview images
    → Clicks on "Stairs & Railings" card
    → Navigates to /services/stairs
    → Views staircase gallery
```

---

## Edge Cases

### EC-1: No Gallery Items

| Scenario | Behavior |
|----------|----------|
| Category Empty | Show "Gallery coming soon" message |
| Category Inactive | Return 404 or redirect |
| All Categories Empty | Show services landing with message |

### EC-2: Single Gallery Item

| Scenario | Behavior |
|----------|----------|
| One Item | Display single item, no prev/next navigation |
| Lightbox | Disable prev/next arrows |

### EC-3: Image Loading Failures

| Scenario | Behavior |
|----------|----------|
| Image 404 | Show placeholder image |
| Slow Loading | Show loading skeleton |
| Multiple Failures | Still show text content |

---

## Out of Scope

- User comments or ratings on gallery items
- Social sharing buttons (future enhancement)
- Gallery filtering or search
- Contact form on service pages (use existing contact)
- Image zoom/pan functionality
- Video content support

---

## Dependencies

- Service Category entity (Spec 2)
- Gallery Item entity (Spec 2)
- Header component with Services dropdown (Spec 1)
- Footer component
- Site design system (colors, typography, spacing)

---

## Success Criteria

1. All 6 service category pages are accessible via navigation
2. Services landing page displays all categories attractively
3. Gallery pages load within performance targets
4. Lightbox displays full image and description
5. Navigation between categories is intuitive
6. Pages are fully responsive across devices
7. Empty states are handled gracefully
8. SEO requirements are met (meta tags, structure)
9. Accessibility standards are met
