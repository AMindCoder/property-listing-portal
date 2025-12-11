# Notification Service Implementation Progress

## Overview
Implementation of lead follow-up reminder system with WhatsApp notifications based on specs in `specs/Specs_Notification/`.

## Specs Summary
| Spec | Title | Description |
|------|-------|-------------|
| Spec 1 | Reminder Data Model | Database schema for storing reminders |
| Spec 2 | Reminder Management API | REST endpoints for create/get/delete reminders |
| Spec 3 | WhatsApp Notification Service | Integration with WhatsApp Business Cloud API |
| Spec 4 | Cron Job Scheduler | Vercel Cron for processing due reminders |
| Spec 5 | Admin UI for Reminders | UI components for managing reminders |
| Spec 6 | Feature Flag | Enable/disable notification feature via env var |

---

## Implementation Status

### Spec 1: Reminder Data Model & Storage
- [x] Add Reminder model to Prisma schema
- [x] Run database migration
- [x] Update Lead model with reverse relation

**Status:** ✅ Complete

**Files:**
- `prisma/schema.prisma` - Added Reminder model with fields: id, leadId (unique), scheduledAt, sent, createdAt
- Index on `[scheduledAt, sent]` for efficient cron queries
- Cascade delete when parent Lead is deleted

---

### Spec 2: Reminder Management API
- [x] POST /api/reminders - Create/replace reminder
- [x] GET /api/reminders?leadId={id} - Get reminder by lead
- [x] DELETE /api/reminders/[id] - Cancel reminder
- [x] Implement preset time calculations (IST timezone)

**Status:** ✅ Complete

**Files:**
- `src/app/api/reminders/route.ts` - POST and GET endpoints
- `src/app/api/reminders/[id]/route.ts` - DELETE endpoint
- `src/lib/reminder-presets.ts` - Preset calculation utilities

**Supported Presets:**
| Preset | Scheduled Time |
|--------|---------------|
| `tomorrow_morning` | Next day 9:30 AM IST |
| `tomorrow_afternoon` | Next day 3:30 PM IST |
| `in_2_days` | 2 days later, 9:30 AM IST |
| `in_3_days` | 3 days later, 9:30 AM IST |
| `in_1_week` | 7 days later, 9:30 AM IST |

---

### Spec 3: WhatsApp Notification Service
- [x] Create WhatsApp service module
- [x] Implement sendLeadReminder function
- [x] Add environment variable validation
- [x] Implement error handling

**Status:** ✅ Complete

**Files:**
- `src/lib/whatsapp.ts` - WhatsApp Business Cloud API integration

**Required Environment Variables:**
```env
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
OWNER_WHATSAPP_NUMBER=919876543210
```

**Message Template:** `lead_followup_reminder` (must be created in Meta Business Manager)

---

### Spec 4: Cron Job Scheduler
- [x] Create /api/cron/send-reminders endpoint
- [x] Implement authorization check (CRON_SECRET or Vercel cron header)
- [x] Process due reminders and send notifications
- [x] Create vercel.json with cron configuration

**Status:** ✅ Complete

**Files:**
- `src/app/api/cron/send-reminders/route.ts` - Cron endpoint
- `vercel.json` - Cron schedule configuration

**Cron Schedule:**
| Time (UTC) | Time (IST) | Purpose |
|------------|------------|---------|
| `0 4 * * *` | 9:30 AM | Morning reminders |
| `0 10 * * *` | 3:30 PM | Afternoon reminders |

**Required Environment Variable:**
```env
CRON_SECRET=your_secure_random_string
```

---

### Spec 5: Admin UI for Reminders
- [x] Add reminder button to leads table
- [x] Create reminder preset dropdown
- [x] Implement reminder indicator (tooltip)
- [x] Add cancel reminder functionality
- [x] Implement toast notifications
- [x] Update leads API to include reminder data

**Status:** ✅ Complete

**Files:**
- `src/app/admin/leads/page.tsx` - Updated with ReminderButton component and Toast notifications
- `src/app/api/leads/route.ts` - Extended to include reminder data

**UI Features:**
- Clock icon button in Actions column (outline when no reminder, filled amber when reminder set)
- Dropdown with 5 preset options
- Cancel reminder option for leads with existing reminders
- Tooltip showing scheduled date/time on hover
- Toast notifications for success/error feedback
- Loading spinner during API calls

---

### Spec 6: Feature Flag for Notification Service
- [x] Create feature-flags utility module
- [x] Add flag check to POST /api/reminders (returns 503 when disabled)
- [x] Add flag check to GET /api/reminders (returns 503 when disabled)
- [x] Add flag check to DELETE /api/reminders/[id] (returns 503 when disabled)
- [x] Add flag check to cron endpoint (returns 200 with skip message when disabled)
- [x] Update leads API to include feature flags in response
- [x] Update leads page to conditionally render reminder UI

**Status:** ✅ Complete

**Files:**
- `src/lib/feature-flags.ts` - Feature flag utility functions
- `src/app/api/reminders/route.ts` - Added flag check
- `src/app/api/reminders/[id]/route.ts` - Added flag check
- `src/app/api/cron/send-reminders/route.ts` - Added flag check
- `src/app/api/leads/route.ts` - Returns `features.notifications` in response
- `src/app/admin/leads/page.tsx` - Conditionally renders ReminderButton based on flag

**Required Environment Variable:**
```env
# Set to "true" to enable notification features (default: disabled)
NOTIFICATIONS_ENABLED=true
```

**Behavior:**
| Flag Value | API Endpoints | Cron Job | UI |
|------------|---------------|----------|-----|
| `"true"` | Normal operation | Processes reminders | Shows reminder buttons |
| `"false"` or not set | Returns 503 | Skips with 200 | Hides reminder buttons |

---

## Environment Variables Required

Add these to your `.env` file and Vercel project settings:

```env
# Feature Flag (Spec 6) - Set to "true" to enable
NOTIFICATIONS_ENABLED=true

# WhatsApp Business API (Spec 3)
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
OWNER_WHATSAPP_NUMBER=919876543210

# Cron Job Security (Spec 4)
CRON_SECRET=your_secure_random_string
```

---

## Setup Prerequisites (WhatsApp)

1. Create Meta Business Account at business.facebook.com
2. Create Meta App with WhatsApp product enabled
3. Get Phone Number ID from WhatsApp API Setup
4. Generate Permanent Access Token (System User token)
5. Add recipient number as test recipient
6. Create & approve message template named `lead_followup_reminder`

**Template Body (5 variables):**
```
🔔 *Lead Follow-up Reminder*

👤 *Name:* {{1}}
📞 *Phone:* {{2}}
🏠 *Property:* {{3}}
💼 *Purpose:* {{4}}
📝 *Notes:* {{5}}

Please follow up with this lead today.
```

---

## Files Created/Modified

### New Files
- [x] `src/lib/reminder-presets.ts` - Preset calculation utilities
- [x] `src/lib/whatsapp.ts` - WhatsApp API integration
- [x] `src/lib/feature-flags.ts` - Feature flag utilities
- [x] `src/app/api/reminders/route.ts` - POST/GET reminders
- [x] `src/app/api/reminders/[id]/route.ts` - DELETE reminder
- [x] `src/app/api/cron/send-reminders/route.ts` - Cron endpoint
- [x] `vercel.json` - Cron configuration
- [x] `specs/Specs_Notification/Notification_Spec_6.md` - Feature flag spec

### Modified Files
- [x] `prisma/schema.prisma` - Added Reminder model
- [x] `src/app/api/leads/route.ts` - Include reminder data and feature flags
- [x] `src/app/api/leads/[id]/route.ts` - Use singleton prisma
- [x] `src/app/admin/leads/page.tsx` - Added reminder UI components with feature flag check

---

## Testing

### Manual Testing Steps

1. **Test Feature Flag Disabled (default):**
   - Ensure `NOTIFICATIONS_ENABLED` is not set or set to `"false"`
   - Go to Admin > Leads page
   - Verify reminder buttons are NOT visible
   - Try calling `/api/reminders` - should return 503

2. **Test Feature Flag Enabled:**
   - Set `NOTIFICATIONS_ENABLED=true` in `.env`
   - Restart the dev server
   - Go to Admin > Leads page
   - Verify reminder buttons ARE visible

3. **Test Reminder Creation:**
   - Click the clock icon on any lead
   - Select a preset from the dropdown
   - Verify toast notification appears
   - Verify icon changes to filled/amber state

4. **Test Reminder Cancellation:**
   - Click clock icon on lead with reminder
   - Click "Cancel Reminder"
   - Verify toast notification appears
   - Verify icon returns to outline state

5. **Test Cron Endpoint (disabled):**
   ```bash
   # With NOTIFICATIONS_ENABLED=false or not set
   curl -X GET http://localhost:3000/api/cron/send-reminders \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   # Should return: {"success":true,"message":"Notification feature is disabled, skipping",...}
   ```

6. **Test Cron Endpoint (enabled):**
   ```bash
   # With NOTIFICATIONS_ENABLED=true
   curl -X GET http://localhost:3000/api/cron/send-reminders \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   # Should process reminders normally
   ```

---

## Deployment Notes

1. Deploy with `NOTIFICATIONS_ENABLED=false` initially (default behavior)
2. Add all WhatsApp environment variables to Vercel project settings
3. Add `CRON_SECRET` to Vercel project settings
4. Create and approve WhatsApp message template
5. Test in staging environment
6. Set `NOTIFICATIONS_ENABLED=true` in Vercel when ready to enable
7. Verify cron jobs appear in Vercel dashboard (Settings > Cron Jobs)
8. Monitor logs for cron execution

**To quickly disable notifications:** Change `NOTIFICATIONS_ENABLED` to `false` in Vercel - no redeploy needed.

---

## Last Updated
Date: 2025-12-11
Status: ✅ All Specs Implemented (Specs 1-6)
