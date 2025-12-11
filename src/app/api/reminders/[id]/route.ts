import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isNotificationsEnabled } from '@/lib/feature-flags';
import { requireAdmin, UnauthorizedError, ForbiddenError } from '@/lib/auth';

/**
 * DELETE /api/reminders/[id]
 * Cancels a scheduled reminder by ID
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check feature flag
  if (!isNotificationsEnabled()) {
    return NextResponse.json(
      { success: false, error: 'Notification feature is currently disabled' },
      { status: 503 }
    );
  }

  try {
    // Require admin access for deleting reminders
    await requireAdmin();

    const { id } = await params;

    // Check if reminder exists
    const existing = await prisma.reminder.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Reminder not found' },
        { status: 404 }
      );
    }

    // Delete the reminder
    await prisma.reminder.delete({
      where: { id },
    });

    console.log(`Reminder cancelled: ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Reminder cancelled',
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ success: false, error: error.message, code: 'UNAUTHORIZED' }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: error.message, code: 'FORBIDDEN' }, { status: 403 });
    }
    console.error('Error deleting reminder:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete reminder' },
      { status: 500 }
    );
  }
}
