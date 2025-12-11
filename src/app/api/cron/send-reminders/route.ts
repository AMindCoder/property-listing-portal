import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendLeadReminder, isWhatsAppConfigured } from '@/lib/whatsapp';
import { isNotificationsEnabled } from '@/lib/feature-flags';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for processing

/**
 * GET /api/cron/send-reminders
 * Processes due reminders and sends WhatsApp notifications
 * Called by Vercel Cron at configured intervals
 */
export async function GET(request: Request) {
  const timestamp = new Date().toISOString();

  // Check feature flag first - return 200 to prevent Vercel marking as failed
  if (!isNotificationsEnabled()) {
    console.log(`Cron job skipped at ${timestamp}: Notification feature is disabled`);
    return NextResponse.json({
      success: true,
      message: 'Notification feature is disabled, skipping',
      timestamp,
    });
  }

  // Verify authorization
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // In production, require CRON_SECRET
  // Also allow Vercel's built-in cron authentication
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';

  if (!isVercelCron) {
    if (!cronSecret) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn('Unauthorized cron request attempted');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  // Check WhatsApp configuration
  if (!isWhatsAppConfigured()) {
    console.error('WhatsApp service not configured');
    return NextResponse.json(
      {
        success: false,
        error: 'WhatsApp service not configured',
        timestamp,
      },
      { status: 500 }
    );
  }

  try {
    console.log(`Cron job started at ${timestamp}`);

    // Query due reminders: scheduledAt <= NOW() AND sent = false
    const dueReminders = await prisma.reminder.findMany({
      where: {
        scheduledAt: { lte: new Date() },
        sent: false,
      },
      include: {
        lead: {
          include: {
            property: {
              select: {
                title: true,
                location: true,
              },
            },
          },
        },
      },
    });

    console.log(`Found ${dueReminders.length} due reminders to process`);

    if (dueReminders.length === 0) {
      return NextResponse.json({
        success: true,
        summary: {
          processed: 0,
          sent: 0,
          failed: 0,
        },
        timestamp,
      });
    }

    let sentCount = 0;
    let failedCount = 0;

    // Process each reminder sequentially to manage time
    for (const reminder of dueReminders) {
      console.log(`Processing reminder ${reminder.id} for lead ${reminder.leadId}`);

      // Check if lead still exists
      if (!reminder.lead) {
        console.warn(`Lead not found for reminder ${reminder.id}, marking as sent (orphaned)`);
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { sent: true },
        });
        sentCount++;
        continue;
      }

      // Send WhatsApp notification
      const result = await sendLeadReminder({
        name: reminder.lead.name,
        phone: reminder.lead.phone,
        property: reminder.lead.property || undefined,
        purpose: reminder.lead.purpose,
        notes: reminder.lead.notes || undefined,
      });

      if (result.success) {
        // Mark reminder as sent
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { sent: true },
        });
        console.log(`Reminder ${reminder.id} sent successfully, messageId: ${result.messageId}`);
        sentCount++;
      } else {
        // Log error but don't mark as sent - will retry next time
        console.error(`Failed to send reminder ${reminder.id}: ${result.error}`);
        failedCount++;
      }
    }

    const summary = {
      processed: dueReminders.length,
      sent: sentCount,
      failed: failedCount,
    };

    console.log(`Cron job completed: ${JSON.stringify(summary)}`);

    return NextResponse.json({
      success: true,
      summary,
      timestamp,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process reminders',
        timestamp,
      },
      { status: 500 }
    );
  }
}
