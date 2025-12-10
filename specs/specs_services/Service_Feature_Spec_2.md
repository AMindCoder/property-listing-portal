# Spec 2: Service Categories & Gallery Data Model

## Overview

This specification defines the data model for service categories and their associated gallery items. The model supports storing service category information and gallery images with descriptions, enabling the admin to manage construction portfolio content.

---

## Goals

1. Define a flexible data structure for service categories
2. Define a gallery item model that supports images with rich descriptions
3. Support ordering and organization of gallery items within categories
4. Enable efficient querying for both admin management and public display
5. Maintain data integrity and relationships between categories and gallery items

---

## Data Entities

### Entity 1: Service Category

Represents a service category (e.g., "Foundations & Structure", "Walls & Masonry").

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String (UUID/CUID) | Yes | Unique identifier |
| name | String | Yes | Display name of the category |
| slug | String | Yes | URL-friendly identifier (unique) |
| description | String | No | Brief description of the category |
| displayOrder | Integer | Yes | Order in which category appears in menu |
| isActive | Boolean | Yes | Whether category is visible to public |
| metaTitle | String | No | SEO meta title for the page |
| metaDescription | String | No | SEO meta description for the page |
| coverImageUrl | String | No | Representative image for category cards |
| createdAt | DateTime | Yes | Timestamp of creation |
| updatedAt | DateTime | Yes | Timestamp of last update |

**Default Categories:**

| Name | Slug | Display Order |
|------|------|---------------|
| Foundations & Structure | foundations | 1 |
| Walls & Masonry | walls | 2 |
| Interiors & Finishes | interiors | 3 |
| Roofing & Ceilings | ceilings | 4 |
| Stairs & Railings | stairs | 5 |
| Exteriors & Landscaping | exteriors | 6 |

### Entity 2: Gallery Item

Represents an individual gallery item (image with description) within a service category.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String (UUID/CUID) | Yes | Unique identifier |
| categoryId | String | Yes | Foreign key to Service Category |
| title | String | Yes | Title/caption for the gallery item |
| description | Text | No | Detailed description (materials, process, etc.) |
| imageUrl | String | Yes | URL of the uploaded image |
| imageThumbnailUrl | String | No | URL of thumbnail version (if generated) |
| imageAltText | String | No | Alt text for accessibility |
| displayOrder | Integer | Yes | Order within the category gallery |
| isActive | Boolean | Yes | Whether item is visible to public |
| projectName | String | No | Name of the project (if applicable) |
| projectLocation | String | No | Location of the project |
| completionDate | Date | No | When the work was completed |
| tags | String[] | No | Tags for filtering (e.g., "residential", "commercial") |
| createdAt | DateTime | Yes | Timestamp of creation |
| updatedAt | DateTime | Yes | Timestamp of last update |

---

## Relationships

### Category to Gallery Items

| Relationship | Type | Description |
|--------------|------|-------------|
| Category → Gallery Items | One-to-Many | A category has many gallery items |
| Gallery Item → Category | Many-to-One | Each gallery item belongs to one category |
| Cascade Delete | Yes | Deleting a category deletes all its gallery items |

---

## Functional Requirements

### FR-1: Category Management

| Operation | Description |
|-----------|-------------|
| Create | Admin can create new service categories |
| Read | System can fetch single category or list of categories |
| Update | Admin can update category details |
| Delete | Admin can delete categories (with cascade to gallery items) |
| Reorder | Admin can change the display order of categories |
| Toggle Active | Admin can activate/deactivate categories |

### FR-2: Gallery Item Management

| Operation | Description |
|-----------|-------------|
| Create | Admin can add new gallery items to a category |
| Read | System can fetch gallery items for a category |
| Update | Admin can update gallery item details |
| Delete | Admin can delete gallery items (image cleanup required) |
| Reorder | Admin can change the display order within category |
| Toggle Active | Admin can activate/deactivate items |
| Bulk Operations | Admin can delete multiple items at once |

### FR-3: Query Requirements

| Query | Description |
|-------|-------------|
| Active Categories | Fetch all active categories ordered by displayOrder |
| Category by Slug | Fetch single category by its URL slug |
| Gallery by Category | Fetch all active gallery items for a category |
| Gallery Count | Count of gallery items per category |
| Recent Items | Fetch N most recent gallery items across all categories |

### FR-4: Data Validation

| Field | Validation Rules |
|-------|-----------------|
| Category Name | Required, 3-100 characters |
| Category Slug | Required, unique, lowercase, alphanumeric with hyphens |
| Gallery Title | Required, 3-200 characters |
| Gallery Description | Optional, max 2000 characters |
| Image URL | Required, valid URL format |
| Display Order | Required, positive integer |

### FR-5: Default Data Seeding

The system must seed the 6 default service categories on initial setup.

| Seed Data | Details |
|-----------|---------|
| Categories | 6 predefined categories with names, slugs, and order |
| Active State | All seeded categories active by default |
| Gallery Items | No default gallery items (admin adds content) |

---

## Non-Functional Requirements

### NFR-1: Data Integrity

- Slug must be unique across categories
- Display order must be maintained on insert/update/delete
- Image URLs must be validated before saving
- Foreign key constraints must be enforced

### NFR-2: Performance

- Category list queries should return in < 50ms
- Gallery queries should support pagination
- Indexes on commonly queried fields (slug, categoryId, isActive)

### NFR-3: Soft Delete Consideration

| Option | Description |
|--------|-------------|
| Hard Delete | Items are permanently removed (recommended for simplicity) |
| Soft Delete | Items are marked as deleted but retained (future consideration) |

**Recommendation:** Start with hard delete for MVP, consider soft delete for future if audit trail is needed.

---

## Out of Scope

- Image storage/upload mechanism (uses existing image upload system)
- Image optimization/thumbnails generation
- User-generated content (reviews, comments)
- Multi-language support for content
- Version history for content changes

---

## Dependencies

- Database system (Prisma with current DB)
- Existing image upload/storage system
- Existing authentication system (for admin operations)

---

## Success Criteria

1. All 6 default categories are seeded successfully
2. Admin can perform CRUD operations on categories
3. Admin can perform CRUD operations on gallery items
4. Public pages can query active categories and their gallery items
5. Data integrity is maintained (no orphan gallery items)
6. Queries perform within acceptable limits

---

## Data Flow Examples

### DF-1: Adding a New Gallery Item

```
Admin selects category "Walls & Masonry"
    → Admin uploads image (via existing image upload system)
    → Image URL is returned
    → Admin fills title and description
    → System creates gallery item with:
        - categoryId: [walls category ID]
        - imageUrl: [returned URL]
        - title: [admin input]
        - description: [admin input]
        - displayOrder: [next available order]
        - isActive: true
    → Gallery item saved to database
```

### DF-2: Public Viewing Gallery

```
User navigates to /services/walls
    → System queries category by slug "walls"
    → System queries gallery items where:
        - categoryId = [walls category ID]
        - isActive = true
        - ORDER BY displayOrder ASC
    → Returns category info + gallery items array
    → Page renders gallery
```

---

## Indexing Strategy

| Index | Fields | Purpose |
|-------|--------|---------|
| idx_category_slug | slug | Fast lookup by URL slug |
| idx_category_order | displayOrder, isActive | Menu ordering query |
| idx_gallery_category | categoryId, isActive, displayOrder | Gallery page queries |
| idx_gallery_created | createdAt | Recent items query |
