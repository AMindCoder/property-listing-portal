# Authentication & Authorization Spec 4: UI Component Updates for Role-Based Access

## Problem Statement

Admin UI components currently show all action buttons (Edit, Delete, Add, Save) to all users. For viewers, these buttons should be visible but disabled, allowing them to see the full interface without being able to make changes.

**Key Principle:** Viewers see everything, but cannot modify anything.

## Current State

- All action buttons are always enabled
- No role-based conditional rendering
- Components don't receive or check user role

## Required Changes

### 1. Components Requiring Updates

| Component | File | Actions to Disable |
|-----------|------|-------------------|
| AdminPropertyCard | `src/app/components/AdminPropertyCard.tsx` | Edit link, Delete button |
| AdminHeader | `src/app/components/AdminHeader.tsx` | Show role badge (no disable needed) |
| Leads Dashboard | `src/app/admin/leads/page.tsx` | Status dropdown, Delete button, Reminder button |
| Admin Dashboard | `src/app/admin/page.tsx` | "Add Property" button |
| Services Admin | `src/app/admin/services/page.tsx` | Any add/edit actions |
| Service Gallery | `src/app/admin/services/[slug]/page.tsx` | Upload, Edit, Delete gallery items |
| Add Property Page | `src/app/admin/add/page.tsx` | Entire form / page access |
| Edit Property Page | `src/app/admin/edit/[id]/page.tsx` | Entire form / page access |

### 2. Disabled State Styling

Disabled elements should:
- Have reduced opacity (0.5-0.6)
- Show `cursor: not-allowed`
- Not respond to click/hover effects
- Optionally show tooltip explaining "View only mode"

**CSS Classes to Add:**

```css
.action-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.action-disabled-interactive {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 3. Component-Specific Requirements

#### AdminPropertyCard

| Element | Admin | Viewer |
|---------|-------|--------|
| Edit Link | Clickable, navigates to edit page | Visible, disabled, no navigation |
| Delete Button | Clickable, triggers delete | Visible, disabled, no action |

**Props to Add:**
```typescript
interface AdminPropertyCardProps {
  property: Property
  onDelete: (id: string) => void
  canModify?: boolean  // NEW - defaults to true for backward compat
}
```

#### Leads Dashboard

| Element | Admin | Viewer |
|---------|-------|--------|
| Status Dropdown | Editable, changes status | Visible as badge/text (not dropdown) OR disabled dropdown |
| Delete Button | Clickable | Disabled |
| Reminder Button | Clickable | Disabled |
| Filter Dropdown | Editable | Editable (filtering is read-only operation) |

**Recommendation:** Convert status dropdown to static badge for viewers, keeping the UI cleaner.

#### Admin Dashboard

| Element | Admin | Viewer |
|---------|-------|--------|
| "Add Property" Button | Clickable, navigates | Disabled with tooltip |
| Property Cards | Full functionality | Edit/Delete disabled |

#### Services Admin

| Element | Admin | Viewer |
|---------|-------|--------|
| "Manage Gallery" Links | Clickable | Clickable (viewing is allowed) |
| Any "Add" buttons | Clickable | Disabled |

#### Service Gallery Page

| Element | Admin | Viewer |
|---------|-------|--------|
| Upload Form/Button | Visible and functional | Hidden OR disabled |
| Edit Image Button | Clickable | Disabled |
| Delete Image Button | Clickable | Disabled |
| Reorder (if exists) | Functional | Disabled |

#### Add Property Page

| Behavior | Admin | Viewer |
|----------|-------|--------|
| Page Access | Full form | Access denied message OR disabled form |

**Option A:** Show "Access Denied - Admin Only" message
**Option B:** Show form but all inputs disabled with banner

**Recommendation:** Option B - viewer sees what they're missing, maintains UI consistency

#### Edit Property Page

Same as Add Property Page - show disabled form or access message.

### 4. Role Badge in Header

Add a visual indicator of the current user's role:

| Role | Badge |
|------|-------|
| Admin | `Admin` (green/copper badge) |
| Viewer | `Viewer` or `View Only` (gray badge) |

**Location:** AdminHeader, next to username or logout button

### 5. View-Only Banner

For pages where viewer has limited access, show a subtle banner:

```
┌─────────────────────────────────────────────────────┐
│ 👁️ View Only Mode - You cannot make changes        │
└─────────────────────────────────────────────────────┘
```

**Pages to show banner:**
- `/admin` (dashboard)
- `/admin/leads`
- `/admin/services`
- `/admin/services/[slug]`
- `/admin/add` (if showing disabled form)
- `/admin/edit/[id]` (if showing disabled form)

### 6. Implementation Pattern

Components should use the `useUser` hook:

```typescript
import { useUser } from '@/app/contexts/UserContext'

function AdminPropertyCard({ property, onDelete }) {
  const { user } = useUser()
  const canModify = user?.canModify ?? false

  return (
    <div>
      {/* ... card content ... */}

      <button
        onClick={canModify ? () => onDelete(property.id) : undefined}
        disabled={!canModify}
        className={!canModify ? 'action-disabled-interactive' : ''}
        title={!canModify ? 'View only mode' : 'Delete property'}
      >
        Delete
      </button>
    </div>
  )
}
```

## Acceptance Criteria

### AdminPropertyCard
- [ ] Edit button/link disabled for viewers
- [ ] Delete button disabled for viewers
- [ ] Disabled state visually distinct (opacity, cursor)
- [ ] Card content (image, title, price) fully visible

### Leads Dashboard
- [ ] Status cannot be changed by viewer
- [ ] Delete button disabled for viewer
- [ ] Reminder button disabled for viewer
- [ ] Viewing/filtering leads works for viewer

### Admin Dashboard
- [ ] "Add Property" button disabled for viewer
- [ ] Property cards show with disabled actions
- [ ] Dashboard stats (if any) visible to viewer

### Services Pages
- [ ] Gallery viewing works for viewer
- [ ] Upload disabled for viewer
- [ ] Edit/Delete gallery items disabled for viewer

### Add/Edit Property Pages
- [ ] Viewer sees disabled form OR access denied message
- [ ] No form submission possible for viewer

### Header
- [ ] Role badge visible (Admin/Viewer)
- [ ] Username displayed
- [ ] Logout works for both roles

### View-Only Banner
- [ ] Banner shown on admin pages for viewers
- [ ] Banner not shown for admins
- [ ] Banner is subtle, not intrusive

### General
- [ ] All disabled buttons have `disabled` attribute
- [ ] Disabled elements have visual feedback (opacity, cursor)
- [ ] No JavaScript errors when viewer clicks disabled elements
- [ ] Tooltips explain "View only" where appropriate

## Files to Modify

| File | Changes |
|------|---------|
| `src/app/components/AdminPropertyCard.tsx` | Add canModify prop, disable actions |
| `src/app/components/AdminHeader.tsx` | Add role badge |
| `src/app/admin/page.tsx` | Disable Add button, pass canModify to cards |
| `src/app/admin/leads/page.tsx` | Disable status/delete/reminder |
| `src/app/admin/services/page.tsx` | Disable any add actions |
| `src/app/admin/services/[slug]/page.tsx` | Disable upload/edit/delete |
| `src/app/admin/add/page.tsx` | Disabled form or access denied |
| `src/app/admin/edit/[id]/page.tsx` | Disabled form or access denied |
| `src/app/globals.css` | Add disabled state classes |

## New Components to Create

| Component | Purpose |
|-----------|---------|
| `ViewOnlyBanner` | Reusable banner showing view-only mode |
| `RoleBadge` | Badge showing Admin/Viewer role |

## Out of Scope

- Hiding elements entirely for viewers (they should see, not do)
- Different page layouts per role
- Animated transitions between enabled/disabled states

## Dependencies

- **Spec 2**: `useUser` hook must be available
- **Spec 1**: Session must include role information

## UX Considerations

1. **Transparency**: Viewer knows they're in view-only mode
2. **Consistency**: All disabled elements look the same
3. **Discoverability**: Viewer sees full UI, understands what admin can do
4. **No Frustration**: Clear feedback, no silent failures
