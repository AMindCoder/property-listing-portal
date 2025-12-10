# Spec 4: Reusable Image Uploader Component

## Overview

A reusable, self-contained React component for image uploads that can be used across all features of the portal (property listings, construction sites, interior galleries, etc.) with consistent behavior and appearance.

---

## Goals

1. Provide a single, reusable component for all image upload needs
2. Offer consistent user experience across all features
3. Support customization for different contexts
4. Handle all upload states and error conditions gracefully
5. Be accessible and mobile-friendly

---

## Functional Requirements

### FR-1: Component Interface

The component must accept configuration through props.

**Required Props:**

| Prop | Type | Description |
|------|------|-------------|
| `onUploadComplete` | function | Callback when all uploads complete |
| `onUploadError` | function | Callback when upload fails |

**Optional Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxFiles` | number | 10 | Maximum number of files allowed |
| `maxFileSize` | number | 10MB | Maximum size per file |
| `allowedTypes` | string[] | ['image/*'] | Accepted MIME types |
| `folder` | string | 'uploads' | Destination folder |
| `preset` | string | 'default' | Processing preset name |
| `initialImages` | string[] | [] | Pre-existing images (for edit mode) |
| `disabled` | boolean | false | Disable the component |
| `showPreview` | boolean | true | Show image previews |
| `enableDragDrop` | boolean | true | Enable drag and drop |
| `enableCamera` | boolean | true | Enable camera capture (mobile) |
| `compressImages` | boolean | true | Enable client-side compression |
| `layout` | string | 'grid' | Preview layout (grid/list) |
| `className` | string | '' | Additional CSS classes |

### FR-2: Drag and Drop Support

The component must support drag-and-drop file upload.

**Drag and Drop Features:**

| Feature | Description |
|---------|-------------|
| Drop zone | Clearly defined area for dropping files |
| Visual feedback | Change appearance when dragging over |
| Multi-file drop | Accept multiple files in single drop |
| Invalid file feedback | Show error for invalid file types |
| Nested drop prevention | Prevent dropping on child elements |

**Drop Zone States:**

| State | Visual Indication |
|-------|-------------------|
| Default | Dashed border, upload icon, hint text |
| Drag over | Highlighted border, "Drop files here" text |
| Invalid drag | Red border, "Invalid file type" text |
| Disabled | Grayed out, no interaction |

### FR-3: File Selection Methods

The component must support multiple ways to select files.

**Selection Methods:**

| Method | Description |
|--------|-------------|
| Click to browse | Click drop zone to open file picker |
| Drag and drop | Drag files from file system |
| Paste | Paste images from clipboard |
| Camera capture | Take photo on mobile devices |

### FR-4: Image Preview

The component must show previews of selected/uploaded images.

**Preview Features:**

| Feature | Description |
|---------|-------------|
| Thumbnail grid | Show thumbnails of all images |
| Preview size | Configurable thumbnail size |
| Loading state | Show loading indicator while processing |
| Error state | Show error icon for failed uploads |
| Remove button | Button to remove individual images |
| Reorder | Drag to reorder images (optional) |
| Primary indicator | Mark first image as primary/cover |
| Zoom on click | Expand image in modal on click |

**Preview Information:**

| Info | Description |
|------|-------------|
| Filename | Original filename (truncated if long) |
| File size | Original and compressed size |
| Upload progress | Progress bar during upload |
| Status icon | Success/error/pending indicator |

### FR-5: Upload Progress Display

The component must display upload progress clearly.

**Progress Indicators:**

| Indicator | Description |
|-----------|-------------|
| Individual progress | Progress bar per file |
| Overall progress | Combined progress for batch |
| File count | "3 of 10 uploaded" |
| Current file | Name of file being uploaded |
| Speed | Upload speed (optional) |
| Time remaining | Estimated time remaining (optional) |

### FR-6: Error Handling and Display

The component must handle and display errors gracefully.

**Error Types:**

| Error | Display |
|-------|---------|
| File too large | "File exceeds maximum size of X MB" |
| Invalid type | "File type not supported. Please use JPG, PNG, or WebP" |
| Too many files | "Maximum X files allowed" |
| Upload failed | "Upload failed. Click to retry" |
| Network error | "Network error. Check connection and retry" |

**Error Display:**

| Feature | Description |
|---------|-------------|
| Inline errors | Show error below affected file |
| Toast notifications | Show transient errors as toasts |
| Error summary | Summary of all errors at top |
| Retry option | Allow retry of failed uploads |

### FR-7: Upload Controls

The component must provide controls for managing uploads.

**Control Actions:**

| Control | Description |
|---------|-------------|
| Upload all | Start uploading all pending files |
| Pause | Pause ongoing uploads |
| Resume | Resume paused uploads |
| Cancel | Cancel all uploads and clear |
| Retry failed | Retry all failed uploads |
| Clear all | Remove all files (with confirmation) |

### FR-8: Image Reordering

The component must allow reordering of images.

**Reorder Features:**

| Feature | Description |
|---------|-------------|
| Drag to reorder | Drag thumbnails to change order |
| Set as primary | Click to set image as first/primary |
| Move buttons | Arrow buttons for keyboard reorder |
| Order callback | Callback when order changes |

### FR-9: Accessibility

The component must be accessible.

**Accessibility Requirements:**

| Requirement | Description |
|-------------|-------------|
| Keyboard navigation | Full functionality via keyboard |
| Screen reader support | Proper ARIA labels and announcements |
| Focus management | Logical focus order and visible focus |
| Alt text | Alt text for preview images |
| Error announcements | Announce errors to screen readers |
| Reduced motion | Respect prefers-reduced-motion |

### FR-10: Mobile Support

The component must work well on mobile devices.

**Mobile Features:**

| Feature | Description |
|---------|-------------|
| Touch drag/drop | Support touch-based drag and drop |
| Camera access | Option to capture from camera |
| Photo library | Access device photo library |
| Responsive layout | Adapt layout to screen size |
| Touch targets | Minimum 44x44px touch targets |

### FR-11: Component States

The component must handle various states.

**States:**

| State | Description |
|-------|-------------|
| Empty | No files selected, show drop zone |
| Has files | Files selected, show previews |
| Uploading | Upload in progress, show progress |
| Complete | All uploads done, show success |
| Partial error | Some uploads failed |
| Disabled | Component is disabled |
| Loading | Loading initial images (edit mode) |

### FR-12: Event Callbacks

The component must provide callbacks for key events.

**Callbacks:**

| Callback | Trigger | Parameters |
|----------|---------|------------|
| `onFilesSelected` | Files added to queue | files[] |
| `onFileRemoved` | File removed from queue | file, index |
| `onUploadStart` | Upload begins | files[] |
| `onUploadProgress` | Progress update | progress object |
| `onFileUploaded` | Single file completes | result, index |
| `onUploadComplete` | All uploads complete | results[] |
| `onUploadError` | Upload error occurs | error, file |
| `onOrderChange` | Image order changed | newOrder[] |
| `onValidationError` | File validation fails | errors[] |

---

## Non-Functional Requirements

### NFR-1: Performance

- Component renders in under 100ms
- Thumbnail generation in under 500ms per image
- Smooth animations at 60fps
- No UI blocking during upload

### NFR-2: Bundle Size

- Component code under 50KB (gzipped)
- Tree-shakeable for unused features
- Lazy load heavy dependencies

### NFR-3: Styling

- Use CSS modules or styled-components for isolation
- Support theming through CSS variables
- No style conflicts with parent application

### NFR-4: Browser Support

- All modern browsers (Chrome, Firefox, Safari, Edge)
- Graceful degradation for older browsers
- Progressive enhancement approach

---

## Out of Scope

- Built-in image editor (crop, rotate, etc.)
- Image tagging/labeling UI
- Gallery/slideshow display
- Image comparison view
- Social media sharing

---

## Component Composition

The main component should be composed of smaller, focused components:

| Sub-Component | Responsibility |
|---------------|----------------|
| DropZone | Drag-and-drop area |
| FileInput | Hidden file input trigger |
| PreviewGrid | Grid of image previews |
| PreviewItem | Single image preview |
| ProgressBar | Upload progress indicator |
| ErrorMessage | Error display |
| Controls | Upload action buttons |

---

## Usage Contexts

| Context | Configuration |
|---------|---------------|
| Property Add/Edit | maxFiles=10, preset='property' |
| Construction Gallery | maxFiles=50, preset='construction' |
| Interior Photos | maxFiles=20, preset='interior' |
| Floor Plans | maxFiles=5, preset='document' |

---

## Success Criteria

1. Single component handles all image upload needs across the portal
2. Consistent UX regardless of where component is used
3. Zero upload failures due to component issues
4. Accessible to users with disabilities
5. Works smoothly on mobile devices
6. Easy to customize for different contexts

---

## Validation & Test Cases (P0 - MVP)

### TC-1: Component Rendering

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-1.1: Required props only | 1. Render with onUploadComplete, onUploadError only | Component renders with defaults |
| TC-1.2: maxFiles prop | 1. Set maxFiles=5 2. Try to add 6 files | 6th file rejected with error |
| TC-1.3: initialImages prop | 1. Pass 3 existing URLs 2. Render component | Shows 3 images pre-loaded |

### TC-2: File Selection

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-2.1: Click to browse | 1. Click drop zone | File picker opens |
| TC-2.2: Drop files | 1. Drag image over drop zone 2. Drop | File added to queue |
| TC-2.3: Drop multiple files | 1. Drag 5 images 2. Drop | All 5 files added |

### TC-3: Image Preview

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-3.1: Thumbnail display | 1. Add images | Thumbnails shown in grid |
| TC-3.2: Remove button | 1. Hover preview 2. Click remove | Image removed from queue |
| TC-3.3: Primary indicator | 1. Add 3 images | First image marked as primary |

### TC-4: Upload Progress

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-4.1: Individual progress bar | 1. Upload file 2. Watch preview | Progress bar shows 0-100% |
| TC-4.2: File count display | 1. Upload 5 files | Shows "2 of 5 uploaded" |
| TC-4.3: Completion indicator | 1. Complete upload | Checkmark/success icon shown |

### TC-5: Error Handling

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-5.1: File too large error | 1. Select oversized file | "Exceeds maximum size" error |
| TC-5.2: Invalid type error | 1. Select invalid file type | "Type not supported" error |
| TC-5.3: Upload failure error | 1. Simulate upload failure | "Upload failed" with retry |
| TC-5.4: Retry failed upload | 1. Fail upload 2. Click retry | Upload retries |

### TC-6: Upload Controls

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-6.1: Upload all button | 1. Add 5 files 2. Click upload | All files start uploading |
| TC-6.2: Cancel button | 1. Start upload 2. Click cancel | Upload cancelled, files cleared |
| TC-6.3: Clear all button | 1. Add files 2. Click clear | All files removed |

### TC-7: Image Reordering

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-7.1: Drag to reorder | 1. Add 3 images 2. Drag #3 to #1 | Order updated to 3,1,2 |
| TC-7.2: Set as primary | 1. Click "set as primary" on #3 | #3 moves to first position |

### TC-8: Edit Mode (Initial Images)

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-8.1: Load existing images | 1. Pass initialImages URLs | Images displayed |
| TC-8.2: Remove existing image | 1. Remove pre-loaded image | Image removed, callback fired |
| TC-8.3: Add to existing | 1. Have 3 initial 2. Add 2 more | Total of 5 images |

### TC-9: Mobile Support

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-9.1: Responsive layout | 1. View on mobile width | Layout adapts to screen |
| TC-9.2: Touch drop zone | 1. Tap drop zone | File picker opens |
| TC-9.3: Camera option | 1. Tap upload on mobile | Camera option available |
