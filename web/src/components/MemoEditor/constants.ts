export const LOCALSTORAGE_DEBOUNCE_DELAY = 500;

export const FOCUS_MODE_STYLES = {
  backdrop: "fixed inset-0 bg-[rgba(24,20,17,0.44)] backdrop-blur-[3px] z-40",
  container: {
    desktop:
      "fixed z-50 w-auto max-w-5xl mx-auto shadow-2xl border-border h-auto overflow-y-auto top-2 left-2 right-2 bottom-2 sm:top-4 sm:left-4 sm:right-4 sm:bottom-4 md:top-8 md:left-8 md:right-8 md:bottom-8",
    mobileSheet:
      "fixed z-50 left-0 right-0 bottom-0 max-h-[58svh] min-h-[46svh] overflow-y-auto rounded-t-[28px] rounded-b-none border-x-0 border-b-0 border-transparent bg-[linear-gradient(180deg,rgba(58,54,52,0.98),rgba(43,40,38,0.98))] text-white shadow-[0_-24px_80px_rgba(0,0,0,0.42)]",
  },
  transition: "transition-all duration-300 ease-in-out",
  exitButton: "absolute top-3 right-3 z-10 opacity-60 hover:opacity-100",
} as const;

export const EDITOR_HEIGHT = {
  // Max height for normal mode - focus mode uses flex-1 to grow dynamically
  normal: "max-h-[50vh]",
} as const;
