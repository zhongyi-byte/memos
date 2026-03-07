import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import useCurrentUser from "@/hooks/useCurrentUser";
import useMediaQuery from "@/hooks/useMediaQuery";
import { memoKeys } from "@/hooks/useMemoQueries";
import { userKeys } from "@/hooks/useUserQueries";
import { handleError } from "@/lib/error";
import { cn } from "@/lib/utils";
import { useTranslate } from "@/utils/i18n";
import { convertVisibilityFromString } from "@/utils/memo";
import { EditorContent, EditorMetadata, EditorToolbar, FocusModeExitButton, FocusModeOverlay, TimestampPopover } from "./components";
import { FOCUS_MODE_STYLES } from "./constants";
import type { EditorRefActions } from "./Editor";
import { useAutoSave, useFocusMode, useKeyboard, useMemoInit } from "./hooks";
import { cacheService, errorService, memoService, validationService } from "./services";
import { EditorProvider, useEditorContext } from "./state";
import type { MemoEditorProps } from "./types";

const MemoEditor = (props: MemoEditorProps) => (
  <EditorProvider>
    <MemoEditorImpl {...props} />
  </EditorProvider>
);

const MemoEditorImpl: React.FC<MemoEditorProps> = ({
  className,
  cacheKey,
  memo,
  parentMemoName,
  autoFocus,
  placeholder,
  mobileSheet = false,
  onConfirm,
  onCancel,
}) => {
  const t = useTranslate();
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();
  const editorRef = useRef<EditorRefActions>(null);
  const { state, actions, dispatch } = useEditorContext();
  const { userGeneralSetting } = useAuth();
  const md = useMediaQuery("md");
  const isMobileSheetMode = mobileSheet && !md;

  const memoName = memo?.name;

  // Get default visibility from user settings
  const defaultVisibility = userGeneralSetting?.memoVisibility ? convertVisibilityFromString(userGeneralSetting.memoVisibility) : undefined;

  useMemoInit({ editorRef, memo, cacheKey, username: currentUser?.name ?? "", autoFocus, defaultVisibility });

  // Auto-save content to localStorage
  useAutoSave(state.content, currentUser?.name ?? "", cacheKey);

  // Focus mode management with body scroll lock
  useFocusMode(state.ui.isFocusMode);

  const handleToggleFocusMode = () => {
    dispatch(actions.toggleFocusMode());
  };

  const handleEditorFocus = () => {
    if (isMobileSheetMode && !state.ui.isFocusMode) {
      dispatch(actions.setFocusMode(true));
    }
  };

  useKeyboard(editorRef, { onSave: handleSave });

  useEffect(() => {
    if (!state.ui.isFocusMode) {
      return;
    }

    if (isMobileSheetMode) {
      requestAnimationFrame(() => {
        editorRef.current?.focus();
        editorRef.current?.scrollToCursor();
      });
    }
  }, [isMobileSheetMode, state.ui.isFocusMode]);

  async function handleSave() {
    // Validate before saving
    const { valid, reason } = validationService.canSave(state);
    if (!valid) {
      toast.error(reason || "Cannot save");
      return;
    }

    dispatch(actions.setLoading("saving", true));

    try {
      const result = await memoService.save(state, { memoName, parentMemoName });

      if (!result.hasChanges) {
        toast.error(t("editor.no-changes-detected"));
        onCancel?.();
        return;
      }

      // Clear localStorage cache on successful save
      cacheService.clear(cacheService.key(currentUser?.name ?? "", cacheKey));

      // Invalidate React Query cache to refresh memo lists across the app
      const invalidationPromises = [
        queryClient.invalidateQueries({ queryKey: memoKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: userKeys.stats() }),
      ];

      // If this was a comment, also invalidate the comments query for the parent memo
      if (parentMemoName) {
        invalidationPromises.push(queryClient.invalidateQueries({ queryKey: memoKeys.comments(parentMemoName) }));
      }

      await Promise.all(invalidationPromises);

      // Reset editor state to initial values
      dispatch(actions.reset());

      // Notify parent component of successful save
      onConfirm?.(result.memoName);
    } catch (error) {
      handleError(error, toast.error, {
        context: "Failed to save memo",
        fallbackMessage: errorService.getErrorMessage(error),
      });
    } finally {
      dispatch(actions.setLoading("saving", false));
    }
  }

  return (
    <>
      <FocusModeOverlay isActive={state.ui.isFocusMode} onToggle={handleToggleFocusMode} />

      {/*
        Layout structure:
        - Uses justify-between to push content to top and bottom
        - In focus mode: becomes fixed with specific spacing, editor grows to fill space
        - In normal mode: stays relative with max-height constraint
      */}
      <div
        className={cn(
          "memo-editor group relative w-full flex flex-col justify-between items-start bg-card px-4 pt-3 pb-1 rounded-lg border border-border gap-2",
          FOCUS_MODE_STYLES.transition,
          state.ui.isFocusMode && cn(isMobileSheetMode ? FOCUS_MODE_STYLES.container.mobileSheet : FOCUS_MODE_STYLES.container.desktop),
          isMobileSheetMode &&
            !state.ui.isFocusMode &&
            "rounded-[24px] border-[#e6dacd] bg-[rgba(255,252,247,0.94)] px-4 py-3 shadow-[0_10px_30px_rgba(120,98,76,0.08)]",
          isMobileSheetMode && state.ui.isFocusMode && "gap-3 px-5 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]",
          className,
        )}
      >
        {isMobileSheetMode && state.ui.isFocusMode && <div className="mx-auto h-1.5 w-12 rounded-full bg-white/16" />}

        {/* Exit button is absolutely positioned in top-right corner when active */}
        <FocusModeExitButton isActive={state.ui.isFocusMode} onToggle={handleToggleFocusMode} title={t("editor.exit-focus-mode")} />

        {memoName && <TimestampPopover />}

        {/* Editor content grows to fill available space in focus mode */}
        <EditorContent ref={editorRef} placeholder={placeholder} autoFocus={autoFocus} onFocus={handleEditorFocus} />

        {/* Metadata and toolbar grouped together at bottom */}
        <div className={cn("flex w-full flex-col gap-2", isMobileSheetMode && state.ui.isFocusMode && "gap-3")}>
          <EditorMetadata memoName={memoName} />
          <EditorToolbar
            onSave={handleSave}
            onCancel={onCancel}
            memoName={memoName}
            mobileSheet={isMobileSheetMode && state.ui.isFocusMode}
          />
        </div>
      </div>
    </>
  );
};

export default MemoEditor;
