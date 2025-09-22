export const TOKEN_KEY = 'app_token';

/**
 * Encapsula acceso a localStorage para token JWT.
 * No modifica formato actual (asume string simple).
 */
export const getStoredToken = () =>
  typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};