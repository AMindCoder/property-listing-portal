# Spec 3: WhatsApp Notification Service

## Overview

Define the WhatsApp notification service for sending lead follow-up reminders to the application owner. This spec covers the integration with WhatsApp Business Cloud API (free tier), message formatting, and error handling.

---

## Goals

1. Send WhatsApp notifications using Meta's WhatsApp Business Cloud API
2. Use free tier (1000 messages/month)
3. Deliver lead information in a clear, actionable format
4. Handle API failures gracefully

---

## Technology Choice

| Aspect | Choice | Rationale |
|--------|--------|-----------|
| **Provider** | WhatsApp Business Cloud API | Free tier available, official Meta API |
| **Message Type** | Template Message | Required for business-initiated messages |
| **Authentication** | Bearer Token | Standard API authentication |

---

## Functional Requirements

### FR-1: Configuration

The service must use environment variables for all sensitive configuration.

**Required Environment Variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| `WHATSAPP_PHONE_NUMBER_ID` | Business phone number ID from Meta | `123456789012345` |
| `WHATSAPP_ACCESS_TOKEN` | Permanent access token | `EAAxxxxxxx...` |
| `OWNER_WHATSAPP_NUMBER` | Recipient phone (without +) | `919876543210` |

---

### FR-2: Message Template

A pre-approved message template must be created in Meta Business Manager.

**Template Specification:**

| Property | Value |
|----------|-------|
| Template Name | `lead_followup_reminder` |
| Category | Utility |
| Language | English (en) |

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

**Variable Mapping:**

| Variable | Source | Fallback |
|----------|--------|----------|
| `{{1}}` | `lead.name` | - (required) |
| `{{2}}` | `lead.phone` | - (required) |
| `{{3}}` | `lead.property.title + location` | "General Inquiry" |
| `{{4}}` | `lead.purpose` | - (required) |
| `{{5}}` | `lead.notes` | "No notes" |

---

### FR-3: Send Notification Function

The service must expose a function to send WhatsApp notifications.

**Function Signature:**

```typescript
interface LeadNotificationData {
  name: string;
  phone: string;
  property?: {
    title: string;
    location: string;
  };
  purpose: string;
  notes?: string;
}

interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

function sendLeadReminder(lead: LeadNotificationData): Promise<SendResult>
```

**Behavior:**
1. Validate all required fields are present
2. Format property string (or use fallback)
3. Call WhatsApp Cloud API with template message
4. Return success with message ID, or failure with error

---

### FR-4: API Integration

**WhatsApp Cloud API Endpoint:**

```
POST https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/messages
```

**Request Headers:**

```
Authorization: Bearer {ACCESS_TOKEN}
Content-Type: application/json
```

**Request Body:**

```json
{
  "messaging_product": "whatsapp",
  "to": "{RECIPIENT_NUMBER}",
  "type": "template",
  "template": {
    "name": "lead_followup_reminder",
    "language": {
      "code": "en"
    },
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "John Doe" },
          { "type": "text", "text": "+91 98765 43210" },
          { "type": "text", "text": "3BHK in Koramangala" },
          { "type": "text", "text": "Buy" },
          { "type": "text", "text": "Interested in quick closing" }
        ]
      }
    ]
  }
}
```

---

### FR-5: Error Handling

The service must handle API errors gracefully.

| Error Type | Handling |
|------------|----------|
| Network failure | Return error, allow retry |
| Invalid token (401) | Log error, return failure |
| Rate limited (429) | Log warning, return failure |
| Invalid recipient | Log error, return failure |
| Template not found | Log error, return failure |

**Error Response Format:**

```typescript
{
  success: false,
  error: "WhatsApp API error: Invalid access token"
}
```

---

## Non-Functional Requirements

### NFR-1: Security

- Access token must never be logged or exposed
- Token stored only in environment variables
- No client-side access to WhatsApp service

### NFR-2: Reliability

- Service failures must not throw unhandled exceptions
- All errors returned as structured response
- Timeout set to 30 seconds for API calls

### NFR-3: Logging

Log the following (without sensitive data):

| Event | Log Level | Data |
|-------|-----------|------|
| Send attempt | INFO | leadId, recipient (masked) |
| Send success | INFO | leadId, messageId |
| Send failure | ERROR | leadId, error message |

---

## Out of Scope

- Multiple recipient support
- Message delivery status tracking (webhooks)
- Rich media messages (images, documents)
- Interactive messages (buttons, lists)
- Message retry queue
- Alternative notification channels (SMS, Email)

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| Meta Business Account | WhatsApp API access |
| Approved Message Template | Required for business messages |
| Environment Variables | Configuration management |

---

## Setup Prerequisites

Before using this service, the following must be completed in Meta Business Manager:

1. **Create Meta Business Account** at business.facebook.com
2. **Create Meta App** with WhatsApp product enabled
3. **Get Phone Number ID** from WhatsApp API Setup
4. **Generate Permanent Access Token** (System User token)
5. **Add Recipient Number** as test recipient (for development)
6. **Create & Approve Message Template** named `lead_followup_reminder`

---

## Validation Criteria (P0)

### VC-1: Configuration Validation

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-1.1 | All env vars present | Service initializes successfully |
| VC-1.2 | Missing PHONE_NUMBER_ID | Clear error on service init |
| VC-1.3 | Missing ACCESS_TOKEN | Clear error on service init |
| VC-1.4 | Missing OWNER_NUMBER | Clear error on service init |

### VC-2: Send Notification

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-2.1 | Valid lead data | Message sent, success response with messageId |
| VC-2.2 | Lead without property | Message sent with "General Inquiry" |
| VC-2.3 | Lead without notes | Message sent with "No notes" |
| VC-2.4 | Missing required field | Returns validation error, no API call |

### VC-3: Message Content

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-3.1 | Full lead data | All 5 template variables populated correctly |
| VC-3.2 | Special characters in name | Characters escaped/handled properly |
| VC-3.3 | Long notes text | Text truncated or handled (API limit) |

### VC-4: Error Handling

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-4.1 | Invalid access token | Returns error, logs failure |
| VC-4.2 | Network timeout | Returns error after 30s |
| VC-4.3 | Invalid phone number | Returns error from API |
| VC-4.4 | Rate limit exceeded | Returns error, logs warning |

### VC-5: End-to-End

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| VC-5.1 | Send test message | Owner receives WhatsApp with correct lead info |
| VC-5.2 | Message formatting | All fields readable, emojis display correctly |
