# PropertyHub Enhancement Plan

## Overview

This document outlines the enhancements required to address user-reported issues and feature requests for the PropertyHub application.

---

## Part 1: Critical Bug Fixes

### 1.1 Image Upload Fix (Production)

**Problem:** Images cannot be uploaded on Vercel production because serverless functions lack persistent filesystem storage.

**What to do:**
- Replace local filesystem storage (`/public/uploads/`) with Vercel Blob storage
- Update the upload API route to use Vercel Blob SDK
- Update image URLs to use Vercel Blob URLs instead of local paths
- Handle existing image paths gracefully (backward compatibility)

**Validation:**
- [ ] Deploy to Vercel production
- [ ] Navigate to Admin > Add Property
- [ ] Upload 1-3 images using the file picker
- [ ] Verify images appear in preview
- [ ] Submit the form and verify the property is created with images
- [ ] View the property on the public listing page and confirm images display correctly

---

### 1.2 Edit Listing Fix

**Problem:** Editing listings may fail on production when images are involved due to the same storage issue.

**What to do:**
- Ensure edit functionality uses the same Vercel Blob storage
- Preserve existing images when editing (don't re-upload unchanged images)
- Allow adding new images and removing existing ones

**Validation:**
- [ ] Navigate to Admin Dashboard on production
- [ ] Click "Edit" on any existing property
- [ ] Verify existing data loads correctly in the form
- [ ] Modify the title and save - verify change persists
- [ ] Add a new image to an existing property - verify it uploads and saves
- [ ] Remove an existing image - verify it's removed after save

---

### 1.3 Mobile Responsiveness Improvements

**Problem:** Some UI elements are not optimized for mobile devices.

**What to do:**
- Improve sidebar filter collapse behavior on mobile home page
- Ensure form fields are properly sized on mobile screens
- Fix any overflow issues on property cards
- Ensure buttons and touch targets meet minimum size requirements (44x44px)

**Validation:**
- [ ] Test on iPhone SE (375x667) viewport
- [ ] Test on iPhone 12/13 (390x844) viewport
- [ ] Home page: Sidebar collapses properly, property cards display correctly
- [ ] Admin Dashboard: Cards stack vertically, Edit/Delete buttons are tappable
- [ ] Add Property form: All fields are accessible, keyboard doesn't obscure inputs
- [ ] Test touch interactions on actual mobile device or emulator

---

## Part 2: New Features

### 2.1 Owner Contact Information

**Problem:** Users want to add owner name and phone number to property listings.

**What to do:**
- Add `ownerName` field to the Property database model
- Add `ownerPhone` field to the Property database model
- Add owner name input field to Add Property form
- Add owner phone input field to Add Property form (with phone validation)
- Display owner contact info on property detail page
- Update Edit Property form to include these fields

**Validation:**
- [ ] Run database migration successfully
- [ ] Add Property form shows "Owner Name" and "Owner Phone" fields
- [ ] Create a new property with owner details
- [ ] Verify owner info is saved to database
- [ ] View property detail page - owner info is displayed
- [ ] Edit property - owner info can be modified
- [ ] Phone field validates format (10 digits for Indian numbers)

---

### 2.2 Shop Property Type

**Problem:** Users want to list shops but this property type is not available.

**What to do:**
- Add "Shop" option to the Property Type dropdown in Add Property form
- Add "Shop" option to the Property Type dropdown in Edit Property form
- Add "Shop" option to the filter dropdown on home page
- Update property card display to show appropriate icon for Shop type

**Validation:**
- [ ] Add Property form shows "Shop" in Property Type dropdown
- [ ] Create a new property with type "Shop"
- [ ] Property card displays "Shop" type correctly
- [ ] Home page filter includes "Shop" option
- [ ] Filter by "Shop" shows only shop listings

---

### 2.3 Support for 10 Photos Per Listing

**Problem:** Users want to upload up to 10 photos per property listing.

**What to do:**
- Update image upload UI to clearly show 10 image slots
- Add visual indicators for uploaded vs empty slots
- Implement drag-and-drop reordering for images
- Add validation to prevent more than 10 images
- Show image count (e.g., "3/10 images uploaded")
- Ensure image gallery on property detail page handles multiple images

**Validation:**
- [ ] Add Property form shows 10 image upload capability
- [ ] Upload exactly 10 images - all display in preview
- [ ] Try to upload 11th image - shows error/warning
- [ ] Remove images and verify count updates
- [ ] Property detail page shows all uploaded images
- [ ] Images can be navigated (carousel/gallery view)

---

### 2.4 Price Display in Rupees

**Problem:** Prices are currently displayed in USD ($) but should be in Indian Rupees.

**What to do:**
- Change currency symbol from `$` to `₹` throughout the application
- Update price formatting to use Indian number system (lakhs/crores) or standard comma separation
- Update the Price input label to indicate Rupees
- Apply changes to: Property cards, Property detail page, Admin dashboard cards

**Validation:**
- [ ] Home page property cards show prices with ₹ symbol
- [ ] Admin dashboard shows prices with ₹ symbol
- [ ] Property detail page shows price with ₹ symbol
- [ ] Add Property form label shows "Price (₹)"
- [ ] Existing prices display correctly after change

---

### 2.5 Construction Service Button

**Problem:** Users want to promote construction services within the application.

**What to do:**
- Add a "Construction Services" button/link in the main navigation or footer
- Create a Construction Services page or modal with contact information
- Display construction service CTA on property detail pages (especially for Plots)
- Include contact information or inquiry form

**Validation:**
- [ ] Construction Services button visible on home page (header/footer)
- [ ] Clicking button opens services page or modal
- [ ] Services page displays contact information
- [ ] Property detail page (for Plots) shows construction service CTA
- [ ] Contact/inquiry method works correctly

---

### 2.6 Leads Management System

**Problem:** Users want to save and manage client leads (name, phone, purpose).

**What to do:**
- Create a new `Lead` database model with fields: id, name, phone, purpose, notes, propertyId (optional), createdAt, status
- Create API routes for leads CRUD operations (create, read, update, delete)
- Add "Leads" navigation item in admin dashboard
- Create Leads listing page showing all saved leads
- Create Add Lead form with fields: name, phone, purpose, optional property link
- Add ability to link a lead to a specific property
- Add "Save as Lead" button on property detail pages for quick lead capture
- Add lead status tracking (New, Contacted, Interested, Converted, Lost)

**Validation:**
- [ ] Database migration creates Lead table successfully
- [ ] Admin navigation shows "Leads" option
- [ ] Leads page loads and displays empty state initially
- [ ] Add new lead with name, phone, and purpose
- [ ] Lead appears in leads list after creation
- [ ] Edit existing lead - changes persist
- [ ] Delete lead - removed from list
- [ ] Link lead to a property - property reference displays
- [ ] Filter leads by status
- [ ] "Save as Lead" button works from property detail page

---

## Implementation Priority

| Priority | Enhancement | Estimated Effort |
|----------|-------------|------------------|
| 1 | Image Upload Fix (1.1) | High |
| 2 | Edit Listing Fix (1.2) | Medium |
| 3 | Price in Rupees (2.4) | Low |
| 4 | Shop Property Type (2.2) | Low |
| 5 | Owner Contact Info (2.1) | Medium |
| 6 | Mobile Responsiveness (1.3) | Medium |
| 7 | 10 Photos Support (2.3) | Medium |
| 8 | Construction Service (2.5) | Medium |
| 9 | Leads Management (2.6) | High |

---

## Database Schema Changes Required

```
Property Model - Add:
  - ownerName    String?
  - ownerPhone   String?

New Lead Model:
  - id           String (UUID, Primary Key)
  - name         String
  - phone        String
  - purpose      String
  - notes        String?
  - propertyId   String? (Foreign Key to Property)
  - status       String (default: "NEW")
  - createdAt    DateTime
  - updatedAt    DateTime
```

---

## Files Likely to be Modified

- `prisma/schema.prisma` - Database schema
- `src/app/api/upload/route.ts` - Image upload API
- `src/app/api/properties/route.ts` - Properties API
- `src/app/api/leads/route.ts` - New leads API
- `src/app/admin/add/page.tsx` - Add property form
- `src/app/admin/edit/[id]/page.tsx` - Edit property form
- `src/app/admin/leads/page.tsx` - New leads management page
- `src/app/components/PropertyCard.tsx` - Property card display
- `src/app/properties/[id]/page.tsx` - Property detail page
- `src/app/globals.css` - Mobile responsiveness fixes
- `src/app/page.tsx` - Home page filters

---

## Success Criteria

All enhancements are considered complete when:

1. All validation checkboxes above are checked
2. Application builds without errors (`npm run build`)
3. All features work on production (Vercel deployment)
4. Mobile testing passes on at least 2 viewport sizes
5. No console errors in browser developer tools
