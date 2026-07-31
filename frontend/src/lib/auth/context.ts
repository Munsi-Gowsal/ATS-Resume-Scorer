'use client';

/**
 * Authentication Context & Provider
 *
 * Implements React Context for application-wide authentication state,
 * integrating in-memory token management, BroadcastChannel cross-tab events,
 * centralized API client, and single-flight token refresh.
 */

import * as React from 'react';
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { apiService } from '../api/service';
import { authBroadcastService } from './broadcast';
import { refreshAccessToken } from './refresh';
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from './token-store';
import type { LoginPayload, User } from './types';

/**
 * Shape of the Auth Context Value provided to consumers.
 */
export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  silentRefresh: () => Promise<void>;
}

/**
 * React Context instance for Authentication.
 */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthProvider component managing authentication state, login, logout,
 * silent refresh, and cross-tab synchronization.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Mounted flag to avoid updating unmounted component state
  const isMountedRef = useRef<boolean>(true);

  /**
   * Helper method to fetch the current authenticated user's profile details.
   */
  const fetchCurrentUser = useCallback(async (token: string): Promise<User | null> => {
    try {
      const userData = await apiService.getCurrentUser(token);
      return userData;
    } catch {
      return null;
    }
  }, []);

  /**
   * Performs silent token refresh, stores the returned token, fetches user profile, and updates state.
   */
  const silentRefresh = useCallback(async (): Promise<void> => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const result = await refreshAccessToken();
      if (!result?.accessToken) {
        throw new Error('No access token returned from refresh');
      }

      // Store the new token in memory store
      setAccessToken(result.accessToken);

      const userData = await fetchCurrentUser(result.accessToken);
      if (isMountedRef.current) {
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          clearAccessToken();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch {
      if (isMountedRef.current) {
        clearAccessToken();
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [fetchCurrentUser]);

  /**
   * Executes user login flow using centralized apiService:
   * 1. Call apiService.login(credentials)
   * 2. Receive access token
   * 3. Call setAccessToken()
   * 4. Fetch current user
   * 5. Update state
   * 6. Broadcast login event
   */
  const login = useCallback(
    async (credentials: LoginPayload): Promise<void> => {
      if (typeof window === 'undefined') {
        return;
      }

      setIsLoading(true);

      try {
        const data = await apiService.login(credentials);
        const token = data.access_token;

        // Store token in memory
        setAccessToken(token);

        // Fetch user profile
        const userData = await fetchCurrentUser(token);

        if (isMountedRef.current) {
          setUser(userData);
          setIsAuthenticated(Boolean(userData));
        }

        // Broadcast cross-tab login event (token is never included)
        authBroadcastService.broadcastLogin();
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [fetchCurrentUser]
  );

  /**
   * Executes user logout flow:
   * 1. Call backend logout endpoint via apiService
   * 2. Clear in-memory access token
   * 3. Clear local state
   * 4. Broadcast logout event
   */
  const logout = useCallback(async (): Promise<void> => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      await apiService.logout();
    } catch {
      // Ignore network errors on logout endpoint and proceed with client cleanup
    } finally {
      clearAccessToken();

      if (isMountedRef.current) {
        setUser(null);
        setIsAuthenticated(false);
      }

      // Broadcast cross-tab logout event
      authBroadcastService.broadcastLogout();
    }
  }, []);

  /**
   * Initialize Auth State & Subscribe to Broadcast Channel Events
   */
  useEffect(() => {
    isMountedRef.current = true;

    if (typeof window === 'undefined') {
      return;
    }

    // Normal effect handler complying with ESLint react-hooks/set-state-in-effect
    const initAuth = async () => {
      if (!getAccessToken()) {
        await silentRefresh();
      } else if (isMountedRef.current) {
        setIsLoading(false);
      }
    };

    void initAuth();

    // Subscribe to cross-tab BroadcastChannel events
    const unsubscribe = authBroadcastService.subscribe((message) => {
      if (!isMountedRef.current) return;

      switch (message.event) {
        case 'login':
          silentRefresh();
          break;
        case 'logout':
        case 'sessionExpired':
        case 'refreshFailed':
          clearAccessToken();
          setUser(null);
          setIsAuthenticated(false);
          break;
        default:
          break;
      }
    });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [silentRefresh]);

  /**
   * Memoize context value to optimize component re-renders
   */
  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      silentRefresh,
    }),
    [user, isAuthenticated, isLoading, login, logout, silentRefresh]
  );

  return React.createElement(AuthContext.Provider, { value: contextValue }, children);
}
