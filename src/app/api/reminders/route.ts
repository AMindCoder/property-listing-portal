import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isNotificationsEnabled } from '@/lib/feature-flags';
import { requireAdmin, UnauthorizedError, ForbiddenError } from '@/lib/auth';
import {
  calculateScheduledTime,
  formatScheduledTime,
  isValidPreset,
  PRESET_LABELS,
  ReminderPreset,
} from '@/lib/reminder-presets';

export const dynamic = 'force-dynamic';

const FEATURE_DISABLED_RESPONSE = {
  success: false,
  error: 'Notification feature is currently disabled',
};

/**
 * GET /api/reminders?leadId={leadId}
 * Retrieves the active reminder for a specific lead
 */
export async function GET(request: Request) {
  // Check feature flag
  if (!isNotificationsEnabled()) {
    return NextResponse.json(FEATURE_DISABLED_RESPONSE, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json(
        { success: false, error: 'leadId is required' },
        { status: 400 }
      );
    }

    const reminder = await prisma.reminder.findUnique({
      where: { leadId },
    });

    return NextResponse.json({
      success: true,
      reminder: reminder || null,
    });
  } catch (error) {
    console.error('Error fetching reminder:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reminder' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reminders
 * Creates or replaces a reminder for a lead
 * Request body: { leadId: string, preset: ReminderPreset }
 */
export async function POST(request: Request) {
  // Check feature flag
  if (!isNotificationsEnabled()) {
    return NextResponse.json(FEATURE_DISABLED_RESPONSE, { status: 503 });
  }

  try {
    // Require admin access for creating reminders
    await requireAdmin();

    const body = await request.json();
    const { leadId, preset } = body;

    // Validation
    if (!leadId) {
      return NextResponse.json(
        { success: false, error: 'leadId is required' },
        { status: 400 }
      );
    }

    if (!preset) {
      return NextResponse.json(
        { success: false, error: 'preset is required' },
        { status: 400 }
      );
    }

    if (!isValidPreset(preset)) {
      return NextResponse.json(
        { success: false, error: 'Invalid preset value' },
        { status: 400 }
      );
    }

    // Check if lead exists
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Calculate scheduled time
    const scheduledAt = calculateScheduledTime(preset as ReminderPreset);

    // Upsert reminder (create or replace)
    const reminder = await prisma.reminder.upsert({
      where: { leadId },
      update: {
        scheduledAt,
        sent: false,
      },
      create: {
        leadId,
        scheduledAt,
        sent: false,
      },
    });

    console.log(
      `Reminder created/updated for lead ${leadId}, preset: ${preset}, scheduledAt: ${scheduledAt.toISOString()}`
    );

    return NextResponse.json({
      success: true,
      reminder,
      scheduledFor: PRESET_LABELS[preset as ReminderPreset],
      formattedTime: formatScheduledTime(scheduledAt),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ success: false, error: error.message, code: 'UNAUTHORIZED' }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: error.message, code: 'FORBIDDEN' }, { status: 403 });
    }
    console.error('Error creating reminder:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create reminder' },
      { status: 500 }
    );
  }
}
