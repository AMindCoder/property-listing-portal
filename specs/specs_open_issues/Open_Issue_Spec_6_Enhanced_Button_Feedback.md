# Open Issue Spec 6: Enhanced Button & Interactive Feedback

## Problem Statement

Buttons and interactive elements have minimal feedback on interaction. Current hover/active states are basic, making the interface feel less responsive and tactile. Users benefit from clear visual feedback that their interactions are registered.

## Current Behavior

### Buttons
- Basic hover state (color change only)
- No active/pressed state animation
- No scale or shadow changes
- Inconsistent feedback across button types

### Links
- Color change on hover
- No other visual feedback

### Cards
- Some have hover shadow
- No press/active feedback
- Inconsistent across card types

### Form Elements
- Basic focus styles
- No enhanced interaction states

## Required Behavior

### Button Interaction States

| State | Visual Feedback |
|-------|-----------------|
| **Default** | Base styling |
| **Hover** | Subtle lift effect (shadow increase + slight scale up ~1.02) |
| **Active/Pressed** | Press down effect (scale down ~0.98, shadow decrease) |
| **Focus** | Clear focus ring for accessibility |
| **Disabled** | Reduced opacity, no hover effects |
| **Loading** | Spinner + disabled state |

### Button Types Requiring Enhancement

| Button Type | Location | Current | Required Enhancement |
|-------------|----------|---------|----------------------|
| **Primary (CTA)** | Add Property, Submit forms | Color change | Lift + press feedback |
| **Secondary** | Cancel, View Site, etc. | Color change | Lift + press feedback |
| **Danger** | Delete buttons | Color change | Lift + press feedback |
| **Icon buttons** | Delete, reminder icons | Color change | Scale + background feedback |
| **Nav links** | Header navigation | Underline/color | Subtle scale or underline animation |

### Card Interaction States

| State | Visual Feedback |
|-------|-----------------|
| **Default** | Base shadow |
| **Hover** | Lift effect (increased shadow, slight translate-Y up) |
| **Active/Click** | Brief press down before navigation |

### Form Element States

| Element | Enhancement |
|---------|-------------|
| **Input focus** | Subtle border glow or accent color border |
| **Select hover** | Background color change |
| **Checkbox/Radio** | Scale animation on toggle |

### Micro-interactions

| Interaction | Animation |
|-------------|-----------|
| **Toggle switches** | Smooth slide with bounce |
| **Dropdowns opening** | Fade + slight slide down |
| **Dropdown closing** | Fade out |
| **Toast notifications** | Slide in from right, slide out |
| **Modal opening** | Fade + scale from center |
| **Modal closing** | Fade + scale down |

## Animation Specifications

### Button Hover
```
transform: translateY(-2px) scale(1.02)
box-shadow: increase by ~4px blur
transition: 150ms ease-out
```

### Button Active
```
transform: translateY(0) scale(0.98)
box-shadow: decrease
transition: 50ms ease-in
```

### Card Hover
```
transform: translateY(-4px)
box-shadow: 0 12px 24px rgba(0,0,0,0.15)
transition: 200ms ease-out
```

## Timing Guidelines

| Animation | Duration | Easing |
|-----------|----------|--------|
| Button hover in | 150ms | ease-out |
| Button hover out | 200ms | ease-in |
| Button press | 50ms | ease-in |
| Card hover | 200ms | ease-out |
| Focus ring | 100ms | ease |
| Dropdown | 150ms | ease-out |

## Acceptance Criteria

- [ ] Primary buttons have lift effect on hover
- [ ] All buttons have press-down effect on click/active
- [ ] Property cards lift on hover
- [ ] Service category cards lift on hover
- [ ] Icon buttons (delete, etc.) have scale + background feedback
- [ ] Form inputs have enhanced focus states
- [ ] Dropdown menus animate open/close
- [ ] All animations are smooth (60fps)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Focus states are clearly visible for accessibility

## Accessibility Requirements

- [ ] Focus indicators must meet WCAG contrast requirements
- [ ] Animations must not cause accessibility issues
- [ ] Reduced motion preference must disable/simplify animations
- [ ] Interactive elements must have sufficient touch targets (44x44px minimum)

## Out of Scope

- Sound feedback on interactions
- Haptic feedback (mobile vibration)
- Complex gesture interactions
- Drag and drop animations

## Dependencies

- May share animation utilities with Spec 3 (Page Transitions)

## Notes

- Use CSS transitions primarily, JS only where necessary
- Consider creating shared animation CSS classes
- Test on touch devices for appropriate feedback
