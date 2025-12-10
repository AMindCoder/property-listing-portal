# Spec 2: Client-Side Upload Service

## Overview

A client-side upload service that handles file uploads directly from the browser to the storage provider, bypassing server-side limitations and enabling large file uploads with progress tracking.

---

## Goals

1. Bypass the 4.5MB serverless function body size limit
2. Enable parallel uploads for multiple files
3. Provide real-time upload progress feedback
4. Support large file uploads (up to 500MB per file)
5. Handle upload failures gracefully with retry capability

---

## Functional Requirements

### FR-1: Direct-to-Storage Upload

The system must upload files directly from the browser to the storage provider without passing through the application server.

**Flow:**
1. Client requests a signed upload URL/token from the server
2. Server generates and returns the signed URL/token
3. Client uploads directly to storage using the signed URL
4. Client notifies server of successful upload (for database record)

### FR-2: Signed URL Generation API

The server must provide an API endpoint to generate secure, time-limited upload credentials.

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filename` | string | Yes | Original filename |
| `contentType` | string | Yes | MIME type of the file |
| `size` | number | Yes | File size in bytes |
| `folder` | string | No | Destination folder |

**Response:**

| Field | Type | Description |
|-------|------|-------------|
| `uploadUrl` | string | Signed URL for upload |
| `publicUrl` | string | Final public URL after upload |
| `expiresAt` | number | Timestamp when URL expires |
| `token` | string | Upload token (if applicable) |

### FR-3: Multiple File Upload

The system must support uploading multiple files in a single operation.

**Requirements:**

| Requirement | Description |
|-------------|-------------|
| Parallel uploads | Upload multiple files simultaneously |
| Configurable concurrency | Limit number of parallel uploads (default: 3) |
| Individual tracking | Track progress of each file independently |
| Partial success | Some files can succeed while others fail |
| Batch result | Return results for all files in batch |

### FR-4: Upload Progress Tracking

The system must provide granular progress information during upload.

**Progress Information:**

| Field | Type | Description |
|-------|------|-------------|
| `fileId` | string | Identifier for the file being uploaded |
| `filename` | string | Original filename |
| `bytesUploaded` | number | Bytes uploaded so far |
| `totalBytes` | number | Total file size |
| `percentage` | number | Upload percentage (0-100) |
| `status` | enum | pending / uploading / completed / failed |
| `error` | string | Error message if failed |

**Batch Progress:**

| Field | Type | Description |
|-------|------|-------------|
| `totalFiles` | number | Total number of files |
| `completedFiles` | number | Number of completed uploads |
| `failedFiles` | number | Number of failed uploads |
| `overallPercentage` | number | Overall batch progress |

### FR-5: Upload Retry Mechanism

The system must automatically retry failed uploads.

**Retry Configuration:**

| Config | Default | Description |
|--------|---------|-------------|
| `maxRetries` | 3 | Maximum retry attempts |
| `retryDelay` | 1000ms | Initial delay between retries |
| `backoffMultiplier` | 2 | Exponential backoff multiplier |
| `retryableErrors` | network, timeout | Error types to retry |

### FR-6: Upload Cancellation

The system must support cancelling uploads in progress.

**Cancellation Requirements:**

| Requirement | Description |
|-------------|-------------|
| Cancel single file | Cancel upload of a specific file |
| Cancel all | Cancel all uploads in batch |
| Cleanup on cancel | Remove partially uploaded files |
| Cancel callback | Notify when cancellation completes |

### FR-7: File Validation (Pre-Upload)

The system must validate files before attempting upload.

**Validation Rules:**

| Validation | Description |
|------------|-------------|
| File type | Validate against allowed MIME types |
| File size | Validate against maximum file size |
| File count | Validate against maximum files per upload |
| Filename | Sanitize and validate filename characters |

**Validation Result:**

| Field | Type | Description |
|-------|------|-------------|
| `valid` | boolean | Whether file passed validation |
| `errors` | string[] | List of validation errors |
| `warnings` | string[] | Non-blocking warnings |

### FR-8: Multipart Upload for Large Files

The system must use multipart/chunked upload for files exceeding a threshold.

**Multipart Requirements:**

| Requirement | Description |
|-------------|-------------|
| Chunk size | Configurable chunk size (default: 5MB) |
| Parallel chunks | Upload multiple chunks in parallel |
| Resume capability | Resume interrupted uploads |
| Chunk progress | Track progress at chunk level |

### FR-9: Upload Queue Management

The system must manage a queue of pending uploads.

**Queue Features:**

| Feature | Description |
|---------|-------------|
| Add to queue | Add files to upload queue |
| Remove from queue | Remove pending files |
| Reorder queue | Change upload priority |
| Pause queue | Pause all pending uploads |
| Resume queue | Resume paused uploads |
| Clear queue | Remove all pending uploads |

---

## Non-Functional Requirements

### NFR-1: Performance

- Support files up to 500MB
- Maintain responsive UI during uploads
- Efficient memory usage (streaming, not loading entire file)

### NFR-2: Reliability

- Handle network interruptions gracefully
- Recover from browser refresh (optional, for large uploads)
- Consistent behavior across modern browsers

### NFR-3: Security

- Signed URLs must expire within 15 minutes
- Validate file types server-side before generating signed URL
- No sensitive credentials exposed to client

### NFR-4: Browser Compatibility

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

---

## Out of Scope

- Image compression/optimization (covered in Spec 3)
- UI components (covered in Spec 4)
- Storage provider implementation details (covered in Spec 1)
- Offline upload queue persistence

---

## API Endpoints Required

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/upload/sign` | POST | Generate signed upload URL |
| `/api/upload/confirm` | POST | Confirm successful upload |
| `/api/upload/cancel` | POST | Cleanup cancelled upload |

---

## Success Criteria

1. Successfully upload 10 images (5MB each) in parallel without failures
2. Upload progress accurately reflects actual upload state
3. Failed uploads retry automatically and succeed on transient errors
4. Large files (100MB+) upload successfully using multipart
5. Cancellation stops upload and cleans up partial files

---

## Validation & Test Cases (P0 - MVP)

### TC-1: Direct Upload Flow

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-1.1: Get signed URL | 1. Call `/api/upload/sign` with valid file info | Returns uploadUrl, publicUrl, expiresAt |
| TC-1.2: Upload to signed URL | 1. Get signed URL 2. PUT file to signed URL | File uploaded successfully, accessible at publicUrl |
| TC-1.3: Confirm upload | 1. Upload file 2. Call `/api/upload/confirm` | Server acknowledges, records in database |

### TC-2: Multiple File Upload

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-2.1: Upload 5 files parallel | 1. Select 5 images 2. Start upload | All 5 upload simultaneously (up to concurrency limit) |
| TC-2.2: Partial success | 1. Upload 5 files 2. Simulate 2 failures | 3 succeed, 2 fail, both reported correctly |

### TC-3: Progress Tracking

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-3.1: Individual progress | 1. Upload 5MB file 2. Monitor progress | Progress updates from 0% to 100% smoothly |
| TC-3.2: Batch progress | 1. Upload 3 files 2. Monitor batch progress | Shows "1 of 3", "2 of 3", "3 of 3 completed" |

### TC-4: File Validation

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-4.1: Valid image file | 1. Select valid JPEG | Passes validation, proceeds to upload |
| TC-4.2: Invalid file type | 1. Select .exe file | Rejected with "File type not allowed" |
| TC-4.3: File too large | 1. Select 600MB file (limit 500MB) | Rejected with "File exceeds maximum size" |
| TC-4.4: Empty file | 1. Select 0-byte file | Rejected with "File is empty" |

### TC-5: Upload Cancellation

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-5.1: Cancel upload | 1. Start upload 2. Click cancel | Upload stops, file removed from queue |

### TC-6: Error Handling

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-6.1: Network disconnect | 1. Start upload 2. Disconnect network | Shows "Network error", offers retry |
| TC-6.2: Server error (500) | 1. Simulate server error | Shows "Server error", offers retry |
