# Service Feature Spec 6: Bulk Upload for Gallery Items

**Version:** 1.0
**Date:** December 11, 2024
**Status:** Draft

---

## 1. Overview

### 1.1 Problem Statement

Currently, adding multiple images from the same construction project requires:
1. Clicking "Add Gallery Item" for each image
2. Re-entering the same project details (name, location, date) repeatedly
3. Uploading images one at a time

This is inefficient when a single project (e.g., "Villa Construction - Phase 1") has 10-20 images to showcase.

### 1.2 Solution

Introduce a "Bulk Upload" feature that allows admins to:
1. Enter project-level details once
2. Upload multiple images simultaneously
3. Optionally customize title/description per image
4. Create all gallery items in a single action

### 1.3 Design Principles

- **Efficiency First**: Minimize repetitive data entry
- **Flexibility**: Allow per-image customization when needed
- **Progressive Disclosure**: Show advanced options only when requested
- **Non-Destructive**: Easy to review before final submission

---

## 2. User Interface

### 2.1 Entry Point

A new "Bulk Upload" button appears next to the existing "Add Gallery Item" button on the admin gallery page (`/admin/services/[slug]`).

```
+-------------------+  +------------------+
| + Add Gallery Item |  | + Bulk Upload    |
+-------------------+  +------------------+
```

### 2.2 Bulk Upload Modal

The modal is divided into two sections:

#### Section A: Project Details (Shared across all images)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Project Name | Text | Yes | Name of the construction project |
| Project Location | Text | No | Location/address of the project |
| Completion Date | Date | No | When the project was completed |
| Project Description | Textarea | No | Description that applies to all images |
| Default Status | Toggle | Yes | Active/Inactive (default: Active) |

#### Section B: Image Upload Area

- Drag-and-drop zone for multiple images
- "Browse Files" button as alternative
- Accepts: JPG, PNG, WebP
- Max file size: 10MB per image
- Max images per batch: 20

### 2.3 Image Preview & Customization

After images are selected, display a preview grid:

```
+------------------------------------------+
| PROJECT DETAILS                          |
| Project Name: [Villa Rosa Construction]  |
| Location: [Sector 45, Gurgaon]           |
| Date: [2024-06-15]                       |
| Description: [Luxury villa with modern...|
+------------------------------------------+

+------------------------------------------+
| IMAGES (5 selected)                      |
+------------------------------------------+
| [IMG1]  | [IMG2]  | [IMG3]  | [IMG4]    |
| Title:  | Title:  | Title:  | Title:    |
| [opt]   | [opt]   | [opt]   | [opt]     |
|         |         |         |           |
| Desc:   | Desc:   | Desc:   | Desc:     |
| [opt]   | [opt]   | [opt]   | [opt]     |
|         |         |         |           |
| [x]     | [x]     | [x]     | [x]       |
+------------------------------------------+
| [IMG5]  |                               |
| Title:  |         [+ Add More Images]   |
| [opt]   |                               |
|         |                               |
| Desc:   |                               |
| [opt]   |                               |
|         |                               |
| [x]     |                               |
+------------------------------------------+

         [Cancel]  [Upload 5 Images]
```

### 2.4 Per-Image Fields (Optional)

Each image card in the preview shows:

| Field | Type | Required | Default Value |
|-------|------|----------|---------------|
| Title | Text | No | Auto-generated: "{Project Name} - Image {N}" |
| Description | Textarea | No | Inherits from Project Description |
| Remove | Button | - | Removes image from batch |

### 2.5 Expandable Image Card

By default, show compact view (image + title only). Click to expand for description editing:

**Compact View:**
```
+------------------+
| [IMAGE PREVIEW]  |
| Title: [____]    |
| [Expand v]       |
+------------------+
```

**Expanded View:**
```
+------------------+
| [IMAGE PREVIEW]  |
| Title: [____]    |
| Description:     |
| [____________]   |
| [____________]   |
| Alt Text: [____] |
| [Collapse ^]     |
+------------------+
```

---

## 3. Data Flow

### 3.1 Upload Process

```
1. User opens Bulk Upload modal
2. User enters project details
3. User selects/drops multiple images
4. Images are uploaded to Vercel Blob (in parallel)
5. Preview grid shows uploaded images with URLs
6. User optionally customizes per-image details
7. User clicks "Upload X Images"
8. API creates gallery items in batch
9. Modal closes, gallery refreshes
```

### 3.2 Image Upload Strategy

**Option A: Upload on Selection (Recommended)**
- Images upload to Vercel Blob immediately when selected
- Progress indicators show upload status per image
- Failed uploads can be retried individually
- Final "Create" only saves metadata to database

**Option B: Upload on Submit**
- Images held in memory until final submit
- All uploads happen at once
- Simpler but riskier (browser crash = lost work)

**Recommendation:** Option A for better UX and reliability.

### 3.3 Title Generation Logic

When title is left empty:

```javascript
// If project name exists
title = `${projectName} - Image ${index + 1}`

// If project name is empty
title = `Gallery Image ${index + 1}`

// Examples:
// "Villa Rosa Construction - Image 1"
// "Villa Rosa Construction - Image 2"
```

### 3.4 Description Inheritance

```javascript
// Per-image description logic
if (imageDescription) {
    // Use custom description
    finalDescription = imageDescription
} else if (projectDescription) {
    // Inherit project description
    finalDescription = projectDescription
} else {
    // No description
    finalDescription = null
}
```

---

## 4. API Design

### 4.1 Bulk Create Endpoint

**Endpoint:** `POST /api/admin/services/[slug]/gallery/bulk`

**Request Body:**
```typescript
interface BulkCreateRequest {
    // Project-level details (shared)
    projectName: string;
    projectLocation?: string;
    completionDate?: string; // ISO date
    projectDescription?: string;
    isActive: boolean;

    // Array of images
    images: Array<{
        imageUrl: string;           // Already uploaded to Blob
        imageThumbnailUrl?: string; // Optional thumbnail
        title?: string;             // Optional, auto-generated if empty
        description?: string;       // Optional, inherits project desc if empty
        imageAltText?: string;      // Optional, defaults to title
    }>;
}
```

**Response:**
```typescript
interface BulkCreateResponse {
    success: boolean;
    created: number;
    items: GalleryItem[];
    errors?: Array<{
        index: number;
        error: string;
    }>;
}
```

### 4.2 Batch Processing

The API should:
1. Validate all inputs before creating any records
2. Use database transaction for atomicity
3. Calculate display orders for new items (continue from max existing)
4. Return all created items for UI update

```typescript
// Pseudo-code for display order calculation
const maxOrder = await prisma.galleryItem.aggregate({
    where: { categoryId },
    _max: { displayOrder: true }
});

const startOrder = (maxOrder._max.displayOrder || 0) + 1;

// Each new item gets sequential order
items.forEach((item, index) => {
    item.displayOrder = startOrder + index;
});
```

---

## 5. Validation Rules

### 5.1 Project-Level Validation

| Field | Rule |
|-------|------|
| Project Name | Required, max 200 characters |
| Project Location | Optional, max 200 characters |
| Completion Date | Optional, must not be future date |
| Project Description | Optional, max 2000 characters |

### 5.2 Image-Level Validation

| Field | Rule |
|-------|------|
| Image URL | Required, must be valid Vercel Blob URL |
| Title | Optional, max 200 characters |
| Description | Optional, max 2000 characters |
| Alt Text | Optional, max 200 characters, defaults to title |

### 5.3 Batch Limits

| Limit | Value | Reason |
|-------|-------|--------|
| Max images per batch | 20 | Prevent timeout, memory issues |
| Max file size | 10MB | Vercel Blob limit |
| Allowed formats | JPG, PNG, WebP | Standard web formats |

---

## 6. UI States

### 6.1 Empty State

When modal opens:
- Project fields are empty
- Drop zone shows "Drag images here or click to browse"
- "Upload" button is disabled

### 6.2 Uploading State

When images are being uploaded to Blob:
- Progress bar on each image thumbnail
- "Uploading X of Y..." message
- Cannot submit until all uploads complete
- Can remove individual images

### 6.3 Ready State

When all images are uploaded:
- All thumbnails show checkmarks
- "Upload X Images" button is enabled
- Can still modify titles/descriptions

### 6.4 Submitting State

When creating gallery items:
- Modal shows loading overlay
- "Creating gallery items..." message
- Cannot interact with form

### 6.5 Success State

When batch creation succeeds:
- Brief success message
- Modal auto-closes after 1.5 seconds
- Gallery grid refreshes to show new items

### 6.6 Error State

When batch creation fails:
- Error message displayed
- Form remains editable
- Can retry submission

---

## 7. Edge Cases

### 7.1 Partial Upload Failure

If some images fail to upload to Blob:
- Show error indicator on failed images
- Allow retry for individual failed uploads
- Only include successfully uploaded images in final batch

### 7.2 Browser Refresh During Upload

If user refreshes during image upload:
- Uploaded images remain in Blob (orphaned)
- User loses form state
- Consider: localStorage draft save (future enhancement)

### 7.3 Duplicate Images

System does not prevent uploading duplicate images:
- Same image can be uploaded multiple times
- Each becomes a separate gallery item
- Admin responsible for avoiding duplicates

### 7.4 Network Interruption

If network fails during batch creation:
- Show error message
- Allow retry
- Database transaction ensures no partial creates

---

## 8. Accessibility

### 8.1 Keyboard Navigation

- Tab through all form fields
- Enter/Space to open file picker
- Escape to close modal
- Tab to navigate between image cards

### 8.2 Screen Reader Support

- Announce upload progress
- Describe image preview states
- Clear error messages
- Confirm successful creation

### 8.3 Focus Management

- Focus project name field when modal opens
- Return focus to "Bulk Upload" button when modal closes
- Trap focus within modal while open

---

## 9. Mobile Considerations

### 9.1 Responsive Layout

- Image grid: 2 columns on tablet, 1 column on mobile
- Project fields: full width on mobile
- Touch-friendly file selection

### 9.2 Mobile Upload

- Support camera capture (accept="image/*")
- Handle mobile file picker
- Optimize thumbnail sizes for mobile preview

---

## 10. Future Enhancements

### 10.1 Draft Save (Phase 2)
- Auto-save form state to localStorage
- Recover from browser crash
- "Continue where you left off" prompt

### 10.2 Image Reordering in Preview (Phase 2)
- Drag to reorder images before submission
- Set custom display order

### 10.3 Bulk Edit (Phase 2)
- Select multiple existing gallery items
- Update shared fields in batch
- Change status in bulk

### 10.4 Image Cropping (Phase 3)
- Crop images before upload
- Set aspect ratio constraints
- Generate optimized thumbnails

---

## 11. Success Metrics

| Metric | Target |
|--------|--------|
| Time to upload 10 images | < 2 minutes (vs ~10 min current) |
| Form completion rate | > 90% |
| Error rate | < 5% |
| User satisfaction | Positive feedback |

---

## 12. Implementation Checklist

### Backend
- [ ] Create bulk create API endpoint
- [ ] Add request validation
- [ ] Implement transaction-based batch insert
- [ ] Add error handling for partial failures

### Frontend
- [ ] Create BulkUploadModal component
- [ ] Implement drag-and-drop with react-dropzone
- [ ] Build image preview grid
- [ ] Add per-image customization UI
- [ ] Handle upload progress states
- [ ] Connect to bulk API endpoint
- [ ] Add success/error notifications

### Testing
- [ ] Unit tests for bulk API
- [ ] E2E test for bulk upload flow
- [ ] Test with max batch size (20 images)
- [ ] Test network failure scenarios
- [ ] Test mobile upload flow

---

## 13. Dependencies

| Dependency | Purpose | Already Installed |
|------------|---------|-------------------|
| react-dropzone | Drag-and-drop file upload | No |
| @vercel/blob | Image storage | Yes |
| Prisma | Database operations | Yes |

---

## 14. Appendix: Wireframes

### A. Bulk Upload Modal - Initial State

```
+----------------------------------------------------------+
|                    Bulk Upload Images                  [X]|
+----------------------------------------------------------+
|                                                          |
|  PROJECT DETAILS                                         |
|  +-------------------------------------------------+    |
|  | Project Name *                                   |    |
|  | [________________________________]               |    |
|  +-------------------------------------------------+    |
|  | Project Location          | Completion Date     |    |
|  | [____________________]    | [____/____/____]    |    |
|  +-------------------------------------------------+    |
|  | Project Description                              |    |
|  | [____________________________________________]   |    |
|  | [____________________________________________]   |    |
|  +-------------------------------------------------+    |
|                                                          |
|  IMAGES                                                  |
|  +-------------------------------------------------+    |
|  |                                                  |    |
|  |     +----------------------------------+        |    |
|  |     |                                  |        |    |
|  |     |    Drag images here              |        |    |
|  |     |         or                       |        |    |
|  |     |    [Browse Files]                |        |    |
|  |     |                                  |        |    |
|  |     |    JPG, PNG, WebP - Max 10MB    |        |    |
|  |     |    Up to 20 images               |        |    |
|  |     +----------------------------------+        |    |
|  |                                                  |    |
|  +-------------------------------------------------+    |
|                                                          |
|                          [Cancel]  [Upload Images]       |
|                                    (disabled)            |
+----------------------------------------------------------+
```

### B. Bulk Upload Modal - With Images Selected

```
+----------------------------------------------------------+
|                    Bulk Upload Images                  [X]|
+----------------------------------------------------------+
|                                                          |
|  PROJECT DETAILS                                         |
|  +-------------------------------------------------+    |
|  | Project Name *                                   |    |
|  | [Villa Rosa Construction Phase 1_____________]   |    |
|  +-------------------------------------------------+    |
|  | Project Location          | Completion Date     |    |
|  | [Sector 45, Gurgaon___]   | [15/06/2024____]    |    |
|  +-------------------------------------------------+    |
|  | Project Description                              |    |
|  | [Premium villa construction featuring modern    ]|    |
|  | [architecture and high-quality finishes.       ]|    |
|  +-------------------------------------------------+    |
|                                                          |
|  IMAGES (6 selected)                    [+ Add More]     |
|  +-------------------------------------------------+    |
|  | +----------+ +----------+ +----------+          |    |
|  | |  [IMG1]  | |  [IMG2]  | |  [IMG3]  |          |    |
|  | |    OK    | |    OK    | |    OK    |          |    |
|  | |Title:    | |Title:    | |Title:    |          |    |
|  | |[_______] | |[_______] | |[_______] |          |    |
|  | |[Expand v]| |[Expand v]| |[Expand v]|          |    |
|  | |    [x]   | |    [x]   | |    [x]   |          |    |
|  | +----------+ +----------+ +----------+          |    |
|  |                                                  |    |
|  | +----------+ +----------+ +----------+          |    |
|  | |  [IMG4]  | |  [IMG5]  | |  [IMG6]  |          |    |
|  | |    OK    | |    OK    | |    OK    |          |    |
|  | |Title:    | |Title:    | |Title:    |          |    |
|  | |[_______] | |[_______] | |[_______] |          |    |
|  | |[Expand v]| |[Expand v]| |[Expand v]|          |    |
|  | |    [x]   | |    [x]   | |    [x]   |          |    |
|  | +----------+ +----------+ +----------+          |    |
|  +-------------------------------------------------+    |
|                                                          |
|                          [Cancel]  [Upload 6 Images]     |
+----------------------------------------------------------+
```

### C. Image Card - Expanded State

```
+------------------------+
|      [IMAGE PREVIEW]   |
|                        |
+------------------------+
| Title:                 |
| [Foundation Work_____] |
+------------------------+
| Description:           |
| [Custom description   ]|
| [for this image only  ]|
+------------------------+
| Alt Text:              |
| [Foundation concrete  ]|
+------------------------+
|      [Collapse ^]      |
|          [x]           |
+------------------------+
```
