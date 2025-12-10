# Spec 2: Reminder Management API

## Overview

Define the REST API endpoints for creating, retrieving, and deleting lead follow-up reminders. This spec covers request/response formats, validation rules, and error handling.

---

## Goals

1. Allow administrators to schedule reminders for leads
2. Support preset-based scheduling (no custom datetime for MVP)
3. Enable cancellation of scheduled reminders
4. Provide clear error messages for invalid operations

---

## Functional Requirements

### FR-1: Create Reminder Endpoint

**Endpoint:** `POST /api/reminders`

Creates or replaces a reminder for a lead. If a reminder already exists for the lead, it is replaced.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `leadId` | string (UUID) | Yes | ID of the lead to set reminder for |
| `preset` | string (enum) | Yes | Reminder timing preset |

**Supported Presets:**

| Preset Value | Scheduled Time |
|--------------|----------------|
| `tomorrow_morning` | Next day 9:30 AM IST |
| `tomorrow_afternoon` | Next day 3:30 PM IST |
| `in_2_days` | 2 days later, 9:30 AM IST |
| `in_3_days` | 3 days later, 9:30 AM IST |
| `in_1_week` | 7 days later, 9:30 AM IST |

**Success Response (200):**

```json
{
  "success": true,
  "reminder": {
    "id": "uuid-string",
    "leadId": "uuid-string",
    "scheduledAt": "2025-12-11T04:00:00.000Z",
    "sent": false,
    "createdAt": "2025-12-10T10:00:00.000Z"
  },
  "scheduledFor": "Tomorrow Morning (9:30 AM)"
}
```

**Error Responses:**

| Status | Condition | Response |
|--------|-----------|----------|
| 400 | Missing `leadId` | `{ "success": false, "error": "leadId is required" }` |
| 400 | Missing `preset` | `{ "success": false, "error": "preset is required" }` |
| 400 | Invalid `preset` | `{ "success": false, "error": "Invalid preset value" }` |
| 404 | Lead not found | `{ "success": false, "error": "Lead not found" }` |
| 500 | Server error | `{ "success": false, "error": "Failed to create reminder" }` |

---

### FR-2: Delete Reminder Endpoint

**Endpoint:** `DELETE /api/reminders/[id]`

Cancels a scheduled reminder by ID.

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Reminder ID to delete |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Reminder cancelled"
}
```

**Error Responses:**

| Status | Condition | Response |
|--------|-----------|----------|
| 404 | Reminder not found | `{ "success": false, "error": "Reminder not found" }` |
| 500 | Server error | `{ "success": false, "error": "Failed to delete reminder" }` |

---

### FR-3: Get Reminder by Lead Endpoint

**Endpoint:** `GET /api/reminders?leadId={leadId}`

Retrieves the active reminder for a specific lead (if exists).

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `leadId` | string (UUID) | Yes | Lead ID to check |

**Success Response (200) - Reminder Exists:**

```json
{
  "success": true,
  "reminder": {
    "id": "uuid-string",
    "leadId": "uuid-string",
    "scheduledAt": "2025-12-11T04:00:00.000Z",
    "sent": false,
    "createdAt": "2025-12-10T10:00:00.000Z"
  }
}
```

**Success Response (200) - No Reminder:**

```json
{
  "success": true,
  "reminder": null
}
```

---

## Non-Functional Requirements

### NFR-1: Input Validation

- Validate UUID format for `leadId` and reminder `id`
- Validate `preset` against allowed enum values
- Return descriptive error messages

### NFR-2: Idempotency

- Creating a reminder for a lead with existing reminder replaces it (upsert behavior)
- Deleting non-existent reminder returns 404 (not error)

### NFR-3: Logging

- Log all reminder create/delete operations
- Include `leadId`, `preset`, and resulting `scheduledAt` in logs

---

## Out of Scope

- Bulk reminder operations
- Custom datetime input (only presets)
- Reminder update/edit (delete and recreate instead)
- List all reminders endpoint (P2 feature)

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| Reminder Model (Spec 1) | Database operations |
| Lead Model | Validate lead exists |

---

## Validation Criteria (P0)

### VC-1: Create Reminder

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| VC-1.1 | Valid request | POST with valid `leadId` and `preset` | 200, reminder created |
| VC-1.2 | Missing leadId | POST without `leadId` | 400, "leadId is required" |
| VC-1.3 | Missing preset | POST without `preset` | 400, "preset is required" |
| VC-1.4 | Invalid preset | POST with `preset: "invalid"` | 400, "Invalid preset value" |
| VC-1.5 | Non-existent lead | POST with fake `leadId` | 404, "Lead not found" |
| VC-1.6 | Replace existing | POST for lead with reminder | 200, old reminder replaced |

### VC-2: Delete Reminder

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| VC-2.1 | Valid delete | DELETE existing reminder | 200, "Reminder cancelled" |
| VC-2.2 | Non-existent | DELETE with fake ID | 404, "Reminder not found" |

### VC-3: Get Reminder

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| VC-3.1 | Lead has reminder | GET with `leadId` | 200, reminder object returned |
| VC-3.2 | Lead has no reminder | GET with `leadId` | 200, `reminder: null` |
| VC-3.3 | Invalid leadId | GET with fake `leadId` | 200, `reminder: null` |

### VC-4: Preset Calculation

| ID | Preset | Current Time | Expected scheduledAt |
|----|--------|--------------|----------------------|
| VC-4.1 | `tomorrow_morning` | Dec 10, 2 PM | Dec 11, 9:30 AM IST |
| VC-4.2 | `tomorrow_afternoon` | Dec 10, 2 PM | Dec 11, 3:30 PM IST |
| VC-4.3 | `in_2_days` | Dec 10, 2 PM | Dec 12, 9:30 AM IST |
| VC-4.4 | `in_3_days` | Dec 10, 2 PM | Dec 13, 9:30 AM IST |
| VC-4.5 | `in_1_week` | Dec 10, 2 PM | Dec 17, 9:30 AM IST |
