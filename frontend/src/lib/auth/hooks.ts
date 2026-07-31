'use client';

/**
 * Authentication Custom Hooks
 *
 * Custom React hooks for consuming AuthContext state and actions:
 * - useAuth(): Access complete auth context
 * - useLogin(): Access login action
 * - useLogout(): Access logout action
 * - useSilentRefresh(): Access silent refresh action
 */

import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from './context';

/**
 * Main hook to consume the complete AuthContext value.
 * Throws an error if used outside an <AuthProvider>.
 *
 * @returns {AuthContextValue} The auth context value.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
}

/**
 * Specialized hook returning only the login function.
 *
 * @returns {AuthContextValue['login']} The login function.
 */
export function useLogin(): AuthContextValue['login'] {
  const { login } = useAuth();
  return login;
}

/**
 * Specialized hook returning only the logout function.
 *
 * @returns {AuthContextValue['logout']} The logout function.
 */
export function useLogout(): AuthContextValue['logout'] {
  const { logout } = useAuth();
  return logout;
}

/**
 * Specialized hook returning only the silentRefresh function.
 *
 * @returns {AuthContextValue['silentRefresh']} The silentRefresh function.
 */
export function useSilentRefresh(): AuthContextValue['silentRefresh'] {
  const { silentRefresh } = useAuth();
  return silentRefresh;
}
