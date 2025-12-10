# Spec 3: Image Processing & Optimization

## Overview

A client-side and server-side image processing system that optimizes images before and after upload, reducing file sizes, improving load times, and ensuring consistent image quality across the application.

---

## Goals

1. Reduce image file sizes before upload to minimize storage and bandwidth
2. Generate optimized variants for different use cases (thumbnails, previews, full-size)
3. Ensure consistent image dimensions and aspect ratios
4. Support modern image formats (WebP, AVIF) for better compression
5. Maintain acceptable image quality while optimizing

---

## Functional Requirements

### FR-1: Client-Side Compression

The system must compress images in the browser before upload.

**Compression Parameters:**

| Parameter | Default | Description |
|-----------|---------|-------------|
| `maxWidth` | 2400px | Maximum image width |
| `maxHeight` | 2400px | Maximum image height |
| `quality` | 0.8 | Compression quality (0-1) |
| `maxSizeKB` | 1024 | Target maximum file size |
| `format` | original | Output format (jpeg, png, webp, original) |

**Compression Rules:**

| Condition | Action |
|-----------|--------|
| Image > maxWidth/maxHeight | Resize proportionally |
| File size > maxSizeKB | Reduce quality iteratively |
| PNG with no transparency | Convert to JPEG |
| Already optimized | Skip compression |

### FR-2: Image Validation

The system must validate images before processing.

**Validation Checks:**

| Check | Criteria | Error Message |
|-------|----------|---------------|
| File type | Must be image/* MIME type | "File is not a valid image" |
| Minimum dimensions | At least 200x200 pixels | "Image is too small" |
| Maximum dimensions | No more than 10000x10000 pixels | "Image is too large" |
| File integrity | Must be readable as image | "Image file is corrupted" |
| Color space | RGB or sRGB | "Unsupported color space" |

### FR-3: Image Variants Generation

The system must generate multiple variants of uploaded images.

**Required Variants:**

| Variant | Max Dimensions | Quality | Use Case |
|---------|----------------|---------|----------|
| `thumbnail` | 150x150 | 0.7 | Grid listings, admin panels |
| `preview` | 400x400 | 0.8 | Property cards, search results |
| `medium` | 800x800 | 0.85 | Property detail page |
| `large` | 1600x1600 | 0.9 | Full-screen gallery |
| `original` | As uploaded | Original | Download, zoom |

**Variant Generation Modes:**

| Mode | Description |
|------|-------------|
| On-upload | Generate all variants immediately after upload |
| On-demand | Generate variants when first requested (lazy) |
| Hybrid | Generate common variants on upload, others on demand |

### FR-4: Aspect Ratio Handling

The system must handle various aspect ratios consistently.

**Aspect Ratio Options:**

| Option | Description |
|--------|-------------|
| `contain` | Fit entire image within dimensions (may have letterboxing) |
| `cover` | Fill dimensions completely (may crop edges) |
| `scale-down` | Like contain, but never upscale |
| `none` | No aspect ratio enforcement |

**Standard Aspect Ratios for Property Images:**

| Use Case | Aspect Ratio | Notes |
|----------|--------------|-------|
| Property card | 4:3 | Horizontal landscape |
| Gallery main | 16:9 | Widescreen |
| Thumbnail | 1:1 | Square |

### FR-5: Format Conversion

The system must support modern image formats.

**Format Support:**

| Format | Input | Output | Notes |
|--------|-------|--------|-------|
| JPEG | Yes | Yes | Default for photos |
| PNG | Yes | Yes | For images with transparency |
| WebP | Yes | Yes | Preferred for web delivery |
| AVIF | Yes | Yes | Best compression (where supported) |
| HEIC | Yes | Convert to JPEG | iOS photos |
| GIF | Yes | First frame as JPEG | Static only |

**Format Selection Logic:**

| Scenario | Output Format |
|----------|---------------|
| Photo without transparency | WebP (fallback: JPEG) |
| Image with transparency | WebP (fallback: PNG) |
| Browser doesn't support WebP | JPEG/PNG |
| User requests specific format | Requested format |

### FR-6: EXIF Data Handling

The system must handle image metadata appropriately.

**EXIF Handling:**

| Data Type | Action |
|-----------|--------|
| Orientation | Apply rotation, then strip |
| GPS coordinates | Strip (privacy) |
| Camera info | Strip |
| Copyright | Preserve (optional) |
| Date taken | Preserve (optional) |
| Color profile | Convert to sRGB |

### FR-7: Image Quality Assessment

The system must assess and report image quality.

**Quality Metrics:**

| Metric | Description |
|--------|-------------|
| `resolution` | Image dimensions |
| `fileSize` | Size in bytes |
| `compressionRatio` | Original size / compressed size |
| `estimatedQuality` | Subjective quality score (1-10) |
| `isBlurry` | Blur detection flag |
| `isLowLight` | Low light detection flag |

### FR-8: Batch Processing

The system must efficiently process multiple images.

**Batch Processing Features:**

| Feature | Description |
|---------|-------------|
| Parallel processing | Process multiple images simultaneously |
| Progress tracking | Track progress across batch |
| Memory management | Limit concurrent processing to prevent OOM |
| Error isolation | One image failure doesn't stop batch |

### FR-9: Processing Presets

The system must support predefined processing configurations.

**Standard Presets:**

| Preset | Description | Settings |
|--------|-------------|----------|
| `property` | Property listing images | Max 2400px, quality 0.85, WebP |
| `construction` | Construction site photos | Max 3200px, quality 0.9, preserve detail |
| `interior` | Interior room photos | Max 2400px, quality 0.85, color enhance |
| `document` | Documents/floor plans | Max 2000px, quality 0.9, sharpen |
| `thumbnail` | Quick thumbnails | Max 200px, quality 0.7 |

---

## Non-Functional Requirements

### NFR-1: Performance

- Process a 10MB image in under 3 seconds (client-side)
- Generate all variants for an image in under 5 seconds
- Batch process 10 images in under 30 seconds

### NFR-2: Quality

- Compressed images must maintain visual quality acceptable for real estate listings
- No visible artifacts at standard viewing sizes
- Text in images (floor plans) must remain readable

### NFR-3: Memory Efficiency

- Client-side processing must not exceed 100MB memory overhead
- Use streaming/chunked processing for large images
- Release memory promptly after processing

### NFR-4: Browser Support

- Client-side compression must work in all modern browsers
- Graceful degradation if advanced features unavailable
- WebP output only when browser supports it

---

## Out of Scope

- AI-based image enhancement
- Watermarking (may be added later)
- Video processing
- RAW image format support
- Batch editing (crop, rotate) by user
- Face detection/blurring

---

## Integration Points

| System | Integration |
|--------|-------------|
| Upload Service (Spec 2) | Process before upload |
| Storage Provider (Spec 1) | Store variants |
| UI Component (Spec 4) | Show processing status |
| Image Gallery | Serve appropriate variant |

---

## Success Criteria

1. Average image size reduction of 60% or more with acceptable quality
2. All uploaded images have consistent variants available
3. Page load time improved by 40% using optimized images
4. No user complaints about image quality degradation
5. Processing completes within performance targets

---

## Validation & Test Cases (P0 - MVP)

### TC-1: Client-Side Compression

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-1.1: Basic compression | 1. Upload 5MB JPEG 2. Check compressed size | Size reduced by at least 50% |
| TC-1.2: Resize large image | 1. Upload 4000x3000 image 2. Check output dimensions | Resized to max 2400px on longest side |
| TC-1.3: Preserve transparency | 1. Upload PNG with transparency | Transparency preserved in output |

### TC-2: Image Validation

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-2.1: Valid image | 1. Select valid JPEG/PNG/WebP | Passes validation |
| TC-2.2: Non-image file | 1. Rename .txt to .jpg 2. Select file | Rejected: "File is not a valid image" |
| TC-2.3: Image too small | 1. Select 100x100 image | Rejected: "Image is too small (min 200x200)" |
| TC-2.4: Corrupted image | 1. Select truncated/corrupted image file | Rejected: "Image file is corrupted" |

### TC-3: Variant Generation

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-3.1: Thumbnail variant | 1. Upload image 2. Request thumbnail | Returns 150x150 image |
| TC-3.2: Preview variant | 1. Upload image 2. Request preview | Returns max 400x400 image |
| TC-3.3: Original preserved | 1. Upload image 2. Request original | Returns original dimensions/quality |

### TC-4: Format Handling

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-4.1: JPEG input | 1. Upload JPEG 2. Get output | Valid optimized image returned |
| TC-4.2: PNG input | 1. Upload PNG 2. Get optimized output | WebP or optimized PNG |
| TC-4.3: HEIC input | 1. Upload iOS HEIC photo | Converted to JPEG/WebP successfully |

### TC-5: EXIF Data Handling

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-5.1: Orientation fix | 1. Upload rotated iPhone photo (EXIF orientation) | Image displayed correctly rotated |
| TC-5.2: GPS stripped | 1. Upload photo with GPS 2. Check output EXIF | No GPS data in output |

### TC-6: Batch Processing

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-6.1: Process 10 images | 1. Submit 10 images for processing | All 10 processed successfully |
| TC-6.2: Error isolation | 1. Include 1 corrupted in batch of 10 | 9 succeed, 1 fails, batch continues |
| TC-6.3: Batch progress | 1. Process 10 images 2. Monitor progress | Shows "3/10 complete" etc. |
