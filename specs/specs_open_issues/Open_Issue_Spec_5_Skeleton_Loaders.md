# Open Issue Spec 5: Skeleton Loaders

## Problem Statement

Loading states across the application display plain "Loading..." text, which:
- Feels unpolished and generic
- Provides no visual indication of what content is coming
- Creates a jarring experience when content suddenly appears
- Does not match the premium aesthetic of the application

## Current Behavior

| Page | Current Loading State |
|------|----------------------|
| `/` (Homepage) | "Loading properties..." text |
| `/admin` | "Loading..." text |
| `/admin/leads` | "Loading leads..." text |
| `/admin/services` | Unknown |
| `/services` | Unknown |
| Property detail | Unknown |

## Required Behavior

### Skeleton Loader Concept

Instead of text, display animated placeholder shapes that match the layout of the content being loaded. This:
- Shows users what to expect
- Maintains layout stability (no content jump)
- Provides visual feedback that something is happening

### Skeleton Components Needed

#### Property Card Skeleton
For homepage and admin dashboard property grids:
- Image placeholder (rectangle, same aspect ratio as property images)
- Title placeholder (wide bar)
- Location placeholder (medium bar)
- Price placeholder (short bar)
- Badge/tag placeholders (small rounded rectangles)

#### Leads Table Skeleton
For `/admin/leads`:
- Table header (static, not skeleton)
- Row placeholders with cell-shaped bars
- 5-10 skeleton rows to indicate list content

#### Service Category Card Skeleton
For `/services` and `/admin/services`:
- Icon placeholder (circle)
- Title placeholder (bar)
- Description placeholder (2 shorter bars)
- Project count placeholder (small bar)

#### Gallery Grid Skeleton
For `/services/[slug]`:
- Image placeholders in grid layout
- Match the actual gallery grid columns

### Skeleton Styling

| Property | Value |
|----------|-------|
| **Background color** | Subtle gray that matches theme (e.g., `#2a2a3a` for dark theme) |
| **Animation** | Shimmer/pulse effect moving left to right |
| **Animation duration** | 1.5-2 seconds per cycle |
| **Corner radius** | Match actual content (e.g., rounded for cards, square for tables) |

### Skeleton Display Duration

- Skeleton should display immediately when page loads
- Skeleton should transition smoothly to actual content
- Minimum display time: None (show actual content as soon as ready)
- Skeleton should not flash if content loads quickly (<100ms)

## Pages Requiring Skeleton Loaders

| Page | Skeleton Type | Priority |
|------|---------------|----------|
| `/` Homepage | Property card grid | High |
| `/admin` Dashboard | Property card grid | High |
| `/admin/leads` | Table rows | High |
| `/services` | Category cards | Medium |
| `/admin/services` | Category cards | Medium |
| `/services/[slug]` | Gallery grid | Medium |
| `/properties/[id]` | Property detail | Low |

## Acceptance Criteria

- [ ] Homepage displays property card skeletons during load
- [ ] Admin dashboard displays property card skeletons during load
- [ ] Leads page displays table row skeletons during load
- [ ] Services pages display category card skeletons during load
- [ ] Skeletons have animated shimmer/pulse effect
- [ ] Skeletons match the dimensions of actual content
- [ ] No layout shift when content replaces skeletons
- [ ] Skeletons use theme-appropriate colors
- [ ] Content transition from skeleton is smooth (no flash)

## Skeleton vs Spinner Usage

| Scenario | Use Skeleton | Use Spinner |
|----------|--------------|-------------|
| Page initial load | Yes | No |
| List/grid loading | Yes | No |
| Form submission | No | Yes |
| Button action in progress | No | Yes |
| Background data refresh | No | Optional small indicator |

## Out of Scope

- Spinners for button/form actions
- Full-page loading overlays
- Progress bars for uploads
- Skeleton for navigation elements

## Dependencies

None - can be implemented independently.

## Notes

- Skeleton components should be reusable
- Consider creating base skeleton primitives: `SkeletonRect`, `SkeletonCircle`, `SkeletonText`
- Compose these into page-specific skeleton layouts
