# Spec 5: Admin UI for Reminders

## Overview

Define the user interface for setting and managing lead follow-up reminders on the Leads Management page. This spec covers UI components, interactions, and visual feedback.

---

## Goals

1. Allow admins to set reminders directly from the Leads table
2. Provide clear visual indication of pending reminders
3. Enable cancellation of scheduled reminders
4. Keep the interface simple and non-intrusive

---

## Functional Requirements

### FR-1: Reminder Action Button

Each lead row in the Leads table must have a reminder action.

**Button Placement:**

| Location | Description |
|----------|-------------|
| Actions Column | Alongside existing delete button |
| Icon | Clock/alarm icon (⏰ or similar) |

**Button States:**

| State | Appearance | Behavior |
|-------|------------|----------|
| No reminder | Outline/ghost icon | Opens preset dropdown |
| Has reminder | Filled/highlighted icon | Shows cancel option |

---

### FR-2: Reminder Preset Dropdown

Clicking the reminder button opens a dropdown with scheduling options.

**Dropdown Options:**

| Option Label | Preset Value | Description |
|--------------|--------------|-------------|
| Tomorrow Morning | `tomorrow_morning` | Next day 9:30 AM |
| Tomorrow Afternoon | `tomorrow_afternoon` | Next day 3:30 PM |
| In 2 Days | `in_2_days` | 2 days, morning |
| In 3 Days | `in_3_days` | 3 days, morning |
| In 1 Week | `in_1_week` | 7 days, morning |

**Dropdown Behavior:**
- Opens on button click
- Closes when option selected or clicked outside
- Selecting option immediately creates reminder

---

### FR-3: Reminder Indicator

Leads with pending reminders must show a visual indicator.

**Indicator Requirements:**

| Element | Description |
|---------|-------------|
| Icon State | Reminder button highlighted/filled |
| Tooltip | Shows scheduled date/time on hover |
| Badge (optional) | Small dot or badge on icon |

**Tooltip Content:**

```
Reminder set for:
Dec 11, 2025 at 9:30 AM
```

---

### FR-4: Cancel Reminder

Users must be able to cancel a scheduled reminder.

**Cancellation Flow:**

1. Click reminder button on lead with existing reminder
2. Dropdown shows "Cancel Reminder" option (highlighted/red)
3. Clicking "Cancel Reminder" deletes the reminder
4. Indicator removed from lead row

**Confirmation:** No confirmation dialog needed (simple undo by re-creating)

---

### FR-5: Success Feedback

The UI must provide feedback when reminder is set or cancelled.

| Action | Feedback |
|--------|----------|
| Reminder created | Toast: "Reminder set for [date/time]" |
| Reminder cancelled | Toast: "Reminder cancelled" |
| Error | Toast: "Failed to set reminder" (red) |

**Toast Duration:** 3 seconds, auto-dismiss

---

### FR-6: Loading States

The UI must show loading states during API calls.

| State | Indicator |
|-------|-----------|
| Creating reminder | Button shows spinner, disabled |
| Cancelling reminder | Button shows spinner, disabled |
| Fetching reminders | Initial page load spinner |

---

### FR-7: Initial Data Loading

On page load, fetch reminder status for all displayed leads.

**Options:**

| Approach | Description |
|----------|-------------|
| Option A | Single API call to get all reminders, match by leadId |
| Option B | Include reminder data in leads API response |

**Recommendation:** Option B - extend `/api/leads` to include reminder info.

**Extended Lead Response:**

```json
{
  "id": "lead-uuid",
  "name": "John Doe",
  "reminder": {
    "id": "reminder-uuid",
    "scheduledAt": "2025-12-11T04:00:00.000Z"
  }
}
```

---

## UI Component Structure

```
LeadsPage
├── LeadsTable
│   └── LeadRow
│       ├── ... (existing columns)
│       └── ActionsColumn
│           ├── ReminderButton
│           │   ├── Icon (with indicator state)
│           │   └── ReminderDropdown
│           │       ├── PresetOption (x5)
│           │       └── CancelOption (if has reminder)
│           └── DeleteButton
└── ToastContainer
```

---

## Non-Functional Requirements

### NFR-1: Responsiveness

- Dropdown must work on mobile (touch-friendly)
- Consider bottom sheet on mobile instead of dropdown

### NFR-2: Accessibility

- Keyboard navigation for dropdown
- ARIA labels for screen readers
- Focus management when dropdown opens/closes

### NFR-3: Performance

- Reminder status fetched with leads (single request)
- Optimistic UI updates (show success before API confirms)

---

## Out of Scope

- Bulk reminder setting (select multiple leads)
- Reminder list/calendar view
- Edit reminder (only create/cancel)
- Custom date/time picker
- Reminder notes/custom messages

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| Reminder API (Spec 2) | Create, delete, fetch reminders |
| Leads API | Include reminder data in response |
| Existing Leads Page | Integration point |

---

## Validation Criteria (P0)

### VC-1: Reminder Button Display

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-1.1 | Lead without reminder | Shows outline clock icon |
| VC-1.2 | Lead with reminder | Shows filled/highlighted clock icon |
| VC-1.3 | Hover on button | Cursor changes to pointer |

### VC-2: Dropdown Interaction

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-2.1 | Click button (no reminder) | Dropdown opens with 5 presets |
| VC-2.2 | Click button (has reminder) | Dropdown shows presets + cancel option |
| VC-2.3 | Click outside dropdown | Dropdown closes |
| VC-2.4 | Press Escape | Dropdown closes |

### VC-3: Set Reminder

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-3.1 | Select "Tomorrow Morning" | API called, toast shows, icon updates |
| VC-3.2 | API returns error | Error toast shown, icon unchanged |
| VC-3.3 | Set on lead with existing | Old reminder replaced with new |

### VC-4: Cancel Reminder

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-4.1 | Click "Cancel Reminder" | API called, toast shows, icon updates |
| VC-4.2 | Cancel API fails | Error toast, reminder unchanged |

### VC-5: Tooltip/Indicator

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-5.1 | Hover on filled icon | Tooltip shows scheduled date/time |
| VC-5.2 | Tooltip format | "Dec 11, 2025 at 9:30 AM" |

### VC-6: Loading States

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-6.1 | While creating reminder | Button shows spinner, disabled |
| VC-6.2 | While cancelling | Button shows spinner, disabled |
| VC-6.3 | Page initial load | Reminder states load with leads |

### VC-7: Mobile/Responsive

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-7.1 | Mobile viewport | Dropdown accessible, touch-friendly |
| VC-7.2 | Small screen | Actions column visible or accessible |

---

## Design Mockup (ASCII)

**Leads Table Row:**

```
┌────────┬──────────┬─────────┬────────────────────────┐
│ Name   │ Phone    │ Status  │ Actions                │
├────────┼──────────┼─────────┼────────────────────────┤
│ John   │ 98765... │ NEW     │ [⏰] [🗑️]              │
│ Jane   │ 87654... │ CONTACT │ [⏰•] [🗑️]  ← has reminder
└────────┴──────────┴─────────┴────────────────────────┘
```

**Reminder Dropdown (no existing reminder):**

```
┌─────────────────────────┐
│ Set Follow-up Reminder  │
├─────────────────────────┤
│ Tomorrow Morning        │
│ Tomorrow Afternoon      │
│ In 2 Days              │
│ In 3 Days              │
│ In 1 Week              │
└─────────────────────────┘
```

**Reminder Dropdown (has existing reminder):**

```
┌─────────────────────────┐
│ Update Reminder         │
├─────────────────────────┤
│ Tomorrow Morning        │
│ Tomorrow Afternoon      │
│ In 2 Days              │
│ In 3 Days              │
│ In 1 Week              │
├─────────────────────────┤
│ ✕ Cancel Reminder       │  ← red/danger style
└─────────────────────────┘
```

**Toast Notification:**

```
┌──────────────────────────────────┐
│ ✓ Reminder set for Dec 11, 9:30 AM │
└──────────────────────────────────┘
```
