/**
 * Authentication Constants
 *
 * This file contains constant definitions for authentication event types,
 * BroadcastChannel message identifiers, and channel configuration names.
 */

/**
 * High-level authentication event types used across application layers.
 */
export const AUTH_EVENT_TYPES = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
} as const;

/**
 * Event message names broadcasted over the cross-tab BroadcastChannel.
 * Note: These string identifiers carry no token values or sensitive payload.
 */
export const BROADCAST_EVENT_TYPES = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  SESSION_EXPIRED: 'sessionExpired',
  REFRESH_FAILED: 'refreshFailed',
} as const;

/**
 * Standard BroadcastChannel name for cross-tab authentication synchronization.
 */
export const AUTH_BROADCAST_CHANNEL_NAME = 'auth-events';
