# Open Issues

## Critical
1. **No Authentication** - Admin panel (`/admin`) accessible without login. Login page only does client-side redirect, no session/cookie management.

## Cleanup
2. **Duplicate Prisma Schema** - ~~`src/prisma/schema.prisma` is obsolete~~ (Deleted)

## Pending Verification
3. **Prisma Client Sync** - After schema changes, run `npx prisma generate` and restart dev server to avoid 500 errors on API routes.

---

## UX Analysis & Improvements

### What's Working Well
- **Typography**: Uses DM Sans (body), Playfair Display (headings), JetBrains Mono (accents) - distinctive choices, not generic
- **Color Theme**: Cohesive dark theme with navy/steel blues and copper/bronze accents
- **CSS Variables**: Consistent design tokens for colors, spacing, shadows, transitions

### UX Inconsistencies

| Issue | Pages Affected | Impact |
|-------|----------------|--------|
| **Different header styles** | Admin dashboard vs Leads page | Admin uses inline buttons; Leads uses standard nav. Confusing navigation. |
| **No footer on admin pages** | `/admin/*` | Inconsistent page structure |
| **Admin Services page missing header entirely** | `/admin/services` | No navigation, user must use back button |
| **Mixed styling approaches** | Leads page uses Tailwind utilities inline; Admin uses CSS classes | Maintenance burden, inconsistent look |

### Improvements Needed (Based on Frontend Aesthetics Guidelines)

#### Typography
- [ ] **Font scaling**: Headings could use more dramatic size contrast
- [ ] **Letter-spacing**: Headlines lack subtle tracking adjustments
- [ ] **Line height**: Body text line-height could be more generous (currently adequate)

#### Color & Theme
- [ ] **Gradient depth**: Backgrounds are mostly flat; could benefit from subtle gradients with grain textures
- [ ] **Accent usage**: Copper/bronze accent underutilized - mainly in hover states only
- [ ] **Color temperature**: Consider warmer transitions between sections

#### Motion & Animation
- [ ] **Page transitions**: No page-level transitions (feels abrupt)
- [ ] **Micro-interactions**: Limited hover states; buttons could use more tactile feedback
- [ ] **Loading states**: Generic "Loading..." text; could use skeleton loaders or branded spinners
- [ ] **Scroll animations**: No reveal animations on scroll

#### Backgrounds & Texture
- [ ] **Gradient noise**: Consider subtle grain overlays for depth
- [ ] **Section breaks**: Could use more visual separation between content areas
- [ ] **Hero sections**: Services and homepage heroes lack visual depth

#### Avoiding Generic AI Aesthetics
- [x] ✅ No glass-morphism overuse
- [x] ✅ No neon color gradients
- [ ] **Emoji icons** on Services page (`🏗️`) could be replaced with custom SVG icons for a more premium feel
- [ ] **Button styles** are fairly standard; could be more distinctive

### Priority Fixes
1. **Unify admin navigation** - All admin pages should use same header component
2. **Add page transitions** - Implement subtle fade/slide transitions
3. **Replace emoji icons** - Use custom SVG icons for Services categories
4. **Add skeleton loaders** - Replace "Loading..." with skeleton UI
5. **Enhance button feedback** - Add subtle scale/shadow on press
