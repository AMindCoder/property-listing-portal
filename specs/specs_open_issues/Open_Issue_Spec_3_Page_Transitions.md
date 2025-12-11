# Open Issue Spec 3: Page Transitions & Motion

## Problem Statement

Navigation between pages feels abrupt with no visual transitions. Content appears instantly without any entrance animations, making the experience feel jarring and less polished. This affects both public-facing pages and admin pages.

## Current Behavior

- Page changes happen instantly with no transition
- Content appears abruptly when navigating between routes
- No visual feedback during route changes
- Loading states show plain "Loading..." text
- No entrance animations for page content

## Required Behavior

### Page-Level Transitions

| Transition Type | Description |
|-----------------|-------------|
| **Page Enter** | New page content should fade in and optionally slide up subtly |
| **Page Exit** | Current page should fade out before new content appears |
| **Duration** | Transitions should be quick (150-300ms) to not feel sluggish |
| **Easing** | Use smooth easing curves, not linear |

### Route Change Indicator

| Requirement | Description |
|-------------|-------------|
| **Loading bar** | Optional: Thin progress bar at top of page during navigation |
| **Prevents flash** | Content should not flash or flicker during transition |

### Content Reveal Animations

| Element Type | Animation |
|--------------|-----------|
| **Page headings** | Fade in + subtle slide up |
| **Cards/Grid items** | Staggered fade in (first card, then second, etc.) |
| **Lists/Tables** | Staggered row reveal |
| **Hero sections** | Fade in with slight scale or slide |

### Scroll-Triggered Animations

| Requirement | Description |
|-------------|-------------|
| **Below-fold content** | Elements entering viewport should animate in |
| **One-time trigger** | Animation should only play once, not on every scroll |
| **Subtle effect** | Fade + small translate (10-20px), not dramatic |

## Pages Affected

### Public Pages
- `/` - Homepage (property grid, filters, hero)
- `/services` - Services listing
- `/services/[slug]` - Service gallery
- `/properties/[id]` - Property detail
- `/login` - Login form

### Admin Pages
- `/admin` - Dashboard (property cards)
- `/admin/leads` - Leads table
- `/admin/services` - Services management
- `/admin/services/[slug]` - Gallery management
- `/admin/add` - Add property form
- `/admin/edit/[id]` - Edit property form

## Animation Specifications

### Timing Values

| Animation | Duration | Delay | Easing |
|-----------|----------|-------|--------|
| Page fade | 200ms | 0ms | ease-out |
| Card stagger | 150ms | 50ms per item | ease-out |
| Scroll reveal | 300ms | 0ms | ease-out |
| Heading entrance | 250ms | 50ms | ease-out |

### Performance Requirements

- [ ] Animations must not cause layout shift (CLS)
- [ ] Animations must run at 60fps
- [ ] Use `transform` and `opacity` only (GPU-accelerated)
- [ ] Respect `prefers-reduced-motion` user preference
- [ ] Animations should be disabled for users who prefer reduced motion

## Acceptance Criteria

- [ ] Navigating between pages shows a smooth fade transition
- [ ] Page content animates in on initial load
- [ ] Property cards/service cards have staggered entrance animation
- [ ] Table rows (leads) have subtle staggered reveal
- [ ] Below-fold content animates when scrolled into view
- [ ] Animations respect `prefers-reduced-motion` media query
- [ ] No layout shift occurs during animations
- [ ] Animations feel fast and responsive, not slow or floaty

## Out of Scope

- Complex 3D animations
- Parallax scrolling effects
- Animated illustrations or Lottie files
- Sound effects
- Page exit animations that delay navigation

## Dependencies

None - can be implemented independently.

## Notes

- Start with page-level transitions, then add scroll-triggered animations
- Consider using CSS-only approach first for simplicity
- Test on lower-end devices to ensure performance
