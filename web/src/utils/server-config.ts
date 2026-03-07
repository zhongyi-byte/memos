import { isNativeApp } from "./native-app";

const SERVER_URL_KEY = "memos-native-server-url";

const normalizeServerUrl = (value: string): string => value.trim().replace(/\/+$/, "");

export const getConfiguredServerUrl = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return localStorage.getItem(SERVER_URL_KEY);
  } catch {
    return null;
  }
};

export const setConfiguredServerUrl = (value: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  const normalized = normalizeServerUrl(value);
  localStorage.setItem(SERVER_URL_KEY, normalized);
};

export const clearConfiguredServerUrl = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(SERVER_URL_KEY);
};

export const getApiBaseUrl = (): string => {
  if (typeof window === "undefined") {
    return "";
  }

  if (isNativeApp()) {
    return getConfiguredServerUrl() ?? window.location.origin;
  }

  return window.location.origin;
};

export const needsNativeServerSetup = (): boolean => isNativeApp() && !getConfiguredServerUrl();
