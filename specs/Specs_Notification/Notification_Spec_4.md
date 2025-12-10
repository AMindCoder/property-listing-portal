# Spec 4: Cron Job Scheduler

## Overview

Define the scheduled job system for processing due reminders and triggering WhatsApp notifications. This spec covers Vercel Cron configuration, the cron endpoint, and processing logic.

---

## Goals

1. Automatically process due reminders at scheduled intervals
2. Use Vercel Cron free tier (twice daily execution)
3. Securely trigger the processing endpoint
4. Handle failures without losing reminder data

---

## Technology Choice

| Aspect | Choice | Rationale |
|--------|--------|-----------|
| **Scheduler** | Vercel Cron | Built-in, no extra infrastructure |
| **Tier** | Free (Hobby) | 2 cron jobs, daily minimum frequency |
| **Frequency** | Twice daily | Maximum coverage within free tier |

---

## Functional Requirements

### FR-1: Cron Schedule Configuration

The system must configure two daily cron jobs to maximize reminder coverage.

**Vercel Cron Configuration (`vercel.json`):**

| Cron Job | Schedule (UTC) | Time (IST) | Purpose |
|----------|----------------|------------|---------|
| Morning | `0 4 * * *` | 9:30 AM | Process morning reminders |
| Afternoon | `0 10 * * *` | 3:30 PM | Process afternoon reminders |

**Configuration File:**

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 4 * * *"
    },
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 10 * * *"
    }
  ]
}
```

---

### FR-2: Cron Endpoint

**Endpoint:** `GET /api/cron/send-reminders`

Processes all due reminders and sends WhatsApp notifications.

**Security:**
- Endpoint must verify Vercel cron authorization header
- Reject unauthorized requests with 401

**Authorization Header:**

```
Authorization: Bearer {CRON_SECRET}
```

**Environment Variable:**

| Variable | Description |
|----------|-------------|
| `CRON_SECRET` | Secret token to authenticate cron requests |

---

### FR-3: Processing Logic

The cron endpoint must execute the following steps:

```
1. Verify authorization header
2. Query reminders: scheduledAt <= NOW() AND sent = false
3. For each due reminder:
   a. Fetch lead with property details
   b. Call WhatsApp service to send notification
   c. If success: Mark reminder sent = true
   d. If failure: Log error, continue to next (don't mark sent)
4. Return summary response
```

**Query Criteria:**

| Condition | Purpose |
|-----------|---------|
| `scheduledAt <= NOW()` | Reminder is due |
| `sent = false` | Not yet processed |

---

### FR-4: Response Format

**Success Response (200):**

```json
{
  "success": true,
  "summary": {
    "processed": 5,
    "sent": 4,
    "failed": 1
  },
  "timestamp": "2025-12-11T04:00:00.000Z"
}
```

**Unauthorized Response (401):**

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**Error Response (500):**

```json
{
  "success": false,
  "error": "Failed to process reminders",
  "timestamp": "2025-12-11T04:00:00.000Z"
}
```

---

### FR-5: Failure Handling

| Scenario | Handling |
|----------|----------|
| WhatsApp send fails | Log error, skip marking as sent, continue |
| Lead not found | Log warning, mark reminder sent (orphaned) |
| Database error | Return 500, no reminders marked sent |
| Partial success | Return 200 with failure count |

**Key Principle:** Never mark a reminder as `sent` unless the WhatsApp message was successfully dispatched.

---

### FR-6: Logging

Log the following events:

| Event | Level | Details |
|-------|-------|---------|
| Cron job started | INFO | Timestamp, due reminders count |
| Processing reminder | DEBUG | Reminder ID, Lead ID |
| Notification sent | INFO | Reminder ID, WhatsApp message ID |
| Notification failed | ERROR | Reminder ID, error message |
| Cron job completed | INFO | Summary (processed, sent, failed) |

---

## Non-Functional Requirements

### NFR-1: Security

- Endpoint only accessible via Vercel Cron with valid secret
- No public access to trigger endpoint
- CRON_SECRET must be strong random string

### NFR-2: Reliability

- Failed notifications do not block other reminders
- Reminders remain in queue until successfully sent
- Duplicate sends prevented by `sent` flag check

### NFR-3: Timeout

- Cron endpoint must complete within Vercel function timeout (10s default, 60s max)
- Process reminders sequentially to manage time
- If many reminders pending, process what's possible

### NFR-4: Idempotency

- Multiple cron triggers in short time won't send duplicates
- Check `sent = false` before processing each reminder

---

## Out of Scope

- Retry queue for failed notifications
- Manual cron trigger from admin UI
- Real-time (minute-level) scheduling
- Batch notification (multiple leads in one message)
- Notification throttling/rate limiting

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| Reminder Model (Spec 1) | Query and update reminders |
| WhatsApp Service (Spec 3) | Send notifications |
| Vercel Platform | Cron job execution |

---

## Vercel Free Tier Constraints

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| 2 cron jobs max | Limited to 2 schedules | Use both slots for morning/afternoon |
| Daily minimum | No hourly execution | Adjust reminder presets to daily windows |
| 10s function timeout | Limited processing time | Process reminders sequentially |

---

## Validation Criteria (P0)

### VC-1: Cron Configuration

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-1.1 | Deploy with vercel.json | Cron jobs appear in Vercel dashboard |
| VC-1.2 | Morning schedule | Triggers at 9:30 AM IST daily |
| VC-1.3 | Afternoon schedule | Triggers at 3:30 PM IST daily |

### VC-2: Endpoint Security

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-2.1 | Request with valid CRON_SECRET | 200, processes reminders |
| VC-2.2 | Request without header | 401 Unauthorized |
| VC-2.3 | Request with wrong secret | 401 Unauthorized |
| VC-2.4 | Direct browser access | 401 Unauthorized |

### VC-3: Reminder Processing

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-3.1 | No due reminders | 200, processed: 0 |
| VC-3.2 | 3 due reminders | All 3 processed, notifications sent |
| VC-3.3 | Already sent reminder | Skipped (not reprocessed) |
| VC-3.4 | Future reminder | Skipped (not due yet) |

### VC-4: Failure Scenarios

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-4.1 | WhatsApp fails for 1 of 3 | 2 marked sent, 1 remains pending |
| VC-4.2 | Lead deleted | Reminder handled gracefully |
| VC-4.3 | Database connection error | 500 error, no reminders affected |

### VC-5: Response Accuracy

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-5.1 | All succeed | processed = sent, failed = 0 |
| VC-5.2 | Partial failure | processed = sent + failed |
| VC-5.3 | Response contains timestamp | ISO 8601 format timestamp |

### VC-6: End-to-End

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-6.1 | Set reminder "tomorrow morning" | Next day 9:30 AM cron sends WhatsApp |
| VC-6.2 | Cron runs with 5 pending | 5 WhatsApp messages received |
