/**
 * Authentication Core TypeScript Definitions
 *
 * Defines strict interfaces and types for user data, auth state,
 * event triggers, token payloads, and BroadcastChannel communications.
 */

import { AUTH_EVENT_TYPES, BROADCAST_EVENT_TYPES } from './constants';

/**
 * Represents authenticated user details.
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Payload for user login request.
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Represents overall application authentication state.
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * High-level authentication event types (LOGIN | LOGOUT | SESSION_EXPIRED).
 */
export type AuthEventType = (typeof AUTH_EVENT_TYPES)[keyof typeof AUTH_EVENT_TYPES];

/**
 * Cross-tab BroadcastChannel payload event types (login | logout | sessionExpired).
 */
export type BroadcastEventType = (typeof BROADCAST_EVENT_TYPES)[keyof typeof BROADCAST_EVENT_TYPES];

/**
 * Structured authentication event object for intra-app event dispatching.
 */
export interface AuthEvent {
  type: AuthEventType;
  timestamp: number;
}

/**
 * Decoded access token JWT payload contents.
 */
export interface TokenPayload {
  sub: string;
  exp: number;
  iat: number;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

/**
 * Cross-tab message payload emitted over BroadcastChannel.
 * Strictly guarantees that no token value is ever broadcasted.
 */
export interface AuthBroadcastMessage {
  event: BroadcastEventType;
  timestamp: number;
}
