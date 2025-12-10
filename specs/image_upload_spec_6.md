# Spec 6: Image Management & Administration

## Overview

An administrative system for managing uploaded images, including browsing, organizing, bulk operations, storage monitoring, and cleanup of unused images.

---

## Goals

1. Provide visibility into all uploaded images across the portal
2. Enable organization and management of image assets
3. Monitor storage usage and costs
4. Clean up orphaned and unused images
5. Support bulk operations for efficiency

---

## Functional Requirements

### FR-1: Image Library Browser

The system must provide an interface to browse all uploaded images.

**Browser Features:**

| Feature | Description |
|---------|-------------|
| Grid view | Display images in a thumbnail grid |
| List view | Display images in a detailed list |
| Search | Search by filename, date, or metadata |
| Filter | Filter by type, date range, size, status |
| Sort | Sort by date, size, name, usage |
| Pagination | Paginate large collections |
| Preview | Quick preview on hover/click |

**Filter Options:**

| Filter | Values |
|--------|--------|
| Image type | Property, Construction, Interior, Document |
| Upload date | Date range picker |
| File size | Size range (e.g., > 1MB, < 100KB) |
| Usage status | In use, Orphaned, Recently deleted |
| Uploader | Admin user who uploaded |

### FR-2: Image Details View

The system must show detailed information about each image.

**Image Details:**

| Field | Description |
|-------|-------------|
| Preview | Large preview of the image |
| Filename | Original and stored filename |
| File size | Original and compressed sizes |
| Dimensions | Width x Height in pixels |
| Format | File format (JPEG, PNG, WebP) |
| Upload date | When the image was uploaded |
| Uploaded by | Admin who uploaded |
| Storage path | Full path in storage |
| Public URL | URL to access the image |
| Variants | List of generated variants |
| Usage | Where this image is used |
| Metadata | Any associated metadata |

### FR-3: Image Usage Tracking

The system must track where each image is used.

**Usage Information:**

| Info | Description |
|------|-------------|
| Entity type | Property, Construction Site, etc. |
| Entity ID | ID of the entity using the image |
| Entity name | Name/title for easy identification |
| Position | Position in gallery (1st, 2nd, etc.) |
| Link to entity | Direct link to the entity |

**Usage Status:**

| Status | Description |
|--------|-------------|
| In use | Image is referenced by at least one entity |
| Orphaned | Image exists but has no references |
| Pending deletion | Marked for cleanup |
| Recently deleted | Reference removed in last 30 days |

### FR-4: Orphaned Image Detection

The system must identify images that are no longer in use.

**Detection Criteria:**

| Criterion | Description |
|-----------|-------------|
| No database reference | Not linked to any entity |
| Stale reference | Entity was deleted |
| Upload abandoned | Uploaded but never attached |
| Age threshold | Orphaned for more than X days |

**Orphan Report:**

| Field | Description |
|-------|-------------|
| Total orphaned | Count of orphaned images |
| Storage used | Total size of orphaned images |
| Age breakdown | Orphaned < 7 days, < 30 days, > 30 days |
| Oldest orphan | Date of oldest orphaned image |

### FR-5: Bulk Operations

The system must support bulk operations on multiple images.

**Bulk Actions:**

| Action | Description |
|--------|-------------|
| Delete | Delete multiple selected images |
| Move | Move images to different folder |
| Download | Download selected as ZIP |
| Regenerate variants | Regenerate thumbnails/variants |
| Assign | Assign to entity |
| Tag | Add/remove tags |

**Selection Methods:**

| Method | Description |
|--------|-------------|
| Individual | Click to select/deselect |
| Range | Shift+click for range selection |
| All | Select all on current page |
| Filter-based | Select all matching filter |

### FR-6: Storage Dashboard

The system must provide storage usage visibility.

**Dashboard Metrics:**

| Metric | Description |
|--------|-------------|
| Total storage used | Total bytes stored |
| Storage limit | Plan limit (if applicable) |
| Usage percentage | Percentage of limit used |
| Image count | Total number of images |
| Storage by type | Breakdown by image type/folder |
| Monthly trend | Storage growth over time |
| Cost estimate | Estimated storage cost |

**Alerts:**

| Alert | Trigger |
|-------|---------|
| Approaching limit | Usage exceeds 80% of limit |
| Unusual growth | Storage growth exceeds normal rate |
| Large upload | Single upload exceeds threshold |
| Orphan accumulation | Orphaned storage exceeds threshold |

### FR-7: Image Cleanup

The system must support cleaning up unused images.

**Cleanup Options:**

| Option | Description |
|--------|-------------|
| Preview cleanup | Show what would be deleted |
| Manual cleanup | Admin selects and confirms |
| Scheduled cleanup | Automatic cleanup of old orphans |
| Dry run | Show impact without deleting |

**Cleanup Rules:**

| Rule | Default | Description |
|------|---------|-------------|
| Minimum age | 30 days | Don't delete recent orphans |
| Batch size | 100 | Maximum images per cleanup run |
| Confirmation | Required | Require admin confirmation |
| Backup period | 7 days | Soft delete before hard delete |

### FR-8: Soft Delete & Recovery

The system must support soft deletion with recovery option.

**Soft Delete Features:**

| Feature | Description |
|---------|-------------|
| Move to trash | Deleted images go to trash first |
| Retention period | Keep in trash for X days |
| Recovery | Restore from trash |
| Permanent delete | Remove from trash permanently |
| Auto-purge | Automatically purge after retention |

### FR-9: Audit Log

The system must log all image management actions.

**Logged Events:**

| Event | Details Logged |
|-------|----------------|
| Upload | File info, uploader, destination |
| Delete | File info, who deleted, reason |
| Bulk operation | Operation type, count, who performed |
| Cleanup | Images removed, space freed |
| Recovery | Image restored, who restored |
| Config change | Settings modified |

**Log Fields:**

| Field | Description |
|-------|-------------|
| Timestamp | When action occurred |
| Actor | Admin who performed action |
| Action | Type of action |
| Target | Image(s) affected |
| Details | Additional context |
| Result | Success/failure |

### FR-10: Storage Provider Management

The system must allow configuration of storage settings.

**Configuration Options:**

| Option | Description |
|--------|-------------|
| Active provider | Which storage provider to use |
| Provider credentials | API keys, tokens (masked) |
| Default folder | Default upload destination |
| Variant settings | Which variants to generate |
| Compression settings | Default compression settings |
| CDN settings | CDN URL configuration |

### FR-11: Image Replacement

The system must support replacing an existing image.

**Replacement Features:**

| Feature | Description |
|---------|-------------|
| Upload new version | Upload replacement image |
| Preserve URL | Keep same public URL |
| Regenerate variants | Create new variants |
| Update references | No reference updates needed |
| Version history | Optional: keep old versions |

---

## Non-Functional Requirements

### NFR-1: Performance

- Image library loads within 2 seconds
- Search results return within 1 second
- Bulk operations process 100 images in under 30 seconds

### NFR-2: Scalability

- Support libraries with 100,000+ images
- Pagination handles large collections efficiently
- Filters work performantly on large datasets

### NFR-3: Security

- Only authorized admins can access
- Credentials never displayed in plain text
- Audit log tamper-resistant
- Bulk delete requires confirmation

---

## Out of Scope

- Image editing capabilities
- AI-based image tagging/categorization
- Duplicate detection
- Image comparison tools
- External asset import (from URLs)
- Multi-user collaboration features

---

## Admin Pages Required

| Page | Purpose |
|------|---------|
| `/admin/images` | Image library browser |
| `/admin/images/[id]` | Single image details |
| `/admin/images/orphaned` | Orphaned images list |
| `/admin/images/storage` | Storage dashboard |
| `/admin/images/settings` | Storage configuration |
| `/admin/images/audit` | Audit log viewer |

---

## Success Criteria

1. Admins can find any image within 30 seconds
2. Orphaned images identified and reported automatically
3. Storage usage visible and monitored
4. Cleanup operations safe with confirmation and recovery
5. Full audit trail of all image operations
6. Storage costs reduced by identifying and cleaning orphans

---

## Validation & Test Cases (P0 - MVP)

### TC-1: Image Library Browser

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-1.1: Grid view display | 1. Open image library | Thumbnails shown in grid |
| TC-1.2: Search by filename | 1. Enter filename in search | Matching images shown |
| TC-1.3: Pagination | 1. Have 100+ images 2. Navigate pages | Pagination works correctly |

### TC-2: Image Details View

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-2.1: Open details | 1. Click image | Details page/modal opens |
| TC-2.2: File info display | 1. View details | Size, dimensions, format shown |
| TC-2.3: Public URL | 1. Check details | Clickable URL shown |
| TC-2.4: Usage locations | 1. Check details | Where image is used |

### TC-3: Image Usage Tracking

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-3.1: View usage | 1. Check image used by property | Shows property name and link |
| TC-3.2: No usage | 1. Check orphaned image | Shows "Not in use" |

### TC-4: Orphaned Image Detection

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-4.1: Detect orphan | 1. Upload image 2. Don't attach | Marked as orphaned |
| TC-4.2: Detect after delete | 1. Delete property with images | Images marked orphaned |
| TC-4.3: No false positives | 1. Check used image | Not marked as orphaned |

### TC-5: Bulk Operations

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-5.1: Select individual | 1. Click checkbox on image | Image selected |
| TC-5.2: Bulk delete | 1. Select 5 images 2. Click delete | Confirmation shown, then deleted |
| TC-5.3: Bulk selection count | 1. Select images | "5 selected" shown |

### TC-6: Storage Dashboard

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-6.1: Total storage | 1. View dashboard | Total bytes shown (e.g., "2.5 GB") |
| TC-6.2: Image count | 1. View dashboard | Total images shown |
| TC-6.3: Orphan storage | 1. View dashboard | Orphaned images size shown |

### TC-7: Image Cleanup

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-7.1: Manual cleanup | 1. Select orphans 2. Delete | Selected images removed |
| TC-7.2: Confirmation required | 1. Click cleanup | Confirmation dialog shown |
| TC-7.3: Storage freed | 1. Complete cleanup | Shows space recovered |

### TC-8: Delete & Recovery

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-8.1: Delete image | 1. Delete image | Image removed or moved to trash |
| TC-8.2: Recover image | 1. Select deleted 2. Restore | Image restored (if soft delete) |

### TC-9: Security

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-9.1: Admin only access | 1. Access as non-admin | Redirected to login |
| TC-9.2: Delete confirmation | 1. Attempt bulk delete | Confirmation required |

### TC-10: Admin Pages

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-10.1: Library page | 1. Navigate to /admin/images | Page loads correctly |
| TC-10.2: Storage page | 1. Navigate to /admin/images/storage | Dashboard shown |
