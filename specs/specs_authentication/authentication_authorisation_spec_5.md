# Authentication & Authorization Spec 5: Login Page Updates

## Problem Statement

The current login page is branded as "Admin Portal" and is designed for admin-only access. With the introduction of a viewer role, the login page needs to be updated to:
- Support both admin and viewer logins
- Remove admin-specific branding
- Provide appropriate messaging for both user types

## Current State

### Current UI Elements

| Element | Current Text |
|---------|--------------|
| Page Title | "Admin Portal" |
| Subtitle | "Sign in to access the dashboard" |
| Icon | User/person icon |
| Nav Link | "Admin" pointing to `/login` |

### Current Behavior
- Single login form
- Validates against admin credentials only
- Redirects to `/admin` on success

## Required Changes

### 1. Branding Updates

| Element | Current | New |
|---------|---------|-----|
| Page Title | "Admin Portal" | "Portal Login" or "Sign In" |
| Subtitle | "Sign in to access the dashboard" | "Sign in to continue" |
| Icon | Keep as-is | Keep as-is (generic user icon works) |

### 2. Navigation Link Update

| Location | Current | New |
|----------|---------|-----|
| Public Header | "Admin" -> `/login` | "Login" or "Sign In" -> `/login` |
| Footer (if exists) | "Admin Portal" | "Login" |

### 3. Post-Login Behavior

| User Type | Redirect Destination |
|-----------|---------------------|
| Admin | `/admin` (or `callbackUrl` if specified) |
| Viewer | `/admin` (or `callbackUrl` if specified) |

Both roles redirect to the same admin area - the difference is in what they can do there.

### 4. Login Success Feedback (Optional)

After successful login, before redirect, optionally show:

| User Type | Message |
|-----------|---------|
| Admin | "Welcome back, [username]" |
| Viewer | "Welcome, [username] (View Only)" |

**Note:** This is optional as the redirect happens quickly.

### 5. Error Messages

Keep existing error handling:

| Scenario | Message |
|----------|---------|
| Invalid credentials | "Invalid username or password" |
| Network error | "An error occurred. Please try again." |
| Empty fields | "Username and password are required" |

### 6. Credential Hints (Development Only)

For development/demo purposes, optionally show credential hints:

```
Demo Credentials:
- Admin: admin / admin123
- Viewer: viewer / viewer123
```

**Important:** This should be hidden in production or shown only in development mode.

### 7. Accessibility Updates

| Requirement | Implementation |
|-------------|----------------|
| Form labels | Keep existing (already good) |
| Focus management | Keep existing |
| Error announcements | Ensure screen readers announce errors |
| Autocomplete | Add `autocomplete="username"` and `autocomplete="current-password"` |

## Visual Design

### No Major Changes Required

The current login page design is clean and works for both user types. Only text content changes are needed.

### Layout Remains
```
┌─────────────────────────────────────┐
│           [Header Nav]              │
├─────────────────────────────────────┤
│                                     │
│         ┌───────────────┐           │
│         │   [Icon]      │           │
│         │  Portal Login │           │
│         │  Sign in to   │           │
│         │  continue     │           │
│         ├───────────────┤           │
│         │ Username      │           │
│         │ [________]    │           │
│         │ Password      │           │
│         │ [________]    │           │
│         │               │           │
│         │ [Sign In]     │           │
│         │               │           │
│         │ Return to Home│           │
│         └───────────────┘           │
│                                     │
└─────────────────────────────────────┘
```

## Acceptance Criteria

### Branding
- [ ] Page title changed from "Admin Portal" to "Portal Login" or similar
- [ ] Subtitle updated to generic text
- [ ] No admin-specific language on login page

### Navigation
- [ ] Header nav link says "Login" or "Sign In" instead of "Admin"
- [ ] Link still points to `/login`

### Functionality
- [ ] Admin credentials work and redirect to `/admin`
- [ ] Viewer credentials work and redirect to `/admin`
- [ ] Invalid credentials show error message
- [ ] Loading state shown during login
- [ ] `callbackUrl` parameter respected for both roles

### Form
- [ ] Username field has `autocomplete="username"`
- [ ] Password field has `autocomplete="current-password"`
- [ ] Form is accessible (labels, focus, errors)

### Development (Optional)
- [ ] Demo credentials hint shown in development mode only
- [ ] Hint hidden in production build

## Files to Modify

| File | Changes |
|------|---------|
| `src/app/login/page.tsx` | Update title, subtitle text |
| `src/app/components/Header.tsx` | Change "Admin" to "Login" in nav |
| `src/app/components/Footer.tsx` (if exists) | Update any admin references |

## Out of Scope

- User type selection on login form (both use same form)
- Remember me functionality
- Forgot password functionality
- Social login options
- Two-factor authentication
- Account lockout after failed attempts

## Dependencies

- **Spec 1**: Backend must validate both admin and viewer credentials

## Testing Scenarios

| Scenario | Steps | Expected |
|----------|-------|----------|
| Admin login | Enter admin/admin123, submit | Redirect to /admin |
| Viewer login | Enter viewer/viewer123, submit | Redirect to /admin |
| Wrong password | Enter admin/wrongpass, submit | Show error message |
| Unknown user | Enter unknown/pass, submit | Show error message |
| Empty form | Click submit with empty fields | Show validation error |
| Callback URL | Login from /admin/leads redirect | Return to /admin/leads |

## Notes

- The login experience should be identical for both user types
- Role differentiation happens after login, not during
- Keep the login page simple and focused
