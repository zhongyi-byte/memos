const STORAGE_KEY = "memos-flomo-like";
const CHANGE_EVENT = "memos:flomo-like-change";

const readStoredValue = (): boolean => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === null) {
      return true;
    }
    return value === "true";
  } catch {
    return true;
  }
};

export const getFlomoLikeEnabled = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return readStoredValue();
};

export const applyFlomoLike = (enabled: boolean): void => {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.setAttribute("data-flomo-like", enabled ? "true" : "false");
};

export const setFlomoLikeEnabled = (enabled: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
  } catch {
    // Ignore localStorage failures.
  }

  applyFlomoLike(enabled);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
};

export const applyFlomoLikeEarly = (): void => {
  applyFlomoLike(getFlomoLikeEnabled());
};

export { CHANGE_EVENT as FLOMO_LIKE_CHANGE_EVENT, STORAGE_KEY as FLOMO_LIKE_STORAGE_KEY };
