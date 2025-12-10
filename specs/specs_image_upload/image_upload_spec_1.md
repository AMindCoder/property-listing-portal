# Spec 1: Storage Provider Abstraction Layer

## Overview

A provider-agnostic storage abstraction layer that decouples the application from any specific storage service (Vercel Blob, AWS S3, Cloudinary, etc.), enabling seamless switching between storage providers without modifying feature code.

---

## Goals

1. Eliminate tight coupling between application features and storage implementation
2. Enable environment-based provider selection (dev vs staging vs production)
3. Support multiple storage providers with a unified interface
4. Allow future provider additions without impacting existing code
5. Centralize storage configuration and credentials management

---

## Functional Requirements

### FR-1: Unified Storage Interface

The system must provide a single, consistent interface for all storage operations regardless of the underlying provider.

**Required Operations:**

| Operation | Description |
|-----------|-------------|
| `upload` | Upload a single file to storage |
| `uploadMultiple` | Upload multiple files to storage |
| `delete` | Delete a file from storage by URL or path |
| `deleteMultiple` | Delete multiple files from storage |
| `getPublicUrl` | Get the public URL for a stored file |
| `exists` | Check if a file exists in storage |

### FR-2: Provider Configuration

The system must support configuration-driven provider selection.

**Configuration Requirements:**

| Config Item | Description |
|-------------|-------------|
| Provider type | Which storage provider to use (vercel-blob, s3, cloudinary) |
| Credentials | Provider-specific authentication credentials |
| Default folder | Base path/folder for uploads |
| Public access | Whether uploaded files are publicly accessible |
| CDN URL | Custom CDN URL prefix (if applicable) |

### FR-3: Supported Providers

The abstraction must support the following providers:

| Provider | Priority | Use Case |
|----------|----------|----------|
| Vercel Blob | P0 (Initial) | Current implementation, development |
| AWS S3 | P1 (Future) | Production scalability |
| Cloudinary | P1 (Future) | Image optimization needs |
| Local Filesystem | P2 (Future) | Offline development, testing |

### FR-4: Upload Options

Each upload operation must accept standardized options:

| Option | Type | Description |
|--------|------|-------------|
| `folder` | string | Destination folder/prefix |
| `filename` | string | Custom filename (optional, auto-generate if not provided) |
| `access` | enum | public / private |
| `contentType` | string | MIME type of the file |
| `metadata` | object | Custom metadata key-value pairs |
| `tags` | string[] | Tags for organization/search |

### FR-5: Upload Result

All upload operations must return a standardized result object:

| Field | Type | Description |
|-------|------|-------------|
| `url` | string | Public URL of the uploaded file |
| `path` | string | Storage path/key of the file |
| `size` | number | File size in bytes |
| `contentType` | string | MIME type |
| `provider` | string | Which provider stored the file |
| `metadata` | object | Any additional provider-specific data |

### FR-6: Error Handling

The system must provide standardized error types:

| Error Type | Description |
|------------|-------------|
| `StorageAuthError` | Authentication/authorization failure |
| `StorageQuotaError` | Storage limit exceeded |
| `StorageNotFoundError` | File not found (for delete/get operations) |
| `StorageUploadError` | Upload operation failed |
| `StorageConfigError` | Invalid configuration |
| `StorageProviderError` | Provider-specific error |

### FR-7: Provider Factory

The system must provide a factory mechanism to instantiate the appropriate provider based on configuration.

**Factory Requirements:**
- Read provider type from environment/config
- Instantiate correct provider class
- Validate required credentials are present
- Return configured provider instance
- Support singleton pattern for efficiency

---

## Non-Functional Requirements

### NFR-1: Zero Feature Code Changes

Switching providers must require only configuration changes, not code changes in features using the storage layer.

### NFR-2: Type Safety

All interfaces, options, and results must be fully typed with TypeScript.

### NFR-3: Testability

The abstraction must support mock providers for unit testing without hitting actual storage services.

### NFR-4: Logging

All storage operations must emit structured logs for debugging and monitoring:
- Operation type
- Provider used
- File path/URL
- Success/failure status
- Duration
- Error details (if applicable)

---

## Out of Scope

- Image transformation/optimization (covered in Spec 3)
- Client-side upload logic (covered in Spec 2)
- UI components (covered in Spec 4)
- Migration of existing files between providers
- Multi-provider simultaneous storage (redundancy)

---

## Dependencies

- Environment configuration system
- Provider-specific SDKs (installed as needed)

---

## Success Criteria

1. Application can switch from Vercel Blob to S3 by changing environment variables only
2. All existing upload functionality continues to work after abstraction
3. New providers can be added by implementing the interface without modifying existing code
4. Unit tests can run with mock provider without external dependencies

---

## Validation & Test Cases (P0 - MVP)

### TC-1: Core Upload Operations

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-1.1: Single file upload | 1. Call `upload()` with valid image | File uploaded, returns valid URL |
| TC-1.2: Multiple file upload | 1. Call `uploadMultiple()` with 5 files | All 5 uploaded, returns 5 URLs |
| TC-1.3: Upload returns accessible URL | 1. Upload file 2. GET the URL | Returns 200 OK with file |

### TC-2: Delete Operations

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-2.1: Delete existing file | 1. Upload file 2. Delete by URL | File deleted, URL returns 404 |
| TC-2.2: Delete non-existent file | 1. Delete invalid URL | Returns error, no crash |

### TC-3: Provider Configuration

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-3.1: Valid config initializes | 1. Set valid credentials 2. Initialize | Provider ready |
| TC-3.2: Missing credentials error | 1. Remove credentials 2. Initialize | Returns config error |
| TC-3.3: Invalid credentials error | 1. Use wrong token 2. Upload | Returns auth error |

### TC-4: Error Handling

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-4.1: Network failure | 1. Disconnect network 2. Upload | Returns error with message |
| TC-4.2: Empty file rejected | 1. Upload 0-byte file | Returns validation error |
