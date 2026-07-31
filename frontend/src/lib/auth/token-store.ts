/**
 * In-Memory Token Store & SSR-Safe BroadcastChannel Wrapper
 *
 * Requirements Met:
 * 1. Stores access token strictly in JavaScript heap memory. No localStorage/sessionStorage/JS cookies.
 * 2. Implements getAccessToken(), setAccessToken(), clearAccessToken(), and hasAccessToken().
 * 3. Broadcasts auth events: 'login', 'logout', 'sessionExpired'.
 * 4. Channel name: 'auth-events'.
 * 5. Strictly avoids broadcasting token values over the channel.
 * 6. Fully SSR-safe (guards against missing window / BroadcastChannel during Next.js SSR/RSC rendering).
 */

import { AUTH_BROADCAST_CHANNEL_NAME, BROADCAST_EVENT_TYPES } from './constants';
import type { AuthBroadcastMessage, BroadcastEventType } from './types';

/**
 * Internal private in-memory access token storage variable.
 * Kept scoped within module scope to prevent external code tampering.
 */
let inMemoryAccessToken: string | null = null;

/**
 * Retrieves the current in-memory access token.
 *
 * @returns {string | null} The active access token or null if empty/logged out.
 */
export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

/**
 * Updates the in-memory access token.
 *
 * @param {string} token - The new access token to store in memory.
 */
export function setAccessToken(token: string): void {
  inMemoryAccessToken = token;
}

/**
 * Clears the in-memory access token.
 */
export function clearAccessToken(): void {
  inMemoryAccessToken = null;
}

/**
 * Checks whether a valid non-empty access token is present in memory.
 *
 * @returns {boolean} True if access token exists, false otherwise.
 */
export function hasAccessToken(): boolean {
  return Boolean(inMemoryAccessToken && inMemoryAccessToken.length > 0);
}

/**
 * SSR-Safe BroadcastChannel Wrapper for cross-tab auth event synchronization.
 */
class AuthBroadcastChannelWrapper {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(message: AuthBroadcastMessage) => void> = new Set();

  constructor() {
    this.initChannel();
  }

  /**
   * Safely initializes BroadcastChannel if running in browser client environment.
   */
  private initChannel(): void {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL_NAME);
        this.channel.onmessage = (event: MessageEvent<AuthBroadcastMessage>) => {
          if (event.data && event.data.event) {
            this.listeners.forEach((listener) => listener(event.data));
          }
        };
      } catch (error) {
        // Fallback for environments where BroadcastChannel construction might fail
        console.warn('Failed to initialize Auth BroadcastChannel:', error);
        this.channel = null;
      }
    }
  }

  /**
   * Broadcasts an authentication event to other browser tabs.
   * STRICT SECURITY GUARANTEE: Never transmits token values or sensitive data.
   *
   * @param {BroadcastEventType} event - Event identifier ('login' | 'logout' | 'sessionExpired').
   */
  public broadcast(event: BroadcastEventType): void {
    if (!this.channel) {
      return;
    }

    const message: AuthBroadcastMessage = {
      event,
      timestamp: Date.now(),
    };

    try {
      this.channel.postMessage(message);
    } catch (error) {
      console.error('Error posting message to auth BroadcastChannel:', error);
    }
  }

  /**
   * Helper method to broadcast 'login' event across tabs.
   */
  public broadcastLogin(): void {
    this.broadcast(BROADCAST_EVENT_TYPES.LOGIN);
  }

  /**
   * Helper method to broadcast 'logout' event across tabs.
   */
  public broadcastLogout(): void {
    this.broadcast(BROADCAST_EVENT_TYPES.LOGOUT);
  }

  /**
   * Helper method to broadcast 'sessionExpired' event across tabs.
   */
  public broadcastSessionExpired(): void {
    this.broadcast(BROADCAST_EVENT_TYPES.SESSION_EXPIRED);
  }

  /**
   * Subscribes a listener callback to incoming cross-tab auth broadcast messages.
   *
   * @param {(message: AuthBroadcastMessage) => void} listener - Callback function.
   * @returns {() => void} Unsubscribe function.
   */
  public subscribe(listener: (message: AuthBroadcastMessage) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Closes and cleans up the BroadcastChannel connection.
   */
  public close(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
  }
}

/**
 * Singleton instance of SSR-safe AuthBroadcastChannelWrapper.
 */
export const authBroadcastChannel = new AuthBroadcastChannelWrapper();
