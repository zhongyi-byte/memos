import { useCallback, useEffect, useState } from "react";
import { applyFlomoLike, FLOMO_LIKE_CHANGE_EVENT, getFlomoLikeEnabled, setFlomoLikeEnabled } from "@/utils/flomo-like";

export const useFlomoLike = () => {
  const [enabled, setEnabledState] = useState<boolean>(() => getFlomoLikeEnabled());

  useEffect(() => {
    applyFlomoLike(enabled);
  }, [enabled]);

  useEffect(() => {
    const sync = () => {
      setEnabledState(getFlomoLikeEnabled());
    };

    window.addEventListener("storage", sync);
    window.addEventListener(FLOMO_LIKE_CHANGE_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(FLOMO_LIKE_CHANGE_EVENT, sync);
    };
  }, []);

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
    setFlomoLikeEnabled(next);
  }, []);

  return { flomoLike: enabled, setFlomoLike: setEnabled };
};
