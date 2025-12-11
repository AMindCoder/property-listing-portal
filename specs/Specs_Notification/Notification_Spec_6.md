# Spec 6: Feature Flag for Notification Service

## Overview

Define a feature flag mechanism to enable/disable the entire notification service. This allows administrators to turn off reminder functionality without deploying code changes, useful for environments where WhatsApp is not configured or when the feature needs to be temporarily disabled.

---

## Goals

1. Provide a simple environment variable to enable/disable notification features
2. Hide UI elements when feature is disabled
3. Return appropriate responses from API endpoints when disabled
4. Prevent cron job from processing when disabled
5. Zero code changes required to toggle feature on/off

---

## Functional Requirements

### FR-1: Environment Variable Configuration

A single environment variable controls the feature state.

**Environment Variable:**

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NOTIFICATIONS_ENABLED` | string | `"false"` | Set to `"true"` to enable notification features |

**Behavior:**

| Value | Result |
|-------|--------|
| `"true"` | Feature fully enabled |
| `"false"` (or not set) | Feature disabled |
| Any other value | Treated as disabled |

---

### FR-2: API Endpoint Behavior When Disabled

All reminder API endpoints must check the feature flag and respond accordingly.

**POST /api/reminders (Create Reminder):**

| Flag State | Behavior |
|------------|----------|
| Enabled | Normal operation |
| Disabled | Return 503 with message |

**Response when disabled (503):**

```json
{
  "success": false,
  "error": "Notification feature is currently disabled"
}
```

**GET /api/reminders (Get Reminder):**

| Flag State | Behavior |
|------------|----------|
| Enabled | Normal operation |
| Disabled | Return 503 with message |

**DELETE /api/reminders/[id] (Cancel Reminder):**

| Flag State | Behavior |
|------------|----------|
| Enabled | Normal operation |
| Disabled | Return 503 with message |

---

### FR-3: Cron Job Behavior When Disabled

The cron endpoint must check the feature flag before processing.

**GET /api/cron/send-reminders:**

| Flag State | Behavior |
|------------|----------|
| Enabled | Process reminders normally |
| Disabled | Return 200 with skipped message, no processing |

**Response when disabled (200):**

```json
{
  "success": true,
  "message": "Notification feature is disabled, skipping",
  "timestamp": "2025-12-11T04:00:00.000Z"
}
```

**Note:** Return 200 (not error) to prevent Vercel from marking cron job as failed.

---

### FR-4: Leads API Response

The leads API must indicate feature status for UI consumption.

**GET /api/leads:**

Include feature flag status in response or as header.

**Option A - Response Header:**

```
X-Notifications-Enabled: true
```

**Option B - Response Body (Recommended):**

```json
{
  "leads": [...],
  "features": {
    "notifications": true
  }
}
```

---

### FR-5: UI Behavior When Disabled

The Admin Leads page must hide reminder-related UI elements when disabled.

| Element | Behavior When Disabled |
|---------|----------------------|
| Reminder Button | Hidden (not rendered) |
| Reminder Indicator | Hidden |
| Reminder Dropdown | N/A (button hidden) |

**Implementation:**

- Fetch feature flag status from leads API response
- Conditionally render reminder components based on flag
- No error states needed - simply don't show the feature

---

### FR-6: Feature Flag Utility

Create a shared utility function for checking feature state.

**Function:**

```typescript
function isNotificationsEnabled(): boolean {
  return process.env.NOTIFICATIONS_ENABLED === 'true';
}
```

**Location:** `src/lib/feature-flags.ts`

---

## Non-Functional Requirements

### NFR-1: Performance

- Feature flag check must be synchronous (environment variable read)
- No database queries or external API calls for flag check
- Negligible performance impact

### NFR-2: Security

- Feature flag cannot be modified via API
- Only server-side code can read the flag
- Client receives only the boolean status, not the raw env var

### NFR-3: Consistency

- All endpoints must use the same utility function
- Flag state is consistent within a request
- No caching issues (env vars are stable per deployment)

---

## Out of Scope

- Admin UI to toggle the feature flag
- Per-user or per-lead feature flags
- Gradual rollout / percentage-based flags
- Feature flag service integration (LaunchDarkly, etc.)
- Database-stored feature flags

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| Environment Variables | Flag storage |
| All Reminder APIs (Spec 2) | Check flag before operation |
| Cron Endpoint (Spec 4) | Check flag before processing |
| Admin UI (Spec 5) | Hide UI when disabled |
| Leads API | Communicate flag status to client |

---

## Validation Criteria (P0)

### VC-1: Feature Flag Reading

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-1.1 | `NOTIFICATIONS_ENABLED=true` | `isNotificationsEnabled()` returns `true` |
| VC-1.2 | `NOTIFICATIONS_ENABLED=false` | `isNotificationsEnabled()` returns `false` |
| VC-1.3 | Variable not set | `isNotificationsEnabled()` returns `false` |
| VC-1.4 | `NOTIFICATIONS_ENABLED=TRUE` (uppercase) | `isNotificationsEnabled()` returns `false` (case-sensitive) |

### VC-2: API Endpoints When Disabled

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-2.1 | POST /api/reminders (disabled) | 503, "Notification feature is currently disabled" |
| VC-2.2 | GET /api/reminders (disabled) | 503, "Notification feature is currently disabled" |
| VC-2.3 | DELETE /api/reminders/[id] (disabled) | 503, "Notification feature is currently disabled" |

### VC-3: API Endpoints When Enabled

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-3.1 | POST /api/reminders (enabled) | Normal 200 response |
| VC-3.2 | GET /api/reminders (enabled) | Normal 200 response |
| VC-3.3 | DELETE /api/reminders/[id] (enabled) | Normal 200 response |

### VC-4: Cron Job Behavior

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-4.1 | Cron runs (disabled) | 200, "Notification feature is disabled, skipping" |
| VC-4.2 | Cron runs (enabled) | Normal processing |

### VC-5: Leads API Response

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-5.1 | GET /api/leads (disabled) | Response includes `features.notifications: false` |
| VC-5.2 | GET /api/leads (enabled) | Response includes `features.notifications: true` |

### VC-6: UI Behavior

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-6.1 | Load leads page (disabled) | Reminder buttons not visible |
| VC-6.2 | Load leads page (enabled) | Reminder buttons visible |
| VC-6.3 | Lead with reminder (disabled) | No indicator shown |
| VC-6.4 | Lead with reminder (enabled) | Indicator shown normally |

### VC-7: End-to-End

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-7.1 | Toggle flag off | All reminder features disappear |
| VC-7.2 | Toggle flag on | All reminder features appear |
| VC-7.3 | Existing reminders (disabled) | Data preserved, just not visible/processed |

---

## Implementation Notes

### Environment Variable Setup

**Local Development (.env):**

```env
# Set to "true" to enable notification features
NOTIFICATIONS_ENABLED=true
```

**Vercel Production:**

Add `NOTIFICATIONS_ENABLED=true` to project environment variables when ready to enable.

### Migration Path

1. Deploy with `NOTIFICATIONS_ENABLED=false` (default)
2. Configure WhatsApp credentials
3. Test in staging environment
4. Set `NOTIFICATIONS_ENABLED=true` in production
5. Monitor for issues
6. Can quickly disable by changing env var (no redeploy needed for Vercel)

---

## Files to Create/Modify

### New Files
- `src/lib/feature-flags.ts` - Feature flag utility

### Modified Files
- `src/app/api/reminders/route.ts` - Add flag check
- `src/app/api/reminders/[id]/route.ts` - Add flag check
- `src/app/api/cron/send-reminders/route.ts` - Add flag check
- `src/app/api/leads/route.ts` - Include flag in response
- `src/app/admin/leads/page.tsx` - Conditionally render reminder UI
