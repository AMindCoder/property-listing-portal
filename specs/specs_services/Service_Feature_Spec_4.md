# Spec 4: Admin Interface for Services Management

## Overview

This specification defines the admin interface for managing service categories and their gallery items. The interface enables authenticated administrators to create, edit, delete, and organize construction portfolio content across all service categories.

---

## Goals

1. Provide an intuitive interface for managing service category galleries
2. Enable easy image upload with description entry
3. Support gallery organization through drag-and-drop ordering
4. Maintain consistency with existing admin interface patterns
5. Ensure all operations are available only to authenticated admins

---

## Admin Interface Location

### Navigation Structure

| Path | Purpose |
|------|---------|
| `/admin` | Existing admin dashboard |
| `/admin/services` | Services management landing page |
| `/admin/services/[slug]` | Individual category gallery management |

### Admin Menu Addition

A new "Services" menu item must be added to the admin navigation.

| Menu Item | Icon | Link | Position |
|-----------|------|------|----------|
| Services | (appropriate icon) | `/admin/services` | After existing menu items |

---

## Functional Requirements

### FR-1: Services Management Landing Page (`/admin/services`)

The landing page displays all service categories with quick stats and actions.

**Page Elements:**

| Element | Description |
|---------|-------------|
| Page Title | "Manage Services" |
| Category Cards | Card for each service category |
| Add Category | Button to add new category (future enhancement) |

**Category Card Contents:**

| Element | Description |
|---------|-------------|
| Category Name | Display name of the category |
| Category Status | Active/Inactive badge |
| Gallery Count | Number of gallery items |
| Cover Image | Thumbnail of latest gallery image |
| Manage Button | Link to category gallery management |
| Quick Actions | Toggle active, edit metadata |

### FR-2: Category Gallery Management Page (`/admin/services/[slug]`)

The main interface for managing gallery items within a category.

**Page Header:**

| Element | Description |
|---------|-------------|
| Breadcrumb | Admin > Services > [Category Name] |
| Category Title | Name of the category being managed |
| Category Description | Editable description (inline or modal) |
| Add Item Button | Primary action to add new gallery item |
| Back Link | Return to services landing page |

**Gallery Grid:**

| Element | Description |
|---------|-------------|
| Gallery Items | Grid/list of all gallery items in category |
| Empty State | Message and CTA when no items exist |
| Item Cards | Individual gallery item display |

### FR-3: Gallery Item Card (in Admin View)

Each gallery item displayed as a card with management options.

| Element | Description |
|---------|-------------|
| Thumbnail | Image thumbnail |
| Title | Gallery item title |
| Status Badge | Active/Inactive indicator |
| Created Date | When item was added |
| Edit Button | Open edit modal/page |
| Delete Button | Delete with confirmation |
| Drag Handle | For reordering (if in reorder mode) |
| Checkbox | For bulk selection |

### FR-4: Add/Edit Gallery Item Interface

Modal or dedicated page for creating/editing gallery items.

**Form Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Image | File upload | Yes (new), No (edit) | Uses ImageUploader |
| Title | Text input | Yes | Max 200 chars |
| Description | Textarea | No | Max 2000 chars |
| Project Name | Text input | No | Max 100 chars |
| Project Location | Text input | No | Max 200 chars |
| Completion Date | Date picker | No | Cannot be future |
| Alt Text | Text input | No | Defaults to title |
| Status | Toggle | Yes | Default: Active |

**Form Actions:**

| Action | Behavior |
|--------|----------|
| Save | Validate and save, close modal, refresh grid |
| Cancel | Discard changes, close modal |
| Delete (edit mode) | Delete item with confirmation |

### FR-5: Bulk Operations

Support for operating on multiple gallery items.

| Operation | Description |
|-----------|-------------|
| Select All | Checkbox to select all items |
| Select Individual | Checkbox on each item card |
| Bulk Delete | Delete all selected items |
| Bulk Activate | Set all selected to active |
| Bulk Deactivate | Set all selected to inactive |

### FR-6: Gallery Reordering

Interface for changing the display order of gallery items.

| Feature | Description |
|---------|-------------|
| Reorder Mode | Toggle button to enter reorder mode |
| Drag and Drop | Drag items to new positions |
| Save Order | Explicit save button or auto-save |
| Cancel Reorder | Exit without saving changes |
| Visual Feedback | Highlight during drag, drop zones |

### FR-7: Category Settings

Editable settings for each service category.

| Setting | Type | Description |
|---------|------|-------------|
| Name | Text | Display name (editable) |
| Slug | Text | URL slug (read-only or advanced edit) |
| Description | Textarea | Category description for landing page |
| Meta Title | Text | SEO title |
| Meta Description | Textarea | SEO description |
| Active Status | Toggle | Show/hide entire category |
| Cover Image | Select/Upload | Representative image for category card |

---

## User Interface States

### UI-1: Empty State

When a category has no gallery items.

| Element | Content |
|---------|---------|
| Illustration | Relevant empty state graphic |
| Heading | "No gallery items yet" |
| Message | "Add your first gallery item to showcase your work" |
| CTA Button | "Add Gallery Item" |

### UI-2: Loading State

While data is being fetched or saved.

| Operation | Loading Indicator |
|-----------|-------------------|
| Page Load | Skeleton cards |
| Save Operation | Button loading state + disable |
| Delete Operation | Modal with spinner |
| Image Upload | Progress bar |

### UI-3: Error States

| Error Type | Display |
|------------|---------|
| Load Failed | Error message with retry button |
| Save Failed | Toast notification with error message |
| Delete Failed | Toast notification with error message |
| Upload Failed | Error message below upload area |
| Validation Error | Inline field errors |

### UI-4: Success States

| Action | Feedback |
|--------|----------|
| Item Created | Toast: "Gallery item added successfully" |
| Item Updated | Toast: "Gallery item updated" |
| Item Deleted | Toast: "Gallery item deleted" |
| Order Saved | Toast: "Gallery order saved" |
| Status Changed | Instant visual update + toast |

---

## Access Control

### AC-1: Authentication

| Requirement | Description |
|-------------|-------------|
| Login Required | All `/admin/services/*` routes require authentication |
| Session Check | Verify valid admin session on page load |
| Redirect | Unauthenticated users redirected to login |

### AC-2: Authorization

| Role | Permissions |
|------|-------------|
| Admin | Full access to all service management functions |
| (Future) Editor | Add/edit gallery items, no category settings |
| Public | No access to admin routes |

---

## Non-Functional Requirements

### NFR-1: Responsive Admin Interface

| Breakpoint | Layout |
|------------|--------|
| Desktop (> 1024px) | Multi-column grid, full sidebar |
| Tablet (768-1024px) | Reduced columns, collapsible sidebar |
| Mobile (< 768px) | Single column, hamburger menu |

### NFR-2: Performance

| Metric | Target |
|--------|--------|
| Page Load | < 2 seconds |
| Image Thumbnail Load | Progressive/lazy loading |
| Save Operation | < 3 seconds |
| Reorder Operation | < 1 second |

### NFR-3: Usability

| Requirement | Description |
|-------------|-------------|
| Keyboard Navigation | All actions accessible via keyboard |
| Form Validation | Real-time validation feedback |
| Unsaved Changes | Warn before leaving with unsaved changes |
| Confirmation Dialogs | Destructive actions require confirmation |

### NFR-4: Consistency

| Aspect | Requirement |
|--------|-------------|
| Design System | Match existing admin UI patterns |
| Typography | Consistent with admin dashboard |
| Colors | Use existing theme colors |
| Spacing | Follow existing spacing system |
| Components | Reuse existing admin components |

---

## User Flows

### UF-1: Admin Adds New Gallery Item

```
Admin logs in
    → Navigates to Admin Dashboard
    → Clicks "Services" in admin menu
    → Sees list of 6 service categories
    → Clicks "Manage" on "Walls & Masonry"
    → Clicks "Add Gallery Item" button
    → Modal/form opens
    → Uploads image via ImageUploader
    → Enters title: "Exposed Brick Feature Wall"
    → Enters description with materials and process
    → (Optional) Fills project name and location
    → Clicks "Save"
    → Modal closes
    → New item appears in gallery grid
    → Success toast shown
```

### UF-2: Admin Edits Existing Gallery Item

```
Admin navigates to category gallery page
    → Finds item to edit
    → Clicks "Edit" button on item card
    → Edit modal/form opens with current data
    → Modifies description
    → (Optional) Uploads new image
    → Clicks "Save"
    → Modal closes
    → Item updated in grid
    → Success toast shown
```

### UF-3: Admin Reorders Gallery

```
Admin navigates to category gallery page
    → Clicks "Reorder" button
    → Grid enters reorder mode
    → Drag handles appear on items
    → Admin drags item from position 5 to position 2
    → Visual feedback shows new position
    → Admin clicks "Save Order"
    → Order persisted to database
    → Success toast shown
    → Grid exits reorder mode
```

### UF-4: Admin Bulk Deletes Items

```
Admin navigates to category gallery page
    → Checks checkbox on item 1
    → Checks checkbox on item 3
    → Checks checkbox on item 5
    → Bulk action bar appears
    → Clicks "Delete Selected"
    → Confirmation dialog shows "Delete 3 items?"
    → Admin confirms
    → Items deleted
    → Success toast shown
    → Grid refreshes without deleted items
```

---

## Out of Scope

- Role-based permissions beyond admin (future enhancement)
- Revision history for gallery items
- Scheduled publishing
- Multi-language content management
- Approval workflow for content

---

## Dependencies

- Existing admin authentication system
- Existing admin layout/components
- Existing ImageUploader component
- Service Category entity (Spec 2)
- Gallery Item entity (Spec 2)

---

## Success Criteria

1. Admin can access services management from admin dashboard
2. Admin can view all 6 service categories with stats
3. Admin can add new gallery items with image and description
4. Admin can edit existing gallery items
5. Admin can delete gallery items (single and bulk)
6. Admin can reorder gallery items
7. Admin can toggle category and item active status
8. All operations provide appropriate feedback
9. Interface is responsive and accessible
