/**
 * Feature flags for the application
 * Controls feature availability via environment variables
 */

/**
 * Check if notification features are enabled
 * @returns true if NOTIFICATIONS_ENABLED is exactly "true"
 */
export function isNotificationsEnabled(): boolean {
  return process.env.NOTIFICATIONS_ENABLED === 'true';
}

/**
 * Get all feature flags status
 * Useful for sending to client in API responses
 */
export function getFeatureFlags() {
  return {
    notifications: isNotificationsEnabled(),
  };
}
