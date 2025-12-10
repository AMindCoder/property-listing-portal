# Spec 3: Gallery Image Management & Operations

## Overview

This specification defines the gallery image management functionality, including image upload integration, image-description pairing, ordering, and lifecycle management for service category galleries. The gallery system enables the admin to showcase construction work with rich contextual information.

---

## Goals

1. Enable admin to upload images with associated descriptions for each service category
2. Support rich descriptions including materials used, construction process, and project details
3. Provide flexible ordering and organization of gallery items
4. Integrate with the existing image upload system
5. Handle image lifecycle including updates and deletions

---

## Gallery Item Structure

### Core Content

Each gallery item consists of an image paired with descriptive content.

| Component | Purpose |
|-----------|---------|
| Image | Visual representation of the construction work |
| Title | Brief caption identifying the work |
| Description | Detailed narrative about the work |
| Metadata | Additional structured information |

### Description Content Guidelines

The description field should support rich content about the construction work.

| Content Type | Example |
|--------------|---------|
| Work Description | "Load-bearing wall construction using AAC blocks" |
| Materials Used | "AAC blocks, M15 grade cement mortar, steel reinforcement" |
| Process Notes | "Two-stage construction with curing period between layers" |
| Quality Highlights | "Precision leveling with laser equipment" |
| Project Context | "Part of 3BHK residential villa construction" |

---

## Functional Requirements

### FR-1: Image Upload Integration

The gallery must integrate with the existing image upload system.

| Requirement | Description |
|-------------|-------------|
| Single Image Upload | Each gallery item has exactly one primary image |
| Image Source | Uses existing ImageUploader component/system |
| Supported Formats | JPEG, PNG, WebP (as per existing system) |
| Size Limits | As per existing image upload system limits |
| Storage | Uses existing blob storage (Vercel Blob) |

### FR-2: Gallery Item Creation

| Field | Input Type | Validation |
|-------|------------|------------|
| Image | File upload | Required, valid image format |
| Title | Text input | Required, 3-200 characters |
| Description | Textarea/Rich text | Optional, max 2000 characters |
| Project Name | Text input | Optional, max 100 characters |
| Project Location | Text input | Optional, max 200 characters |
| Completion Date | Date picker | Optional, not future date |
| Alt Text | Text input | Optional, max 200 characters (defaults to title) |
| Active Status | Toggle | Default: Active |

### FR-3: Gallery Item Editing

| Capability | Description |
|------------|-------------|
| Edit All Fields | All fields editable after creation |
| Replace Image | Admin can replace image (old image deleted from storage) |
| Preserve Order | Editing does not change display order |
| Update Timestamp | updatedAt timestamp refreshed on edit |

### FR-4: Gallery Item Deletion

| Requirement | Description |
|-------------|-------------|
| Single Delete | Delete individual gallery item |
| Bulk Delete | Delete multiple selected items |
| Image Cleanup | Associated image must be deleted from blob storage |
| Confirmation | Deletion requires confirmation |
| No Undo | Deletion is permanent (hard delete) |

### FR-5: Gallery Ordering

| Feature | Description |
|---------|-------------|
| Default Order | Items ordered by displayOrder field |
| Manual Reorder | Admin can drag-and-drop to reorder |
| Order Persistence | Order saved to database on change |
| New Item Position | New items added at the end (highest order + 1) |
| Gap Handling | Order numbers rebalanced periodically if needed |

### FR-6: Gallery Item Status

| Status | Visibility | Purpose |
|--------|------------|---------|
| Active | Visible to public | Normal published state |
| Inactive | Hidden from public | Draft or temporarily hidden |

Admin can toggle status without deleting the item.

### FR-7: Gallery Item Metadata

Optional structured metadata for enhanced information display.

| Metadata Field | Purpose |
|----------------|---------|
| Project Name | Link multiple images to same project |
| Project Location | Geographic context |
| Completion Date | Timeline context |
| Tags | Categorization (residential, commercial, etc.) |

---

## Gallery Operations

### GO-1: Add New Gallery Item

**Preconditions:**
- Admin is authenticated
- Service category exists

**Flow:**
1. Admin navigates to category management
2. Admin clicks "Add Gallery Item"
3. Admin uploads image
4. Admin fills title (required)
5. Admin fills description (optional)
6. Admin fills optional metadata
7. Admin clicks "Save"
8. System validates inputs
9. System saves gallery item
10. Gallery item appears in category gallery

**Postconditions:**
- Gallery item created with new ID
- Image stored in blob storage
- Item appears at end of gallery

### GO-2: Edit Gallery Item

**Preconditions:**
- Admin is authenticated
- Gallery item exists

**Flow:**
1. Admin navigates to gallery item
2. Admin clicks "Edit"
3. Admin modifies desired fields
4. (Optional) Admin uploads new image
5. Admin clicks "Save"
6. System validates inputs
7. System updates gallery item
8. (If image replaced) System deletes old image from storage

**Postconditions:**
- Gallery item updated
- Old image cleaned up if replaced
- Display order unchanged

### GO-3: Delete Gallery Item

**Preconditions:**
- Admin is authenticated
- Gallery item exists

**Flow:**
1. Admin selects gallery item(s)
2. Admin clicks "Delete"
3. System shows confirmation dialog
4. Admin confirms deletion
5. System deletes image from blob storage
6. System deletes gallery item from database
7. System rebalances display order if needed

**Postconditions:**
- Gallery item removed from database
- Image removed from blob storage
- Remaining items' order preserved

### GO-4: Reorder Gallery Items

**Preconditions:**
- Admin is authenticated
- Category has multiple gallery items

**Flow:**
1. Admin enters reorder mode
2. Admin drags item to new position
3. System updates display order of affected items
4. System saves new order

**Postconditions:**
- Display order updated for affected items
- Public gallery reflects new order

---

## Non-Functional Requirements

### NFR-1: Image Handling

| Requirement | Specification |
|-------------|---------------|
| Max File Size | As per existing upload system (likely 4-5MB) |
| Formats | JPEG, PNG, WebP |
| Aspect Ratio | No restriction (displayed responsively) |
| Quality | Original quality preserved |

### NFR-2: Performance

| Operation | Target |
|-----------|--------|
| Image Upload | < 5 seconds for typical image |
| Gallery Load | < 2 seconds for 20 items |
| Reorder Save | < 500ms |
| Delete | < 2 seconds (including image cleanup) |

### NFR-3: Reliability

| Requirement | Description |
|-------------|-------------|
| Transaction Safety | Gallery item + image URL saved atomically |
| Cleanup on Failure | If DB save fails, uploaded image is cleaned up |
| Orphan Prevention | No orphan images in blob storage |

### NFR-4: Storage Cleanup

| Scenario | Action |
|----------|--------|
| Item Deleted | Image deleted from blob storage |
| Image Replaced | Old image deleted from blob storage |
| Category Deleted | All category images deleted from blob storage |

---

## Out of Scope

- Image editing/cropping (use external tools before upload)
- Multiple images per gallery item
- Video content support
- Image optimization/compression (handled by upload system)
- Comments or ratings on gallery items

---

## Dependencies

- Existing image upload system (ImageUploader component)
- Existing blob storage system (Vercel Blob)
- Service Category entity (Spec 2)
- Gallery Item entity (Spec 2)

---

## Success Criteria

1. Admin can upload images with descriptions to any service category
2. Images are properly stored and retrievable
3. Admin can edit all gallery item fields
4. Admin can delete items and images are cleaned up
5. Admin can reorder gallery items
6. Gallery displays correctly with all content on public pages

---

## Error Handling

| Error Scenario | Expected Behavior |
|----------------|-------------------|
| Upload fails | Error message shown, no gallery item created |
| Invalid image format | Validation error before upload |
| Title too short | Validation error, form not submitted |
| Description too long | Validation error, form not submitted |
| Delete fails | Error message, item not deleted |
| Reorder fails | Error message, original order preserved |

---

## Content Guidelines for Admin

### Recommended Description Structure

```
[What was done]
Brief description of the construction work shown.

[Materials Used]
- Material 1
- Material 2
- Material 3

[Quality Highlights]
Any special techniques, certifications, or quality measures.

[Project Context] (optional)
Additional context about the project.
```

### Example Gallery Item

| Field | Example Content |
|-------|-----------------|
| Title | "Reinforced Foundation with Waterproofing" |
| Description | "Deep foundation construction for a 3-story residential building. Used M25 grade concrete with steel reinforcement as per structural design. Applied two coats of crystalline waterproofing to prevent moisture ingress. Foundation depth: 6 feet below ground level." |
| Project Name | "Sunrise Villa" |
| Project Location | "Whitefield, Bangalore" |
| Completion Date | "March 2024" |
| Tags | ["residential", "foundation", "waterproofing"] |
