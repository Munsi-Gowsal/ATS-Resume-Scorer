/**
 * Singleton BroadcastChannel Service for Cross-Tab Auth Events
 *
 * Requirements Met:
 * 1. Singleton BroadcastChannel service instance.
 * 2. Supports: 'login', 'logout', 'sessionExpired', 'refreshFailed'.
 * 3. Never transmits token values.
 * 4. Automatic cleanup methods and subscription listeners management.
 * 5. Complete SSR safety.
 * 6. Strict TypeScript.
 * 7. Avoids memory leaks.
 */

import { AUTH_BROADCAST_CHANNEL_NAME, BROADCAST_EVENT_TYPES } from './constants';
import type { AuthBroadcastMessage, BroadcastEventType } from './types';

/**
 * Type handler function for broadcast message subscribers.
 */
export type BroadcastListener = (message: AuthBroadcastMessage) => void;

/**
 * Singleton BroadcastChannel Service for managing cross-tab auth state events safely.
 */
export class AuthBroadcastService {
  private static instance: AuthBroadcastService | null = null;
  private channel: BroadcastChannel | null = null;
  private listeners: Set<BroadcastListener> = new Set();
  private boundMessageHandler: ((event: MessageEvent<AuthBroadcastMessage>) => void) | null = null;

  private constructor() {
    this.initChannel();
  }

  /**
   * Returns the global singleton instance of AuthBroadcastService.
   *
   * @returns {AuthBroadcastService} Singleton instance.
   */
  public static getInstance(): AuthBroadcastService {
    if (!AuthBroadcastService.instance) {
      AuthBroadcastService.instance = new AuthBroadcastService();
    }
    return AuthBroadcastService.instance;
  }

  /**
   * Initializes the BroadcastChannel instance if in browser environment.
   */
  private initChannel(): void {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL_NAME);
        this.boundMessageHandler = (event: MessageEvent<AuthBroadcastMessage>) => {
          this.handleIncomingMessage(event);
        };
        this.channel.addEventListener('message', this.boundMessageHandler);
      } catch (error) {
        console.warn('Failed to initialize AuthBroadcastService channel:', error);
        this.channel = null;
      }
    }
  }

  /**
   * Handles incoming BroadcastChannel events and notifies subscribed listeners.
   */
  private handleIncomingMessage(event: MessageEvent<AuthBroadcastMessage>): void {
    if (event && event.data && typeof event.data.event === 'string') {
      const message = event.data;
      this.listeners.forEach((listener) => {
        try {
          listener(message);
        } catch (err) {
          console.error('Error executing auth broadcast listener:', err);
        }
      });
    }
  }

  /**
   * Transmits a cross-tab event.
   * STRICT GUARANTEE: Never transmits token values or sensitive auth payloads.
   *
   * @param {BroadcastEventType} event - Event name ('login' | 'logout' | 'sessionExpired' | 'refreshFailed').
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
      console.error('Failed to post message to auth BroadcastChannel:', error);
    }
  }

  /**
   * Broadcasts a 'login' event to all other open tabs.
   */
  public broadcastLogin(): void {
    this.broadcast(BROADCAST_EVENT_TYPES.LOGIN);
  }

  /**
   * Broadcasts a 'logout' event to all other open tabs.
   */
  public broadcastLogout(): void {
    this.broadcast(BROADCAST_EVENT_TYPES.LOGOUT);
  }

  /**
   * Broadcasts a 'sessionExpired' event to all other open tabs.
   */
  public broadcastSessionExpired(): void {
    this.broadcast(BROADCAST_EVENT_TYPES.SESSION_EXPIRED);
  }

  /**
   * Broadcasts a 'refreshFailed' event to all other open tabs.
   */
  public broadcastRefreshFailed(): void {
    this.broadcast(BROADCAST_EVENT_TYPES.REFRESH_FAILED);
  }

  /**
   * Subscribes a listener to cross-tab auth broadcast messages.
   *
   * @param {BroadcastListener} listener - Callback function to be executed when message arrives.
   * @returns {() => void} Unsubscribe function to clean up listener and prevent memory leaks.
   */
  public subscribe(listener: BroadcastListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Completely destroys channel references and listeners to ensure memory cleanup.
   */
  public destroy(): void {
    if (this.channel) {
      if (this.boundMessageHandler) {
        this.channel.removeEventListener('message', this.boundMessageHandler);
        this.boundMessageHandler = null;
      }
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
    AuthBroadcastService.instance = null;
  }
}

/**
 * Singleton export of the AuthBroadcastService.
 */
export const authBroadcastService = AuthBroadcastService.getInstance();
