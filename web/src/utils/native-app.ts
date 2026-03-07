import { Capacitor } from "@capacitor/core";

export const isNativeApp = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return Capacitor.isNativePlatform();
};
