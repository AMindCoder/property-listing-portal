/**
 * Reminder preset time calculations
 * All times are calculated in IST (India Standard Time, UTC+5:30)
 */

export type ReminderPreset =
  | 'tomorrow_morning'
  | 'tomorrow_afternoon'
  | 'in_2_days'
  | 'in_3_days'
  | 'in_1_week';

export const PRESET_LABELS: Record<ReminderPreset, string> = {
  tomorrow_morning: 'Tomorrow Morning (9:30 AM)',
  tomorrow_afternoon: 'Tomorrow Afternoon (3:30 PM)',
  in_2_days: 'In 2 Days (9:30 AM)',
  in_3_days: 'In 3 Days (9:30 AM)',
  in_1_week: 'In 1 Week (9:30 AM)',
};

export const VALID_PRESETS: ReminderPreset[] = [
  'tomorrow_morning',
  'tomorrow_afternoon',
  'in_2_days',
  'in_3_days',
  'in_1_week',
];

/**
 * Calculate scheduled time from preset
 * @param preset - The reminder preset value
 * @returns Date object in UTC representing the scheduled time
 */
export function calculateScheduledTime(preset: ReminderPreset): Date {
  const now = new Date();

  // IST is UTC+5:30
  const IST_OFFSET_HOURS = 5;
  const IST_OFFSET_MINUTES = 30;

  // Morning time: 9:30 AM IST = 4:00 AM UTC
  const MORNING_HOUR_UTC = 4;
  const MORNING_MINUTE_UTC = 0;

  // Afternoon time: 3:30 PM IST = 10:00 AM UTC
  const AFTERNOON_HOUR_UTC = 10;
  const AFTERNOON_MINUTE_UTC = 0;

  // Start with today at midnight UTC
  const scheduled = new Date(now);
  scheduled.setUTCHours(0, 0, 0, 0);

  switch (preset) {
    case 'tomorrow_morning':
      scheduled.setUTCDate(scheduled.getUTCDate() + 1);
      scheduled.setUTCHours(MORNING_HOUR_UTC, MORNING_MINUTE_UTC, 0, 0);
      break;

    case 'tomorrow_afternoon':
      scheduled.setUTCDate(scheduled.getUTCDate() + 1);
      scheduled.setUTCHours(AFTERNOON_HOUR_UTC, AFTERNOON_MINUTE_UTC, 0, 0);
      break;

    case 'in_2_days':
      scheduled.setUTCDate(scheduled.getUTCDate() + 2);
      scheduled.setUTCHours(MORNING_HOUR_UTC, MORNING_MINUTE_UTC, 0, 0);
      break;

    case 'in_3_days':
      scheduled.setUTCDate(scheduled.getUTCDate() + 3);
      scheduled.setUTCHours(MORNING_HOUR_UTC, MORNING_MINUTE_UTC, 0, 0);
      break;

    case 'in_1_week':
      scheduled.setUTCDate(scheduled.getUTCDate() + 7);
      scheduled.setUTCHours(MORNING_HOUR_UTC, MORNING_MINUTE_UTC, 0, 0);
      break;
  }

  return scheduled;
}

/**
 * Format a scheduled date for display in IST
 * @param date - Date object to format
 * @returns Formatted string like "Dec 11, 2025 at 9:30 AM"
 */
export function formatScheduledTime(date: Date): string {
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Validate if a string is a valid preset
 * @param preset - String to validate
 * @returns true if valid preset
 */
export function isValidPreset(preset: string): preset is ReminderPreset {
  return VALID_PRESETS.includes(preset as ReminderPreset);
}
