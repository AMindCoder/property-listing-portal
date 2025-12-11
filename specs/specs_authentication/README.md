# Authentication & Authorization Specifications

This folder contains specifications for implementing role-based access control (RBAC) with two user types: **Admin** and **Viewer**.

## Feature Overview

| Role | Access | Capabilities |
|------|--------|--------------|
| **Admin** | Full | View, Create, Edit, Delete all content |
| **Viewer** | Read-only | View all admin pages, cannot modify anything |

**Key Principle:** Viewers see everything admins see, but all action buttons are disabled.

## Specs Index

| Spec # | Title | Focus Area | Priority |
|--------|-------|------------|----------|
| [1](./authentication_authorisation_spec_1.md) | Auth Library & Role-Based Credentials | Backend auth logic | Critical |
| [2](./authentication_authorisation_spec_2.md) | User Context & Role Hook | Frontend state management | Critical |
| [3](./authentication_authorisation_spec_3.md) | API Route Protection | Backend security | Critical |
| [4](./authentication_authorisation_spec_4.md) | UI Component Updates | Frontend UI changes | High |
| [5](./authentication_authorisation_spec_5.md) | Login Page Updates | Login UX | Medium |

## Implementation Order

```
┌─────────────────────────────────────────────────────────────┐
│  PHASE 1: Backend Foundation                                │
├─────────────────────────────────────────────────────────────┤
│  Spec 1: Auth Library    ──────────────────────────────────►│
│  - Add viewer credentials                                   │
│  - Update validateCredentials to return role                │
│  - Update createSession to include role                     │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 2: Security (can be parallel)                        │
├─────────────────────────────────────────────────────────────┤
│  Spec 3: API Protection  ──────────────────────────────────►│
│  - Add requireAdmin() helper                                │
│  - Protect all mutation endpoints                           │
│  - Return 403 for viewer on write operations                │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 3: Frontend Foundation                               │
├─────────────────────────────────────────────────────────────┤
│  Spec 2: User Context    ──────────────────────────────────►│
│  - Create UserContext and UserProvider                      │
│  - Create useUser() hook                                    │
│  - Wrap admin layout with provider                          │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 4: UI Updates                                        │
├─────────────────────────────────────────────────────────────┤
│  Spec 4: Component Updates ────────────────────────────────►│
│  - Disable edit/delete buttons for viewers                  │
│  - Add role badge to header                                 │
│  - Add view-only banner                                     │
│                                                             │
│  Spec 5: Login Page      ──────────────────────────────────►│
│  - Update branding (remove "Admin" specific text)           │
│  - Update nav link text                                     │
└─────────────────────────────────────────────────────────────┘
```

## Dependency Graph

```
Spec 1 (Auth Library)
    │
    ├──────────────────┬─────────────────────┐
    │                  │                     │
    ▼                  ▼                     │
Spec 3 (API)      Spec 2 (Context)          │
                       │                     │
                       ▼                     │
                  Spec 4 (UI)                │
                       │                     │
                       └──────────┬──────────┘
                                  │
                                  ▼
                           Spec 5 (Login)
```

## Quick Reference

### User Credentials (Default)

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Viewer | `viewer` | `viewer123` |

### Environment Variables

```env
# Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Viewer credentials
VIEWER_USERNAME=viewer
VIEWER_PASSWORD=viewer123

# JWT Secret (existing)
JWT_SECRET=your-secret-key
```

### Session Payload

```typescript
interface SessionPayload {
  username: string
  role: 'admin' | 'viewer'
  expiresAt: Date
}
```

### API Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 401 | Not authenticated (no session) |
| 403 | Forbidden (viewer trying to modify) |

## Testing Checklist

### Backend
- [ ] Admin can login with admin credentials
- [ ] Viewer can login with viewer credentials
- [ ] Invalid credentials rejected
- [ ] Session includes correct role
- [ ] Viewer gets 403 on POST/PUT/DELETE
- [ ] Admin can perform all operations

### Frontend
- [ ] Admin sees all buttons enabled
- [ ] Viewer sees all buttons disabled
- [ ] Role badge shows correct role
- [ ] View-only banner shows for viewer
- [ ] Login page works for both roles

## Files Changed Summary

| Category | Files |
|----------|-------|
| **Auth Library** | `src/lib/auth.ts` |
| **API Routes** | `src/app/api/properties/*`, `src/app/api/leads/*`, `src/app/api/reminders/*`, etc. |
| **Context** | `src/app/contexts/UserContext.tsx` (new) |
| **Layout** | `src/app/admin/layout.tsx` |
| **Components** | `AdminPropertyCard`, `AdminHeader`, various admin pages |
| **Login** | `src/app/login/page.tsx`, `Header.tsx` |
| **Styles** | `src/app/globals.css` |
| **Config** | `.env.example` |
