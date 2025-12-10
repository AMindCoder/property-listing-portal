# Spec 7: Property Form Integration

## Overview

Integration specification for replacing the existing image upload implementation in property add/edit forms with the new reusable ImageUploader component, ensuring seamless data flow between the component and property management.

---

## Goals

1. Replace existing image upload in property forms with the new ImageUploader component
2. Maintain backward compatibility with existing property data
3. Ensure smooth edit mode experience with pre-existing images
4. Handle form submission with uploaded images correctly
5. Provide clear error handling for upload failures during form submission

---

## Current State Analysis

### Existing Implementation

| Component | Location | Purpose |
|-----------|----------|---------|
| Property Add Form | `/admin/properties/new` or similar | Create new property with images |
| Property Edit Form | `/admin/properties/[id]/edit` | Edit existing property and images |
| Current Image Input | Within property form | Basic file input or existing upload |
| Property API | `/api/properties` | CRUD operations for properties |

### Database Schema (Expected)

| Field | Type | Description |
|-------|------|-------------|
| `images` | string[] | Array of image URLs |
| `primaryImage` | string | URL of the cover/primary image |

---

## Functional Requirements

### FR-1: Component Replacement

The existing image upload UI must be replaced with the ImageUploader component.

**Replacement Requirements:**

| Requirement | Description |
|-------------|-------------|
| Drop-in replacement | Replace existing upload without breaking form |
| Same form location | Keep images section in same position |
| Consistent styling | Match form's visual design |
| No functionality loss | All existing features must work |

### FR-2: Form State Integration

The ImageUploader must integrate with the property form state.

**State Integration:**

| State | Handling |
|-------|----------|
| Form values | Images stored as array of URLs in form state |
| Dirty tracking | Form marked dirty when images change |
| Validation | Required images validated before submit |
| Reset | Images cleared on form reset |

**Form Libraries Support:**

| Library | Integration Method |
|---------|-------------------|
| React Hook Form | `Controller` or `register` with custom component |
| Formik | `Field` component with custom render |
| Plain React | `useState` with callbacks |

### FR-3: Add Property Flow

The component must work correctly when adding a new property.

**Add Flow Steps:**

| Step | Behavior |
|------|----------|
| 1. Form loads | ImageUploader renders empty |
| 2. User selects images | Images queued for upload |
| 3. Upload triggered | Can be immediate or on form submit |
| 4. Form submitted | Image URLs included in property data |
| 5. Property created | Property saved with image URLs |

**Upload Timing Options:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| Immediate upload | Upload as soon as selected | Shows progress early | Orphan images if form abandoned |
| On form submit | Upload when form submitted | No orphans | Longer submit time |
| Hybrid | Upload immediately, confirm on submit | Best UX | More complex |

### FR-4: Edit Property Flow

The component must work correctly when editing an existing property.

**Edit Flow Steps:**

| Step | Behavior |
|------|----------|
| 1. Form loads | Fetch existing property data |
| 2. Pass to component | `initialImages={property.images}` |
| 3. Images displayed | Existing images shown as thumbnails |
| 4. User modifies | Can add new, remove existing, reorder |
| 5. Form submitted | Updated image URLs saved |

**Edit Mode Features:**

| Feature | Description |
|---------|-------------|
| Load existing | Display current property images |
| Add new | Upload additional images |
| Remove existing | Remove without immediate deletion |
| Reorder | Change image order including existing |
| Replace | Upload new to replace existing |

### FR-5: Image URL Handling

The component must properly handle image URLs for database storage.

**URL Flow:**

| Stage | Data Format |
|-------|-------------|
| Before upload | `File` objects |
| After upload | Vercel Blob URLs |
| Form state | Array of URL strings |
| Database | Array of URL strings |
| Edit mode load | Array of URL strings |

**URL Validation:**

| Validation | Rule |
|------------|------|
| Format | Must be valid URL |
| Protocol | Must be HTTPS |
| Domain | Must be from allowed storage domain |

### FR-6: Form Submission Handling

The form submission must handle images correctly.

**Submission Scenarios:**

| Scenario | Handling |
|----------|----------|
| All uploads complete | Submit with all URLs |
| Upload in progress | Wait or block submission |
| Some uploads failed | Show error, allow retry |
| No images (optional) | Submit without images |
| No images (required) | Block with validation error |

**Submit Button States:**

| State | Button Behavior |
|-------|-----------------|
| Uploads pending | Disabled or shows "Uploading..." |
| Uploads complete | Enabled |
| Uploads failed | Enabled with warning |

### FR-7: Validation Rules

Image validation rules for the property form.

**Validation Requirements:**

| Rule | Default | Configurable |
|------|---------|--------------|
| Minimum images | 1 | Yes |
| Maximum images | 10 | Yes |
| Required | Yes | Yes |
| File types | JPG, PNG, WebP | Yes |
| Max file size | 10MB | Yes |

**Validation Messages:**

| Error | Message |
|-------|---------|
| No images | "At least one image is required" |
| Too many | "Maximum 10 images allowed" |
| Invalid type | "Only JPG, PNG, and WebP images are allowed" |
| File too large | "Image must be under 10MB" |

### FR-8: Error Handling

Comprehensive error handling for the integration.

**Error Scenarios:**

| Scenario | Handling |
|----------|----------|
| Upload fails | Show error on thumbnail, allow retry |
| Network error | Show toast, allow retry all |
| Token expired | Refresh token, retry |
| Form submit fails | Keep images, show form error |
| Partial upload failure | Submit with successful only (with warning) |

**Error Recovery:**

| Recovery Action | Description |
|-----------------|-------------|
| Retry single | Retry one failed upload |
| Retry all failed | Retry all failed uploads |
| Remove failed | Remove failed images from queue |
| Cancel | Cancel pending uploads |

### FR-9: Image Deletion Handling

Handle deletion of existing images properly.

**Deletion Behavior:**

| Action | Behavior |
|--------|----------|
| Remove in form | Remove from form state, mark for deletion |
| Form submitted | Delete marked images from storage |
| Form cancelled | No deletion occurs |
| Immediate delete | Optional: delete immediately on remove |

**Orphan Prevention:**

| Scenario | Prevention |
|----------|------------|
| Form abandoned | Cleanup job removes orphans after X days |
| Upload then cancel | Same as above |
| Browser closed | Same as above |

### FR-10: Primary Image Selection

Allow setting the primary/cover image.

**Primary Image Features:**

| Feature | Description |
|---------|-------------|
| Default primary | First image is primary |
| Set as primary | Click to make any image primary |
| Visual indicator | Badge/border on primary image |
| Reorder to primary | Drag to first position = primary |
| Form field | `primaryImage` or first in `images` array |

---

## Non-Functional Requirements

### NFR-1: Performance

- Form loads with images in under 2 seconds
- No UI blocking during uploads
- Smooth drag-and-drop at 60fps

### NFR-2: User Experience

- Clear feedback on upload progress
- Obvious error states with recovery options
- Form submission blocked until uploads complete

### NFR-3: Data Integrity

- No orphaned images in normal flows
- No data loss on form errors
- Consistent state between form and database

---

## Implementation Approach

### Recommended Integration Pattern

```tsx
// Property Form with ImageUploader
function PropertyForm({ property }: { property?: Property }) {
  const [images, setImages] = useState<string[]>(property?.images || []);
  const [uploading, setUploading] = useState(false);

  const handleUploadComplete = (results: UploadResult[]) => {
    setImages(prev => [...prev, ...results.map(r => r.url)]);
    setUploading(false);
  };

  const handleSubmit = async (data: FormData) => {
    if (uploading) return; // Block if still uploading

    await saveProperty({
      ...data,
      images,
      primaryImage: images[0]
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Other form fields */}

      <ImageUploader
        initialImages={property?.images}
        onUploadComplete={handleUploadComplete}
        onUploadStart={() => setUploading(true)}
        onUploadError={(error) => toast.error(error.message)}
        maxFiles={10}
        folder="properties"
      />

      <button type="submit" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Save Property'}
      </button>
    </form>
  );
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| Property Add Form | Replace image input with ImageUploader |
| Property Edit Form | Same + pass initialImages |
| Property API | Ensure images array saved correctly |
| Property Types | Confirm images: string[] type |

---

## Migration Steps

1. **Identify current forms** - Locate all property forms using image upload
2. **Import ImageUploader** - Add component import
3. **Replace markup** - Remove old upload, add ImageUploader
4. **Wire callbacks** - Connect onUploadComplete to form state
5. **Handle edit mode** - Pass initialImages for existing properties
6. **Update submission** - Include images in submit payload
7. **Test thoroughly** - Verify add, edit, delete flows
8. **Remove old code** - Clean up replaced implementation

---

## Success Criteria

1. Property forms use the new ImageUploader component
2. Adding new property with images works correctly
3. Editing existing property preserves and allows modifying images
4. Form submission includes all uploaded image URLs
5. Error handling provides clear feedback and recovery
6. No regression in existing property management functionality

---

## Validation & Test Cases (P0 - MVP)

### TC-1: Component Integration

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-1.1: Component renders in form | 1. Open property add form | ImageUploader component visible |
| TC-1.2: Replaces old upload | 1. Check form | No old file input, only ImageUploader |
| TC-1.3: Matches form styling | 1. Visual inspection | Component fits form design |

### TC-2: Add Property Flow

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-2.1: Add with images | 1. Open add form 2. Upload 3 images 3. Fill form 4. Submit | Property created with 3 images |
| TC-2.2: Images saved to DB | 1. Create property 2. Check database | images array contains 3 URLs |
| TC-2.3: Primary image set | 1. Create property | primaryImage = first image URL |
| TC-2.4: Add without images | 1. Fill form without images 2. Submit | Validation error if required, else success |

### TC-3: Edit Property Flow

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-3.1: Load existing images | 1. Open edit form for property with images | Existing images displayed |
| TC-3.2: Add more images | 1. Edit property 2. Add 2 new images 3. Save | Total images = original + 2 |
| TC-3.3: Remove existing image | 1. Edit property 2. Remove 1 image 3. Save | Image removed from property |
| TC-3.4: Reorder images | 1. Edit property 2. Drag to reorder 3. Save | New order saved |
| TC-3.5: Replace all images | 1. Remove all 2. Add new 3. Save | Only new images saved |

### TC-4: Form State Integration

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-4.1: Form tracks changes | 1. Add image | Form marked as dirty/changed |
| TC-4.2: Form reset clears images | 1. Add images 2. Reset form | Images cleared |
| TC-4.3: Images in submit payload | 1. Add images 2. Submit 3. Inspect request | images array in payload |

### TC-5: Upload Timing

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-5.1: Upload starts on selection | 1. Select images | Upload begins immediately |
| TC-5.2: Submit waits for upload | 1. Select images 2. Immediately click submit | Submit waits or is blocked |
| TC-5.3: Submit after upload complete | 1. Upload images 2. Wait for complete 3. Submit | Form submits successfully |

### TC-6: Validation

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-6.1: Required validation | 1. Try submit without images | "At least one image required" error |
| TC-6.2: Max files validation | 1. Try to add 11 images | 11th image rejected |
| TC-6.3: File type validation | 1. Try to upload PDF | "Invalid file type" error |
| TC-6.4: File size validation | 1. Try 15MB image | "File too large" error |

### TC-7: Error Handling

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-7.1: Upload error shown | 1. Simulate upload failure | Error shown on thumbnail |
| TC-7.2: Retry failed upload | 1. Fail upload 2. Click retry | Upload retries |
| TC-7.3: Submit with failed uploads | 1. Have failed upload 2. Try submit | Blocked with error message |
| TC-7.4: Network error recovery | 1. Disconnect network 2. Upload | Error shown, retry available |

### TC-8: Image Deletion

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-8.1: Remove queued image | 1. Add image 2. Remove before submit | Image removed from queue |
| TC-8.2: Remove uploaded image | 1. Upload 2. Remove 3. Submit | Image not in saved property |
| TC-8.3: Cancel doesn't delete | 1. Edit property 2. Remove image 3. Cancel | Original images unchanged |

### TC-9: Primary Image

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-9.1: First image is primary | 1. Add 3 images | First image marked primary |
| TC-9.2: Set different primary | 1. Click "set as primary" on image 3 | Image 3 becomes primary |
| TC-9.3: Primary saved correctly | 1. Set primary 2. Submit 3. Reload | Correct primary image shown |

### TC-10: Data Persistence

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-10.1: URLs stored correctly | 1. Create property 2. Check DB | Valid Vercel Blob URLs stored |
| TC-10.2: Images load from DB | 1. Create property 2. Refresh page | Images display correctly |
| TC-10.3: Edit preserves URLs | 1. Edit property 2. Save without image changes | Same URLs preserved |

### TC-11: Edge Cases

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-11.1: Browser refresh during upload | 1. Start upload 2. Refresh | No orphans (or handled by cleanup) |
| TC-11.2: Duplicate file selection | 1. Select same file twice | Handled (dedupe or allow) |
| TC-11.3: Very slow upload | 1. Upload on slow connection | Progress shown, no timeout |
| TC-11.4: Large batch upload | 1. Upload 10 images at once | All upload successfully |

### TC-12: Backward Compatibility

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-12.1: Existing properties load | 1. View property created with old system | Images display correctly |
| TC-12.2: Edit old property | 1. Edit property with old image format | Edit works, can add new |
| TC-12.3: Mixed old/new images | 1. Edit old property 2. Add new images | Both old and new URLs saved |
