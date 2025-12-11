# Open Issue Spec 4: Custom SVG Icons for Services

## Problem Statement

The Services pages currently use emoji icons (`🏗️`) for all service categories. While functional, emoji icons:
- Appear generic and unprofessional
- Render differently across operating systems and browsers
- Cannot be styled (color, size consistency) with CSS
- Do not match the premium aesthetic of the rest of the design

## Current Behavior

### Services Page (`/services`)
Each service category card displays the same emoji `🏗️`:
- Foundations & Structure - `🏗️`
- Walls & Masonry - `🏗️`
- Interiors & Finishes - `🏗️`
- Roofing & Ceilings - `🏗️`
- Stairs & Railings - `🏗️`
- Exteriors & Landscaping - `🏗️`

### Admin Services Page (`/admin/services`)
Same pattern - all categories show `🏗️`

## Required Behavior

### Unique Icons Per Category

Each service category should have a distinct, custom SVG icon that represents the service:

| Category | Icon Concept |
|----------|--------------|
| **Foundations & Structure** | Foundation blocks / structural frame |
| **Walls & Masonry** | Brick wall / trowel |
| **Interiors & Finishes** | Interior room / paint roller |
| **Roofing & Ceilings** | House roof / ceiling grid |
| **Stairs & Railings** | Staircase / railing |
| **Exteriors & Landscaping** | House exterior / tree/plant |

### Icon Requirements

| Requirement | Description |
|-------------|-------------|
| **Format** | SVG (inline or as component) |
| **Style** | Line art or minimal filled, consistent stroke width |
| **Size** | Scalable, default display ~48px |
| **Color** | Should inherit from CSS (`currentColor`) or use theme accent color |
| **Consistency** | All icons should have same visual weight and style |

### Icon Display Locations

| Location | Current | Required |
|----------|---------|----------|
| `/services` category cards | Emoji in circle | SVG icon |
| `/admin/services` management cards | Emoji | SVG icon |
| `/services/[slug]` page header | May have emoji | SVG icon |
| Navigation dropdown (if exists) | N/A | Optional: small icon |

### Styling Requirements

- Icons should use the copper/bronze accent color from the theme
- Icons should have hover state (subtle color shift or scale)
- Icons should be centered within their container
- Dark background context: icons should be visible (lighter color or accent)

## Acceptance Criteria

- [ ] Each of the 6 service categories has a unique SVG icon
- [ ] Icons are visually consistent in style and weight
- [ ] Icons render identically across all browsers
- [ ] Icons use theme colors (can be styled via CSS)
- [ ] Icons display correctly on `/services` page
- [ ] Icons display correctly on `/admin/services` page
- [ ] Icons scale properly at different sizes
- [ ] Icons have appropriate alt text or aria-label for accessibility

## Icon Style Guidelines

### Do
- Simple, recognizable shapes
- Consistent 2px stroke weight (if line art)
- Rounded corners/caps for friendlier feel
- Single color (inherit or theme accent)

### Don't
- Overly detailed or realistic illustrations
- Multiple colors per icon
- Gradients or shadows within icon
- Inconsistent sizing between icons

## Out of Scope

- Animated icons
- Icon library integration (Font Awesome, etc.)
- Icons for other parts of the application
- Icon picker in admin for custom category icons

## Dependencies

None - can be implemented independently.

## Notes

- Icons can be created as React components for easy reuse
- Consider creating an `<ServiceIcon category={slug} />` component
- SVGs should be optimized (remove unnecessary metadata)
