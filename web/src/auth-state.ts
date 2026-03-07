// Access token storage using sessionStorage for persistence across page refreshes
// sessionStorage is cleared when the tab/window is closed, providing reasonable security
// while avoiding unnecessary token refreshes on page reload
let accessToken: string | null = null;
let tokenExpiresAt: Date | null = null;
let tokenRefreshable = true;

const SESSION_TOKEN_KEY = "memos_access_token";
const SESSION_EXPIRES_KEY = "memos_token_expires_at";
const SESSION_REFRESHABLE_KEY = "memos_token_refreshable";
const PERSISTENT_TOKEN_KEY = "memos_persistent_access_token";
const PERSISTENT_EXPIRES_KEY = "memos_persistent_token_expires_at";
const PERSISTENT_REFRESHABLE_KEY = "memos_persistent_token_refreshable";

const getSessionStorage = (): Storage | null => {
  try {
    return sessionStorage;
  } catch {
    return null;
  }
};

const getLocalStorage = (): Storage | null => {
  try {
    return localStorage;
  } catch {
    return null;
  }
};

const restoreTokenFromStorage = (storage: Storage | null, tokenKey: string, expiresKey: string, refreshableKey: string): boolean => {
  if (!storage) {
    return false;
  }

  const storedToken = storage.getItem(tokenKey);
  const storedExpires = storage.getItem(expiresKey);
  const storedRefreshable = storage.getItem(refreshableKey);

  if (!storedToken || !storedExpires) {
    return false;
  }

  const expiresAt = new Date(storedExpires);
  if (expiresAt <= new Date()) {
    storage.removeItem(tokenKey);
    storage.removeItem(expiresKey);
    storage.removeItem(refreshableKey);
    return false;
  }

  accessToken = storedToken;
  tokenExpiresAt = expiresAt;
  tokenRefreshable = storedRefreshable !== "false";
  return true;
};

export const getAccessToken = (): string | null => {
  // If not in memory, try to restore from sessionStorage
  if (!accessToken) {
    const restoredFromSession = restoreTokenFromStorage(
      getSessionStorage(),
      SESSION_TOKEN_KEY,
      SESSION_EXPIRES_KEY,
      SESSION_REFRESHABLE_KEY,
    );
    if (!restoredFromSession) {
      restoreTokenFromStorage(getLocalStorage(), PERSISTENT_TOKEN_KEY, PERSISTENT_EXPIRES_KEY, PERSISTENT_REFRESHABLE_KEY);
    }
  }
  return accessToken;
};

export const setAccessToken = (
  token: string | null,
  expiresAt?: Date,
  options: { persistent?: boolean; refreshable?: boolean } = {},
): void => {
  accessToken = token;
  tokenExpiresAt = expiresAt || null;
  tokenRefreshable = options.refreshable ?? true;

  const sessionStorageRef = getSessionStorage();
  const localStorageRef = getLocalStorage();

  if (token && expiresAt) {
    if (options.persistent) {
      localStorageRef?.setItem(PERSISTENT_TOKEN_KEY, token);
      localStorageRef?.setItem(PERSISTENT_EXPIRES_KEY, expiresAt.toISOString());
      localStorageRef?.setItem(PERSISTENT_REFRESHABLE_KEY, String(tokenRefreshable));
      sessionStorageRef?.removeItem(SESSION_TOKEN_KEY);
      sessionStorageRef?.removeItem(SESSION_EXPIRES_KEY);
      sessionStorageRef?.removeItem(SESSION_REFRESHABLE_KEY);
    } else {
      sessionStorageRef?.setItem(SESSION_TOKEN_KEY, token);
      sessionStorageRef?.setItem(SESSION_EXPIRES_KEY, expiresAt.toISOString());
      sessionStorageRef?.setItem(SESSION_REFRESHABLE_KEY, String(tokenRefreshable));
      localStorageRef?.removeItem(PERSISTENT_TOKEN_KEY);
      localStorageRef?.removeItem(PERSISTENT_EXPIRES_KEY);
      localStorageRef?.removeItem(PERSISTENT_REFRESHABLE_KEY);
    }
  } else {
    sessionStorageRef?.removeItem(SESSION_TOKEN_KEY);
    sessionStorageRef?.removeItem(SESSION_EXPIRES_KEY);
    sessionStorageRef?.removeItem(SESSION_REFRESHABLE_KEY);
    localStorageRef?.removeItem(PERSISTENT_TOKEN_KEY);
    localStorageRef?.removeItem(PERSISTENT_EXPIRES_KEY);
    localStorageRef?.removeItem(PERSISTENT_REFRESHABLE_KEY);
  }
};

export const isTokenExpired = (bufferMs: number = 30000): boolean => {
  if (!tokenExpiresAt) return true;
  // Consider expired with a safety buffer before actual expiry
  // Default: 30 seconds for regular requests
  // Can use longer buffer (e.g., 2 minutes) for proactive refresh
  return new Date() >= new Date(tokenExpiresAt.getTime() - bufferMs);
};

export const clearAccessToken = (): void => {
  accessToken = null;
  tokenExpiresAt = null;
  tokenRefreshable = true;
  getSessionStorage()?.removeItem(SESSION_TOKEN_KEY);
  getSessionStorage()?.removeItem(SESSION_EXPIRES_KEY);
  getSessionStorage()?.removeItem(SESSION_REFRESHABLE_KEY);
  getLocalStorage()?.removeItem(PERSISTENT_TOKEN_KEY);
  getLocalStorage()?.removeItem(PERSISTENT_EXPIRES_KEY);
  getLocalStorage()?.removeItem(PERSISTENT_REFRESHABLE_KEY);
};

export const canRefreshToken = (): boolean => tokenRefreshable;
