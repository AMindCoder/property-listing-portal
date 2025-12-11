# Open Issue Spec 2: Unified Admin Navigation

## Problem Statement

Admin pages have inconsistent navigation patterns:
- `/admin` (Dashboard) - Uses inline button-style links in header
- `/admin/leads` - Uses standard public-facing navigation with Home/Services/Admin links
- `/admin/services` - Has NO header navigation at all
- `/admin/services/[slug]` - Unknown, likely inconsistent

This creates a confusing user experience where navigation options change depending on which admin page you're on.

## Current Behavior

### `/admin` (Dashboard)
- Header contains: Logo, "View Site", "Services", "Leads", "Add Property", "Logout" buttons
- No standard navigation links
- Has mobile burger menu

### `/admin/leads`
- Header contains: Logo, Home, Services, Admin links (public navigation pattern)
- Has breadcrumb: Admin / Leads
- No Logout button visible in header
- Different styling approach (standard nav vs button links)

### `/admin/services`
- NO header at all
- Page starts directly with "Manage Services" heading
- User must use browser back button to navigate away

### `/admin/add`, `/admin/edit/[id]`
- Unknown - needs verification

## Required Behavior

### Consistent Admin Header

All admin pages (`/admin/*`) must display the same header component with:

| Element | Description |
|---------|-------------|
| **Logo** | PropertyHub logo, links to `/admin` (dashboard) when in admin context |
| **Primary Navigation** | Dashboard, Properties, Leads, Services links |
| **Actions** | "View Site" (opens public site), "Logout" button |
| **Mobile Support** | Collapsible menu for mobile viewports |

### Navigation Structure

```
[Logo] -------- [Dashboard] [Leads] [Services] -------- [View Site] [Logout]
```

### Active State Indication

- Current page/section should be visually highlighted in navigation
- Example: On `/admin/leads`, the "Leads" nav item should appear active

### Breadcrumb Pattern

All admin sub-pages should include breadcrumbs:
- `/admin` - No breadcrumb needed (root)
- `/admin/leads` - "Dashboard / Leads"
- `/admin/services` - "Dashboard / Services"
- `/admin/services/[slug]` - "Dashboard / Services / [Category Name]"
- `/admin/add` - "Dashboard / Add Property"
- `/admin/edit/[id]` - "Dashboard / Edit Property"

### Footer Consistency

- Admin pages should either all have a footer or none should
- Recommendation: Minimal admin footer or no footer (admin is utility-focused)

## Pages Affected

| Page | Current State | Required Change |
|------|---------------|-----------------|
| `/admin` | Has unique header | Adopt unified header |
| `/admin/leads` | Has public-style nav | Adopt unified header |
| `/admin/services` | No header | Add unified header |
| `/admin/services/[slug]` | Unknown | Add unified header |
| `/admin/add` | Unknown | Add unified header |
| `/admin/edit/[id]` | Unknown | Add unified header |

## Acceptance Criteria

- [ ] All `/admin/*` pages display the same header component
- [ ] Header includes: Logo, Dashboard, Leads, Services, View Site, Logout
- [ ] Logo links to `/admin` dashboard
- [ ] Current page is visually indicated in navigation
- [ ] Mobile menu works consistently across all admin pages
- [ ] Breadcrumbs display correct hierarchy on all sub-pages
- [ ] "View Site" opens the public homepage
- [ ] "Logout" triggers logout flow (ties to Spec 1)

## Out of Scope

- Public-facing navigation changes
- Footer design for admin pages (keep current behavior or remove)
- Search functionality in admin header

## Dependencies

- May interact with Open Issue Spec 1 (Authentication) for logout functionality

## Visual Reference

The unified header should follow the pattern from `/admin` dashboard but be extracted into a reusable component.
