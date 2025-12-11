# Open Issue Spec 1: Admin Authentication System

## Problem Statement

The admin panel (`/admin` and all sub-routes) is currently accessible without any authentication. The existing login page (`/login`) only performs a client-side credential check and redirect - it does not create any session, cookie, or token. Users can directly navigate to `/admin` without logging in.

## Current Behavior

1. User navigates to `/admin` directly - page loads with full admin functionality
2. User navigates to `/login`, enters credentials - only client-side validation occurs
3. On successful login, user is redirected to `/admin` via `router.push()` - no session created
4. Logout button simply redirects to home page - nothing to clear
5. No middleware protection on admin routes

## Required Behavior

### Authentication Flow

1. **Unauthenticated user visits `/admin/*`** - Must be redirected to `/login`
2. **User submits valid credentials on `/login`** - Session/token must be created and stored
3. **Authenticated user visits `/admin/*`** - Page loads normally with admin functionality
4. **User clicks Logout** - Session/token must be invalidated and cleared
5. **Session expires** - User must be redirected to `/login` on next admin page visit

### Protected Routes

All routes under `/admin/*` must require authentication:
- `/admin` - Dashboard
- `/admin/add` - Add property
- `/admin/edit/[id]` - Edit property
- `/admin/leads` - Leads management
- `/admin/services` - Services management
- `/admin/services/[slug]` - Service category gallery

### Session Requirements

| Requirement | Description |
|-------------|-------------|
| **Persistence** | Session must survive page refresh |
| **Security** | Credentials must not be stored in localStorage/sessionStorage in plain text |
| **Expiration** | Session should have a configurable expiration time |
| **Server validation** | Session must be validated server-side, not just client-side |

### Login Page Requirements

| Requirement | Description |
|-------------|-------------|
| **Validation feedback** | Show clear error message for invalid credentials |
| **Loading state** | Show loading indicator during authentication |
| **Redirect after login** | Return user to originally requested admin page after successful login |
| **Remember intended destination** | If user was redirected from `/admin/leads`, return them there after login |

### Logout Requirements

| Requirement | Description |
|-------------|-------------|
| **Clear session** | Invalidate session on server and clear client-side tokens |
| **Redirect** | Redirect to home page or login page after logout |
| **Confirmation** | Optional: Show confirmation before logout |

## Acceptance Criteria

- [ ] Direct navigation to `/admin` redirects to `/login` when not authenticated
- [ ] Valid credentials on `/login` creates a persistent session
- [ ] Invalid credentials show an error message without redirect
- [ ] Authenticated users can access all `/admin/*` routes
- [ ] Logout clears the session and prevents access to admin routes
- [ ] Session persists across page refreshes
- [ ] Session expiration triggers re-authentication
- [ ] API routes under `/api/` that modify data are also protected (optional, scope TBD)

## Out of Scope

- User registration / sign-up
- Password reset functionality
- Multiple user accounts / roles
- OAuth / social login
- Two-factor authentication

## Dependencies

None - this is a foundational security feature.

## Notes

- Credential storage (admin username/password) approach is TBD - could be environment variables for simplicity or database for future extensibility
- Consider using Next.js middleware for route protection
