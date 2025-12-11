# Authentication & Authorization Spec 2: User Context & Role Hook

## Problem Statement

Frontend components need access to the current user's role to conditionally render UI elements (enable/disable buttons, show/hide actions). Currently, there's no centralized way for components to access user session information.

We need a React context and hook that:
- Fetches and caches the user session
- Provides role information to any component
- Handles loading and error states
- Re-fetches on auth state changes

## Current State

- No user context exists
- Components would need to individually fetch `/api/auth/session`
- No shared state for user role across the application

## Required Implementation

### 1. User Context Provider

Create a context that wraps the admin layout and provides user information to all child components.

**Location:** `src/app/contexts/UserContext.tsx`

### 2. Context Value Shape

```typescript
interface UserContextValue {
  user: {
    username: string
    role: 'admin' | 'viewer'
    canModify: boolean
  } | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  refetch: () => Promise<void>
}
```

### 3. useUser Hook

A convenience hook to access the user context:

```typescript
function useUser(): UserContextValue
```

**Usage in components:**
```typescript
const { user, isLoading, isAuthenticated } = useUser()

if (user?.canModify) {
  // Show edit button
}
```

### 4. Context Provider Behavior

| State | Condition | Value |
|-------|-----------|-------|
| `isLoading` | Initial fetch in progress | `true` |
| `isAuthenticated` | User session exists and valid | `true` |
| `user` | Session data available | User object |
| `user` | Not authenticated or error | `null` |
| `error` | Fetch failed | Error message |

### 5. Fetch Behavior

- Fetch session on mount
- Cache result (don't refetch on every render)
- Provide `refetch()` function for manual refresh
- Handle network errors gracefully

### 6. Provider Integration

The `UserProvider` should wrap admin pages in the layout:

**Location:** `src/app/admin/layout.tsx`

```typescript
export default function AdminLayout({ children }) {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  )
}
```

### 7. Helper Properties

The hook should provide computed properties for common checks:

| Property | Type | Description |
|----------|------|-------------|
| `user.canModify` | boolean | True if user is admin (can edit/delete) |
| `isAdmin` | boolean | Shorthand for role === 'admin' |
| `isViewer` | boolean | Shorthand for role === 'viewer' |

## Acceptance Criteria

### Context Setup
- [ ] `UserContext` is created and exported
- [ ] `UserProvider` component wraps admin layout
- [ ] `useUser` hook is available for import

### Data Fetching
- [ ] Session is fetched from `/api/auth/session` on mount
- [ ] Loading state is true during fetch
- [ ] Error state is populated on fetch failure
- [ ] User data is available after successful fetch

### User Information
- [ ] `user.username` contains the logged-in username
- [ ] `user.role` contains 'admin' or 'viewer'
- [ ] `user.canModify` is true for admin, false for viewer
- [ ] `isAuthenticated` is true when user exists

### Hook Behavior
- [ ] `useUser()` throws error if used outside provider
- [ ] Multiple components using hook share same data
- [ ] `refetch()` function triggers new session fetch

### Edge Cases
- [ ] Handles unauthenticated state (user = null)
- [ ] Handles network errors gracefully
- [ ] Does not cause infinite re-renders

## Component Usage Examples

### Example 1: Conditional Button Rendering

```typescript
function DeleteButton({ onDelete }) {
  const { user } = useUser()

  return (
    <button
      onClick={onDelete}
      disabled={!user?.canModify}
      className={!user?.canModify ? 'opacity-50 cursor-not-allowed' : ''}
    >
      Delete
    </button>
  )
}
```

### Example 2: Conditional Section Visibility

```typescript
function AdminActions() {
  const { user, isLoading } = useUser()

  if (isLoading) return <Spinner />

  if (!user?.canModify) {
    return <p className="text-muted">View-only mode</p>
  }

  return (
    <div>
      <button>Add New</button>
      <button>Edit</button>
    </div>
  )
}
```

### Example 3: Role Indicator in Header

```typescript
function AdminHeader() {
  const { user } = useUser()

  return (
    <header>
      <span>Logged in as: {user?.username}</span>
      <span className="badge">
        {user?.role === 'admin' ? 'Admin' : 'Viewer'}
      </span>
    </header>
  )
}
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/app/contexts/UserContext.tsx` | Context definition and provider |
| `src/app/hooks/useUser.ts` | Hook export (optional, can be in context file) |

## Files to Modify

| File | Changes |
|------|---------|
| `src/app/admin/layout.tsx` | Wrap children with UserProvider |

## Out of Scope

- Server-side session in React Server Components
- Session refresh/token rotation
- Optimistic updates
- Real-time session sync across tabs

## Dependencies

- **Spec 1**: Auth library must return `role` in session response
- `/api/auth/session` endpoint must include role information

## Error Handling

| Error Condition | Behavior |
|-----------------|----------|
| Network failure | Set error state, user = null |
| 401 Unauthorized | Set isAuthenticated = false, user = null |
| Invalid response | Set error state, user = null |
| Server error (500) | Set error state, retry option available |

## Performance Considerations

- Session fetch happens once per page load (not on every component mount)
- Context value should be memoized to prevent unnecessary re-renders
- Consider SWR or React Query patterns for caching (optional)
