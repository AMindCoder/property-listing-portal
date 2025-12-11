/**
 * WhatsApp Business Cloud API integration
 * Sends lead follow-up reminder notifications
 */

export interface LeadNotificationData {
  name: string;
  phone: string;
  property?: {
    title: string;
    location: string;
  };
  purpose: string;
  notes?: string;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Environment variable validation
function getConfig() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const ownerNumber = process.env.OWNER_WHATSAPP_NUMBER;

  const missing: string[] = [];
  if (!phoneNumberId) missing.push('WHATSAPP_PHONE_NUMBER_ID');
  if (!accessToken) missing.push('WHATSAPP_ACCESS_TOKEN');
  if (!ownerNumber) missing.push('OWNER_WHATSAPP_NUMBER');

  if (missing.length > 0) {
    return {
      valid: false as const,
      error: `Missing environment variables: ${missing.join(', ')}`,
    };
  }

  return {
    valid: true as const,
    phoneNumberId: phoneNumberId!,
    accessToken: accessToken!,
    ownerNumber: ownerNumber!,
  };
}

/**
 * Format property string for message
 */
function formatPropertyString(property?: { title: string; location: string }): string {
  if (!property) {
    return 'General Inquiry';
  }
  return `${property.title} in ${property.location}`;
}

/**
 * Mask phone number for logging (show last 4 digits)
 */
function maskPhone(phone: string): string {
  if (phone.length <= 4) return '****';
  return '****' + phone.slice(-4);
}

/**
 * Send a lead reminder notification via WhatsApp
 * @param lead - Lead data for the notification
 * @returns SendResult with success status and optional messageId or error
 */
export async function sendLeadReminder(lead: LeadNotificationData): Promise<SendResult> {
  const config = getConfig();

  if (!config.valid) {
    console.error('WhatsApp service configuration error:', config.error);
    return { success: false, error: config.error };
  }

  // Validate required fields
  if (!lead.name || !lead.phone || !lead.purpose) {
    return {
      success: false,
      error: 'Missing required lead data (name, phone, or purpose)',
    };
  }

  const propertyString = formatPropertyString(lead.property);
  const notesString = lead.notes || 'No notes';

  console.log(
    `Sending WhatsApp reminder - Lead: ${lead.name}, Phone: ${maskPhone(lead.phone)}`
  );

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: config.ownerNumber,
          type: 'template',
          template: {
            name: 'lead_followup_reminder',
            language: {
              code: 'en',
            },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: lead.name },
                  { type: 'text', text: lead.phone },
                  { type: 'text', text: propertyString },
                  { type: 'text', text: lead.purpose },
                  { type: 'text', text: notesString },
                ],
              },
            ],
          },
        }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;

      console.error(`WhatsApp API error for lead ${lead.name}:`, errorMessage);

      if (response.status === 401) {
        return { success: false, error: 'WhatsApp API error: Invalid access token' };
      }
      if (response.status === 429) {
        console.warn('WhatsApp rate limit exceeded');
        return { success: false, error: 'WhatsApp API error: Rate limit exceeded' };
      }

      return { success: false, error: `WhatsApp API error: ${errorMessage}` };
    }

    const data = await response.json();
    const messageId = data?.messages?.[0]?.id;

    console.log(`WhatsApp message sent successfully - Lead: ${lead.name}, MessageId: ${messageId}`);

    return { success: true, messageId };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        console.error(`WhatsApp API timeout for lead ${lead.name}`);
        return { success: false, error: 'WhatsApp API error: Request timeout' };
      }
      console.error(`WhatsApp send error for lead ${lead.name}:`, error.message);
      return { success: false, error: `WhatsApp API error: ${error.message}` };
    }
    console.error(`WhatsApp unexpected error for lead ${lead.name}:`, error);
    return { success: false, error: 'WhatsApp API error: Unexpected error' };
  }
}

/**
 * Check if WhatsApp service is configured
 * @returns true if all required environment variables are set
 */
export function isWhatsAppConfigured(): boolean {
  return getConfig().valid;
}
