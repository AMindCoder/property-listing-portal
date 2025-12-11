# Authentication & Authorization Spec 3: API Route Protection

## Problem Statement

Even if the UI disables buttons for viewers, they could still call mutation APIs directly (via browser dev tools, curl, etc.). All API routes that modify data must verify the user's role server-side and reject requests from viewers.

This is a **critical security requirement** - UI-only restrictions are not sufficient.

## Current State

- API routes check for authentication (valid session)
- API routes do NOT check for authorization (user role)
- Any authenticated user can call any API endpoint

## Required Implementation

### 1. Authorization Helper

Create a helper function to check if the current user can modify data:

**Location:** `src/lib/auth.ts`

```typescript
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession()

  if (!session) {
    throw new UnauthorizedError('Not authenticated')
  }

  if (session.role !== 'admin') {
    throw new ForbiddenError('Admin access required')
  }

  return session
}
```

### 2. Error Types

Define custom error types for consistent error handling:

| Error Type | HTTP Status | When Used |
|------------|-------------|-----------|
| `UnauthorizedError` | 401 | Not logged in |
| `ForbiddenError` | 403 | Logged in but insufficient permissions |

### 3. API Response Format

**Unauthorized (401):**
```json
{
  "error": "Not authenticated",
  "code": "UNAUTHORIZED"
}
```

**Forbidden (403):**
```json
{
  "error": "Admin access required",
  "code": "FORBIDDEN"
}
```

### 4. Routes Requiring Admin Protection

#### Properties API

| Route | Method | Current | Required |
|-------|--------|---------|----------|
| `GET /api/properties` | GET | Open | No change (read allowed) |
| `GET /api/properties/[id]` | GET | Open | No change (read allowed) |
| `POST /api/properties` | POST | Auth only | **Admin only** |
| `PUT /api/properties/[id]` | PUT | Auth only | **Admin only** |
| `DELETE /api/properties/[id]` | DELETE | Auth only | **Admin only** |

#### Leads API

| Route | Method | Current | Required |
|-------|--------|---------|----------|
| `GET /api/leads` | GET | Auth only | No change (viewer can read) |
| `GET /api/leads/[id]` | GET | Auth only | No change (viewer can read) |
| `POST /api/leads` | POST | Open (public form) | No change (public) |
| `PUT /api/leads/[id]` | PUT | Auth only | **Admin only** |
| `DELETE /api/leads/[id]` | DELETE | Auth only | **Admin only** |

#### Reminders API

| Route | Method | Current | Required |
|-------|--------|---------|----------|
| `GET /api/reminders` | GET | Auth only | No change (viewer can read) |
| `POST /api/reminders` | POST | Auth only | **Admin only** |
| `DELETE /api/reminders/[id]` | DELETE | Auth only | **Admin only** |

#### Services/Gallery API

| Route | Method | Current | Required |
|-------|--------|---------|----------|
| `GET /api/services/*` | GET | Open | No change (read allowed) |
| `POST /api/services/gallery` | POST | Auth only | **Admin only** |
| `PUT /api/services/gallery/[id]` | PUT | Auth only | **Admin only** |
| `DELETE /api/services/gallery/[id]` | DELETE | Auth only | **Admin only** |

#### Upload API

| Route | Method | Current | Required |
|-------|--------|---------|----------|
| `POST /api/upload` | POST | Auth only | **Admin only** |
| `DELETE /api/upload` | DELETE | Auth only | **Admin only** |

### 5. Implementation Pattern

Each protected route should follow this pattern:

```typescript
import { requireAdmin } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // This will throw if not admin
    await requireAdmin()

    // ... rest of the handler

  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: error.message, code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json(
        { error: error.message, code: 'FORBIDDEN' },
        { status: 403 }
      )
    }
    // Handle other errors...
  }
}
```

### 6. Middleware Consideration

**Option A: Per-route protection (Recommended)**
- Each route explicitly calls `requireAdmin()`
- More explicit, easier to audit
- Can have mixed read/write in same file

**Option B: Middleware-based protection**
- Define patterns in middleware for admin-only routes
- Centralized but less flexible
- Harder to handle mixed read/write

**Recommendation:** Use per-route protection (Option A)

## Acceptance Criteria

### Helper Functions
- [ ] `requireAdmin()` function exists in auth library
- [ ] Function throws `UnauthorizedError` if not authenticated
- [ ] Function throws `ForbiddenError` if authenticated but not admin
- [ ] Function returns session payload if admin

### Properties API
- [ ] `POST /api/properties` returns 403 for viewer
- [ ] `PUT /api/properties/[id]` returns 403 for viewer
- [ ] `DELETE /api/properties/[id]` returns 403 for viewer
- [ ] All above work normally for admin

### Leads API
- [ ] `PUT /api/leads/[id]` returns 403 for viewer
- [ ] `DELETE /api/leads/[id]` returns 403 for viewer
- [ ] `GET /api/leads` works for viewer (read-only)

### Reminders API
- [ ] `POST /api/reminders` returns 403 for viewer
- [ ] `DELETE /api/reminders/[id]` returns 403 for viewer

### Gallery/Upload API
- [ ] All POST/PUT/DELETE gallery routes return 403 for viewer
- [ ] Upload routes return 403 for viewer

### Error Responses
- [ ] 401 returned when not authenticated
- [ ] 403 returned when authenticated but not admin
- [ ] Error response includes `code` field for programmatic handling
- [ ] Error message is user-friendly

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/auth.ts` | Add `requireAdmin()`, error classes |
| `src/app/api/properties/route.ts` | Protect POST |
| `src/app/api/properties/[id]/route.ts` | Protect PUT, DELETE |
| `src/app/api/leads/[id]/route.ts` | Protect PUT, DELETE |
| `src/app/api/reminders/route.ts` | Protect POST |
| `src/app/api/reminders/[id]/route.ts` | Protect DELETE |
| `src/app/api/upload/route.ts` | Protect POST, DELETE |
| Gallery-related API routes | Protect mutations |

## Out of Scope

- Rate limiting per role
- Audit logging of forbidden attempts
- Granular permissions beyond admin/viewer
- IP-based restrictions

## Dependencies

- **Spec 1**: Session must include `role` field
- Existing authentication middleware must remain in place

## Security Considerations

1. **Defense in Depth**: UI disables buttons AND API rejects requests
2. **Fail Closed**: If role check fails, deny access
3. **Consistent Responses**: Don't leak information about why access was denied beyond role
4. **Session Validation**: Always re-verify session, don't trust client-provided role

## Testing Scenarios

| Scenario | Method | Expected |
|----------|--------|----------|
| Admin creates property | POST /api/properties | 200 OK |
| Viewer creates property | POST /api/properties | 403 Forbidden |
| Admin deletes lead | DELETE /api/leads/[id] | 200 OK |
| Viewer deletes lead | DELETE /api/leads/[id] | 403 Forbidden |
| Viewer reads leads | GET /api/leads | 200 OK |
| Unauthenticated creates property | POST /api/properties | 401 Unauthorized |
| Admin with expired session | POST /api/properties | 401 Unauthorized |
