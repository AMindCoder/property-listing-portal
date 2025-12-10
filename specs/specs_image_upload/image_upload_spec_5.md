# Spec 5: Image Delivery & Display

## Overview

A system for efficiently delivering and displaying images throughout the application, including responsive images, lazy loading, CDN integration, and optimized gallery components.

---

## Goals

1. Fast image loading with minimal bandwidth usage
2. Responsive images that adapt to device and viewport
3. Smooth user experience with lazy loading and placeholders
4. Consistent image display across all application pages
5. CDN-ready architecture for production scalability

---

## Functional Requirements

### FR-1: Responsive Image Delivery

The system must serve appropriately sized images based on context.

**Image Size Selection:**

| Context | Image Variant | Max Width |
|---------|---------------|-----------|
| Property card thumbnail | thumbnail | 150px |
| Property card image | preview | 400px |
| Property detail gallery | medium/large | 800px/1600px |
| Full-screen lightbox | large/original | 1600px/original |
| Admin list | thumbnail | 150px |
| Mobile property card | preview | 400px |

**Responsive Breakpoints:**

| Breakpoint | Name | Image Strategy |
|------------|------|----------------|
| < 640px | Mobile | Serve smaller variants |
| 640-1024px | Tablet | Serve medium variants |
| > 1024px | Desktop | Serve large variants |

### FR-2: Image URL Generation

The system must generate appropriate image URLs.

**URL Requirements:**

| Requirement | Description |
|-------------|-------------|
| Variant URLs | Generate URLs for specific variants |
| CDN prefix | Support custom CDN URL prefix |
| Fallback | Fallback URL if variant unavailable |
| Cache busting | Support cache invalidation |

**URL Patterns:**

| Pattern Type | Example |
|--------------|---------|
| Direct URL | `https://cdn.example.com/images/abc123.jpg` |
| Variant URL | `https://cdn.example.com/images/abc123_thumbnail.jpg` |
| Transform URL | `https://cdn.example.com/images/abc123?w=400&q=80` |

### FR-3: Lazy Loading

The system must lazy load images that are not in viewport.

**Lazy Loading Features:**

| Feature | Description |
|---------|-------------|
| Viewport detection | Load images when approaching viewport |
| Threshold | Configurable distance from viewport to trigger load |
| Priority loading | Load above-fold images immediately |
| Placeholder | Show placeholder until image loads |
| Native support | Use native loading="lazy" where supported |

### FR-4: Placeholder System

The system must show placeholders while images load.

**Placeholder Types:**

| Type | Description | Use Case |
|------|-------------|----------|
| Solid color | Single color placeholder | Fast, minimal |
| Blur hash | Blurred preview of image | Better UX |
| Low-quality image | Tiny version of actual image | Progressive |
| Skeleton | Animated loading skeleton | Consistent UI |
| Aspect ratio box | Empty box maintaining ratio | Prevent layout shift |

### FR-5: Error Handling

The system must handle image loading failures gracefully.

**Error Scenarios:**

| Scenario | Handling |
|----------|----------|
| Image not found (404) | Show fallback image |
| Network error | Show retry option |
| Slow loading | Show loading indicator |
| Corrupt image | Show error placeholder |
| CDN failure | Fallback to origin URL |

**Fallback Images:**

| Context | Fallback |
|---------|----------|
| Property image | Generic property placeholder |
| Construction photo | Generic construction placeholder |
| User avatar | Generic avatar |
| Any image | Generic image placeholder |

### FR-6: Image Gallery Component

The system must provide a gallery component for multiple images.

**Gallery Features:**

| Feature | Description |
|---------|-------------|
| Main image | Large display of selected image |
| Thumbnail strip | Row/grid of clickable thumbnails |
| Navigation | Previous/next buttons |
| Keyboard navigation | Arrow keys to navigate |
| Touch gestures | Swipe to navigate on mobile |
| Image counter | "3 of 10" indicator |
| Zoom | Click/pinch to zoom |
| Fullscreen | Expand to fullscreen/lightbox |

**Gallery Layouts:**

| Layout | Description |
|--------|-------------|
| Standard | Main image with thumbnail strip below |
| Sidebar | Main image with thumbnails on side |
| Grid | Equal-size grid of all images |
| Carousel | Horizontal scrolling carousel |
| Masonry | Pinterest-style masonry grid |

### FR-7: Lightbox/Fullscreen View

The system must provide a fullscreen image viewer.

**Lightbox Features:**

| Feature | Description |
|---------|-------------|
| Fullscreen display | Image fills screen with dark background |
| Navigation | Previous/next arrows |
| Close button | Clear close action |
| Keyboard support | Escape to close, arrows to navigate |
| Zoom controls | Zoom in/out, reset |
| Pan | Pan zoomed image |
| Image info | Optional caption/metadata display |
| Thumbnail strip | Optional thumbnail navigation |
| Share | Optional share buttons |

### FR-8: Image Preloading

The system must preload images for better perceived performance.

**Preloading Strategy:**

| Strategy | Description |
|----------|-------------|
| Adjacent images | Preload next/previous in gallery |
| Visible thumbnails | Preload all visible thumbnails |
| Hover preload | Preload on thumbnail hover |
| Idle preload | Preload remaining during idle time |

### FR-9: Image Caching

The system must leverage caching effectively.

**Caching Requirements:**

| Cache Type | Strategy |
|------------|----------|
| Browser cache | Set appropriate Cache-Control headers |
| Service worker | Cache frequently accessed images |
| Memory cache | Keep recently viewed in memory |
| CDN cache | Configure CDN edge caching |

**Cache Headers:**

| Image Type | Cache Duration |
|------------|----------------|
| Property images | 7 days |
| Thumbnails | 30 days |
| Static placeholders | 1 year |
| User uploads | 7 days |

### FR-10: CDN Integration

The system must support CDN delivery.

**CDN Requirements:**

| Requirement | Description |
|-------------|-------------|
| Custom domain | Support custom CDN domain |
| Origin fallback | Fallback to origin if CDN fails |
| Cache invalidation | API to invalidate CDN cache |
| Multiple CDNs | Support different CDNs per environment |
| Edge transforms | Support on-the-fly image transforms (if available) |

### FR-11: Image Metadata

The system must handle image metadata for display.

**Metadata Fields:**

| Field | Description |
|-------|-------------|
| Alt text | Accessibility description |
| Caption | User-visible caption |
| Dimensions | Width and height |
| File size | For download indication |
| Date taken | Photo date (if available) |
| Location | Photo location (if available) |

### FR-12: Accessibility

Images must be accessible.

**Accessibility Requirements:**

| Requirement | Description |
|-------------|-------------|
| Alt text | All images must have alt text |
| Decorative marking | Decorative images marked with alt="" |
| Focus indicators | Visible focus for interactive images |
| Screen reader | Gallery navigable by screen reader |
| Reduced motion | Respect motion preferences |

---

## Non-Functional Requirements

### NFR-1: Performance

- Largest Contentful Paint (LCP) under 2.5 seconds
- No Cumulative Layout Shift (CLS) from images
- First meaningful image visible within 1 second
- Gallery navigation feels instant (< 100ms)

### NFR-2: Bandwidth

- Serve WebP/AVIF to supported browsers
- Total image payload under 500KB for initial page load
- Lazy load below-fold images

### NFR-3: Reliability

- Images load successfully 99.9% of the time
- Graceful degradation when CDN is unavailable
- No broken image icons visible to users

---

## Out of Scope

- Image editing in display components
- Social sharing integration
- Image download functionality
- Print optimization
- Watermark overlay in display

---

## Integration Points

| System | Integration |
|--------|-------------|
| Storage Provider (Spec 1) | Retrieve image URLs |
| Image Processing (Spec 3) | Use generated variants |
| Uploader Component (Spec 4) | Preview uploaded images |
| Property pages | Display property images |
| Construction pages | Display construction photos |

---

## Success Criteria

1. Page load time improved by 50% compared to current implementation
2. Zero Cumulative Layout Shift from images
3. All images have appropriate alt text
4. Gallery works smoothly on mobile devices
5. Fallback images display when originals fail
6. CDN serves 95%+ of image requests in production

---

## Validation & Test Cases (P0 - MVP)

### TC-1: Responsive Image Delivery

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-1.1: Mobile variant | 1. View property card on mobile (< 640px) | Preview variant (400px) served |
| TC-1.2: Desktop variant | 1. View property card on desktop (> 1024px) | Larger variant served |
| TC-1.3: Gallery context | 1. Open property gallery | Medium/large variants served |

### TC-2: Lazy Loading

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-2.1: Below-fold images | 1. Load page with many images | Below-fold images not loaded initially |
| TC-2.2: Scroll to load | 1. Scroll down to images | Images load as they approach viewport |
| TC-2.3: Above-fold priority | 1. Load page | First visible images load immediately |

### TC-3: Placeholder System

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-3.1: Placeholder shown | 1. Load image slowly | Placeholder shown while loading |
| TC-3.2: Aspect ratio preservation | 1. Load image with placeholder | No layout shift when image loads |

### TC-4: Error Handling

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-4.1: 404 fallback | 1. Request non-existent image | Fallback placeholder shown |
| TC-4.2: No broken icons | 1. Multiple images fail | No browser broken image icons |

### TC-5: Image Gallery Component

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-5.1: Main image display | 1. Open gallery | Large main image shown |
| TC-5.2: Thumbnail strip | 1. View gallery | Thumbnails shown below/beside |
| TC-5.3: Thumbnail click | 1. Click thumbnail | Main image changes |
| TC-5.4: Previous/next buttons | 1. Click navigation arrows | Image changes correctly |
| TC-5.5: Image counter | 1. View gallery | Shows "3 of 10" etc. |

### TC-6: Lightbox/Fullscreen

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-6.1: Open lightbox | 1. Click expand button | Fullscreen overlay opens |
| TC-6.2: Close button | 1. Click close | Lightbox closes |
| TC-6.3: Navigation arrows | 1. Navigate in lightbox | Arrows work correctly |
| TC-6.4: Keyboard navigation | 1. Press arrow keys / Escape | Gallery navigates / closes |

### TC-7: Mobile Gallery

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-7.1: Touch swipe | 1. Swipe left/right | Gallery navigates |
| TC-7.2: Mobile layout | 1. View on phone | Optimized mobile layout |
| TC-7.3: Touch targets | 1. Check controls | Min 44x44px touch targets |

### TC-8: Accessibility

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-8.1: Alt text present | 1. Inspect all images | Alt text on all non-decorative |
| TC-8.2: Keyboard navigation | 1. Use only keyboard in gallery | Full gallery navigation works |
