# Authentication & Authorization Spec 1: Auth Library & Role-Based Credentials

## Problem Statement

The current authentication system only supports a single "admin" user. We need to support two user roles:
- **Admin**: Full access to view, create, edit, and delete all content
- **Viewer**: Can view all admin pages and content but cannot modify anything

The auth library needs to be updated to handle multiple credential sets and include role information in the session.

## Current State

### File: `src/lib/auth.ts`

```typescript
// Current: Single admin credential
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

// Current: validateCredentials returns boolean
export async function validateCredentials(username: string, password: string): Promise<boolean> {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

// Current: createSession always sets isAdmin: true
export async function createSession(username: string): Promise<string> {
  const token = await new SignJWT({
    username,
    isAdmin: true,  // Hardcoded!
    // ...
  })
}
```

## Required Changes

### 1. Environment Variables

Add new environment variables for viewer credentials:

| Variable | Purpose | Default |
|----------|---------|---------|
| `ADMIN_USERNAME` | Admin login username | `admin` |
| `ADMIN_PASSWORD` | Admin login password | `admin123` |
| `VIEWER_USERNAME` | Viewer login username | `viewer` |
| `VIEWER_PASSWORD` | Viewer login password | `viewer123` |

### 2. User Role Type

Define a role type for type safety:

```typescript
type UserRole = 'admin' | 'viewer'
```

### 3. Updated Session Payload

| Field | Type | Description |
|-------|------|-------------|
| `username` | string | The logged-in username |
| `role` | UserRole | Either 'admin' or 'viewer' |
| `expiresAt` | Date | Session expiration timestamp |

Note: Replace `isAdmin: boolean` with `role: UserRole` for clarity and extensibility.

### 4. Updated `validateCredentials` Function

**Current signature:**
```typescript
validateCredentials(username: string, password: string): Promise<boolean>
```

**New signature:**
```typescript
validateCredentials(username: string, password: string): Promise<UserRole | null>
```

**Behavior:**
- Returns `'admin'` if credentials match admin
- Returns `'viewer'` if credentials match viewer
- Returns `null` if credentials don't match any user

### 5. Updated `createSession` Function

**Current signature:**
```typescript
createSession(username: string): Promise<string>
```

**New signature:**
```typescript
createSession(username: string, role: UserRole): Promise<string>
```

**Behavior:**
- Accepts role as parameter
- Includes `role` in JWT payload instead of hardcoded `isAdmin: true`

### 6. Helper Functions

Add convenience functions for role checking:

| Function | Signature | Description |
|----------|-----------|-------------|
| `isAdmin` | `(session: SessionPayload) => boolean` | Returns true if role is 'admin' |
| `isViewer` | `(session: SessionPayload) => boolean` | Returns true if role is 'viewer' |
| `canModify` | `(session: SessionPayload) => boolean` | Alias for isAdmin - returns true if user can edit/delete |

### 7. Updated Login API

File: `src/app/api/auth/login/route.ts`

**Current flow:**
1. Validate credentials (returns boolean)
2. If valid, create session with hardcoded isAdmin

**New flow:**
1. Validate credentials (returns role or null)
2. If role returned, create session with that role
3. If null returned, return 401 error

### 8. Updated Session API Response

File: `src/app/api/auth/session/route.ts`

**Current response:**
```json
{
  "authenticated": true,
  "user": {
    "username": "admin",
    "isAdmin": true
  }
}
```

**New response:**
```json
{
  "authenticated": true,
  "user": {
    "username": "admin",
    "role": "admin",
    "canModify": true
  }
}
```

## Acceptance Criteria

### Credentials
- [ ] Admin can log in with `ADMIN_USERNAME` / `ADMIN_PASSWORD`
- [ ] Viewer can log in with `VIEWER_USERNAME` / `VIEWER_PASSWORD`
- [ ] Invalid credentials for both users returns authentication error
- [ ] Default credentials work if environment variables not set

### Session
- [ ] Admin session contains `role: 'admin'`
- [ ] Viewer session contains `role: 'viewer'`
- [ ] Session payload includes `role` field (not `isAdmin`)
- [ ] JWT token is valid and contains correct role

### API Responses
- [ ] `/api/auth/session` returns `role` and `canModify` fields
- [ ] Login API works for both admin and viewer credentials
- [ ] Logout API works the same for both roles

### Type Safety
- [ ] `UserRole` type is defined and exported
- [ ] `SessionPayload` interface updated with `role` field
- [ ] Helper functions (`isAdmin`, `canModify`) are typed correctly

## Backward Compatibility

- The `isAdmin` field can be kept temporarily for backward compatibility
- Components currently using `isAdmin` should continue to work
- Gradually migrate to using `role` field

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/auth.ts` | Add role type, update functions, add helpers |
| `src/app/api/auth/login/route.ts` | Pass role to createSession |
| `src/app/api/auth/session/route.ts` | Return role and canModify |
| `.env.example` | Add VIEWER_USERNAME, VIEWER_PASSWORD |

## Out of Scope

- Database storage of users (keep using environment variables)
- User registration
- Password hashing (keep simple string comparison for now)
- Multiple viewers or multiple admins
- Role hierarchy beyond admin/viewer

## Dependencies

None - this is the foundational spec that other specs depend on.

## Testing Scenarios

| Scenario | Expected Result |
|----------|-----------------|
| Login as admin | Session created with role='admin' |
| Login as viewer | Session created with role='viewer' |
| Login with wrong password | 401 error |
| Login with unknown username | 401 error |
| Check session as admin | Returns role='admin', canModify=true |
| Check session as viewer | Returns role='viewer', canModify=false |
