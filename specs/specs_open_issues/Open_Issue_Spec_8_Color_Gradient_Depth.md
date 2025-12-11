# Open Issue Spec 8: Color, Gradient & Visual Depth

## Problem Statement

The current design has a cohesive color theme (navy/steel blues with copper/bronze accents) but:
- Backgrounds are mostly flat solid colors
- The copper/bronze accent is underutilized
- Sections lack visual depth and separation
- Hero sections feel flat without gradient depth
- No grain or texture overlays for premium feel

## Current State

### Color Palette
- **Primary background**: Dark navy (#0f1729 or similar)
- **Secondary background**: Slightly lighter navy
- **Accent**: Copper/bronze (used sparingly in hover states)
- **Text**: White/off-white, gray variants

### Current Issues
- Flat backgrounds throughout
- Accent color barely visible in UI
- Sections blend together without clear separation
- Hero areas lack visual interest
- No texture or grain for depth

## Required Improvements

### Gradient Backgrounds

| Section | Current | Required |
|---------|---------|----------|
| **Page backgrounds** | Solid color | Subtle gradient (dark to slightly lighter) |
| **Hero sections** | Solid/minimal | Gradient with depth, optional radial glow |
| **Cards** | Solid with border | Subtle gradient or glass effect |
| **Footer** | Solid | Gradient transition from content |

### Gradient Specifications

#### Page Background Gradient
- Direction: Top to bottom or diagonal
- From: Darkest navy (top)
- To: Slightly warmer/lighter navy (bottom)
- Should be subtle, not dramatic

#### Hero Section Gradient
- More pronounced gradient
- Optional: Radial glow accent (copper/bronze at low opacity)
- Creates focal point for main content

#### Card Backgrounds
- Very subtle gradient (top lighter, bottom darker)
- Or: Subtle border gradient (accent color)
- Creates lift and dimension

### Accent Color Usage

| Element | Current Usage | Enhanced Usage |
|---------|---------------|----------------|
| **Primary buttons** | Solid copper | Gradient copper (lighter to darker) |
| **Hover states** | Color change | Add accent glow |
| **Active nav items** | Underline | Accent color underline/indicator |
| **Section dividers** | None | Subtle accent line or gradient |
| **Icons** | Theme-default | Accent color for service icons |
| **Price tags** | Plain text | Accent background or color |
| **Status badges** | Various colors | Keep, but add accent for "featured" |

### Grain/Noise Texture Overlay

| Property | Value |
|----------|-------|
| **Opacity** | 2-5% (very subtle) |
| **Pattern** | Fine noise/grain |
| **Application** | Full page background |
| **Purpose** | Adds depth, reduces "digital" flatness |

### Section Separation

| Method | Usage |
|--------|-------|
| **Gradient transitions** | Between major sections |
| **Subtle divider lines** | Between content blocks |
| **Background shade change** | Alternating sections |
| **Spacing + shadow** | Card groups from background |

### Visual Depth Techniques

| Technique | Application |
|-----------|-------------|
| **Shadow layers** | Cards, modals, dropdowns |
| **Border gradients** | Featured items, primary cards |
| **Glow effects** | CTAs, important actions |
| **Overlay gradients** | Image overlays for text readability |

## Specific Component Enhancements

### Homepage Hero
- Gradient background with radial accent glow
- Subtle grain overlay
- Clear visual separation from property grid

### Property Cards
- Subtle inner gradient (top to bottom)
- Enhanced hover shadow with slight accent tint
- Image overlay gradient for title readability

### Service Category Cards
- Accent border on hover
- Icon with accent color
- Subtle gradient background

### Admin Dashboard
- Darker background variant for admin context
- Clear card elevation from background
- Section grouping with subtle backgrounds

### Footer
- Gradient transition from content area
- Slightly different shade from main background
- Accent color in social icons or links

## Color Temperature

| Area | Current | Adjustment |
|------|---------|------------|
| **Main background** | Cool navy | Keep or warm slightly |
| **Section transitions** | None | Subtle warm shift |
| **Accent interactions** | Copper | Warm glow on hover |
| **Error states** | Red | Keep (warm already) |
| **Success states** | Green | Keep |

## Acceptance Criteria

- [ ] Page backgrounds have subtle gradients
- [ ] Hero sections have visual depth with gradient/glow
- [ ] Cards have subtle gradient or enhanced shadow
- [ ] Accent color (copper) is visible in navigation, buttons, icons
- [ ] Grain/noise overlay adds subtle texture
- [ ] Sections have clear visual separation
- [ ] Primary buttons have gradient treatment
- [ ] Footer transitions smoothly from content
- [ ] Visual hierarchy is enhanced through depth

## Performance Considerations

- [ ] Gradients should be CSS-only (no images)
- [ ] Grain overlay should be lightweight (SVG filter or small repeating image)
- [ ] No impact on paint performance
- [ ] Background-attachment: fixed should be avoided (performance)

## Accessibility

- [ ] Text contrast remains WCAG compliant on all backgrounds
- [ ] Gradients do not interfere with text readability
- [ ] Color is not the only indicator of state
- [ ] Works in high contrast mode

## Out of Scope

- Complete color palette redesign
- Light mode / theme switching
- Animated gradients
- Complex illustration backgrounds

## Dependencies

- Spec 7 (Typography) - text must remain readable on enhanced backgrounds
- Spec 4 (Icons) - icons should use accent color

## Notes

- Test gradients on various monitors (color reproduction varies)
- Grain texture should be barely perceptible
- Accent usage should feel intentional, not random
- Consider CSS custom properties for gradient colors
