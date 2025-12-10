# Spec 1: Reminder Data Model & Storage

## Overview

Define the database schema for storing lead follow-up reminders. This spec covers the data structure, relationships, and constraints required to persist reminder information.

---

## Goals

1. Store reminder data linked to leads
2. Track reminder status (pending vs sent)
3. Support cascade deletion when parent lead is removed
4. Enable efficient querying of due reminders

---

## Functional Requirements

### FR-1: Reminder Entity

The system must store reminder records with the following structure:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | Primary Key, Auto-generated | Unique identifier |
| `leadId` | UUID | Foreign Key (Lead), Required, Unique | Associated lead (one reminder per lead) |
| `scheduledAt` | DateTime | Required | When notification should be sent |
| `sent` | Boolean | Default: false | Whether notification was dispatched |
| `createdAt` | DateTime | Auto-generated | Record creation timestamp |

### FR-2: Relationship Constraints

| Constraint | Description |
|------------|-------------|
| Lead Reference | Each reminder must reference a valid lead |
| One-to-One | Only one active reminder allowed per lead |
| Cascade Delete | Deleting a lead must delete its associated reminder |

### FR-3: Indexing Requirements

| Index | Fields | Purpose |
|-------|--------|---------|
| Primary | `id` | Unique record lookup |
| Foreign Key | `leadId` | Join with Lead table |
| Query Index | `scheduledAt`, `sent` | Efficient cron job queries |

---

## Non-Functional Requirements

### NFR-1: Data Integrity

- `leadId` must reference existing lead (referential integrity)
- `scheduledAt` must be a future datetime at creation time
- Unique constraint on `leadId` prevents duplicate reminders

### NFR-2: Query Performance

- Index on `(scheduledAt, sent)` for cron job query: `WHERE scheduledAt <= NOW() AND sent = false`

---

## Out of Scope

- Reminder history/audit log
- Multiple reminders per lead
- Recurring reminders
- Reminder notes/custom messages

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| Lead Model | Parent entity for reminders |
| Prisma ORM | Schema definition and migrations |

---

## Validation Criteria (P0)

### VC-1: Schema Creation

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-1.1 | Run database migration | Reminder table created with all fields |
| VC-1.2 | Verify foreign key | `leadId` references Lead table |
| VC-1.3 | Verify unique constraint | Cannot create two reminders for same lead |

### VC-2: Cascade Behavior

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-2.1 | Delete lead with reminder | Reminder automatically deleted |
| VC-2.2 | Delete lead without reminder | No error, lead deleted normally |

### VC-3: Default Values

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-3.1 | Create reminder without `sent` | Defaults to `false` |
| VC-3.2 | Create reminder without `createdAt` | Auto-populated with current timestamp |
| VC-3.3 | Create reminder without `id` | Auto-generated UUID |

---

## Schema Definition (Prisma)

```prisma
model Reminder {
  id          String   @id @default(uuid())
  leadId      String   @unique
  lead        Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  scheduledAt DateTime
  sent        Boolean  @default(false)
  createdAt   DateTime @default(now())

  @@index([scheduledAt, sent])
}
```

**Note:** Lead model requires update to include reverse relation:
```prisma
model Lead {
  // ... existing fields
  reminder    Reminder?
}
```
