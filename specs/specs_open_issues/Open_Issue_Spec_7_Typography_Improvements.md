# Open Issue Spec 7: Typography Improvements

## Problem Statement

While the application uses good font choices (DM Sans, Playfair Display, JetBrains Mono), the typography lacks:
- Dramatic size contrast between heading levels
- Subtle letter-spacing (tracking) adjustments for headlines
- Optimal line-height for readability
- Consistent typographic hierarchy across pages

## Current State

### Fonts in Use
- **DM Sans** - Body text, UI elements
- **Playfair Display** - Headings, display text
- **JetBrains Mono** - Accents, monospace elements

### Current Issues
- Heading sizes feel similar, lacking hierarchy
- No letter-spacing adjustments on headlines
- Line-height may not be optimal for all text sizes
- Inconsistent application of fonts across pages

## Required Improvements

### Heading Hierarchy

| Level | Current Feel | Required Feel |
|-------|--------------|---------------|
| H1 | Large | Dramatically large, commanding |
| H2 | Medium-large | Clearly subordinate to H1, still prominent |
| H3 | Medium | Section headers, distinct from body |
| H4 | Slightly larger than body | Subsection headers |
| Body | Standard | Comfortable reading size |
| Small/Caption | Smaller | Clearly secondary information |

### Size Scale Recommendations

| Element | Mobile | Desktop | Font |
|---------|--------|---------|------|
| H1 (Page titles) | 32-36px | 48-56px | Playfair Display |
| H2 (Section titles) | 24-28px | 36-40px | Playfair Display |
| H3 (Card titles) | 20-22px | 24-28px | Playfair Display or DM Sans |
| H4 (Subsections) | 18px | 20px | DM Sans |
| Body | 16px | 16-18px | DM Sans |
| Small text | 14px | 14px | DM Sans |
| Caption/Label | 12px | 12-13px | DM Sans |

### Letter-Spacing (Tracking)

| Element | Letter-spacing |
|---------|----------------|
| H1 | -0.02em to -0.03em (tighter) |
| H2 | -0.01em to -0.02em |
| H3 | -0.01em |
| Body | Normal (0) |
| ALL CAPS text | +0.05em to +0.1em (looser) |
| Small/Caption | +0.01em |

### Line-Height

| Element | Line-height |
|---------|-------------|
| H1 | 1.1 - 1.2 |
| H2 | 1.2 - 1.3 |
| H3 | 1.3 |
| Body | 1.5 - 1.6 |
| Small text | 1.4 - 1.5 |
| UI labels | 1.2 - 1.3 |

### Font Weight Usage

| Context | Weight | Font |
|---------|--------|------|
| Page titles | 700 (Bold) | Playfair Display |
| Section titles | 600-700 | Playfair Display |
| Card titles | 600 | DM Sans or Playfair |
| Body text | 400 | DM Sans |
| Emphasized text | 500-600 | DM Sans |
| Labels | 500 | DM Sans |
| Buttons | 500-600 | DM Sans |

## Pages/Components Affected

### High Priority
- Homepage hero heading
- Page titles (Admin Dashboard, Leads, Services, etc.)
- Property card titles
- Service category titles

### Medium Priority
- Form labels
- Table headers
- Navigation links
- Button text

### Low Priority
- Footer text
- Breadcrumbs
- Metadata/timestamps

## Acceptance Criteria

- [ ] H1 headings are dramatically larger than H2
- [ ] Clear visual hierarchy from H1 through H4
- [ ] Headlines have subtle negative letter-spacing
- [ ] Body text has comfortable line-height (1.5-1.6)
- [ ] Typography is consistent across all pages
- [ ] Mobile typography is appropriately scaled
- [ ] Font weights are used consistently for each context
- [ ] All caps text has increased letter-spacing
- [ ] Text remains readable at all sizes

## Responsive Typography

| Breakpoint | H1 Scale | Body Scale |
|------------|----------|------------|
| Mobile (<640px) | 32-36px | 16px |
| Tablet (640-1024px) | 40-44px | 16px |
| Desktop (>1024px) | 48-56px | 16-18px |

## Accessibility Requirements

- [ ] Minimum body text size: 16px
- [ ] Sufficient contrast for all text
- [ ] Line-height allows comfortable reading
- [ ] Text scales with browser zoom
- [ ] No text as images

## Out of Scope

- Font changes (keep current font families)
- Variable fonts
- Custom font loading optimization
- Multi-language typography support

## Dependencies

- May affect component spacing (larger headings need more margin)
- Should coordinate with Spec 8 (Color/Gradient) for text on backgrounds

## Notes

- Create CSS custom properties for typography scale
- Consider using CSS clamp() for fluid typography
- Test typography on actual content, not lorem ipsum
