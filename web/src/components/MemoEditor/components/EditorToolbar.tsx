import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { useTranslate } from "@/utils/i18n";
import { validationService } from "../services";
import { useEditorContext } from "../state";
import InsertMenu from "../Toolbar/InsertMenu";
import VisibilitySelector from "../Toolbar/VisibilitySelector";
import type { EditorToolbarProps } from "../types";

export const EditorToolbar: FC<EditorToolbarProps> = ({ onSave, onCancel, memoName, mobileSheet = false }) => {
  const t = useTranslate();
  const { state, actions, dispatch } = useEditorContext();
  const { valid } = validationService.canSave(state);

  const isSaving = state.ui.isLoading.saving;

  const handleLocationChange = (location: typeof state.metadata.location) => {
    dispatch(actions.setMetadata({ location }));
  };

  const handleToggleFocusMode = () => {
    dispatch(actions.toggleFocusMode());
  };

  const handleVisibilityChange = (visibility: typeof state.metadata.visibility) => {
    dispatch(actions.setMetadata({ visibility }));
  };

  return (
    <div
      className={
        mobileSheet ? "mb-1 flex w-full items-center justify-between gap-2" : "mb-2 flex w-full flex-row items-center justify-between"
      }
    >
      <div className="flex flex-row items-center justify-start">
        <InsertMenu
          isUploading={state.ui.isLoading.uploading}
          location={state.metadata.location}
          onLocationChange={handleLocationChange}
          onToggleFocusMode={handleToggleFocusMode}
          memoName={memoName}
        />
      </div>

      <div className={mobileSheet ? "flex items-center gap-2" : "flex flex-row items-center justify-end gap-2"}>
        <VisibilitySelector value={state.metadata.visibility} onChange={handleVisibilityChange} compact={mobileSheet} />

        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
            {t("common.cancel")}
          </Button>
        )}

        <Button
          onClick={onSave}
          disabled={!valid || isSaving}
          className={mobileSheet ? "h-9 rounded-full bg-[#00a86b] px-4 text-white shadow-none hover:bg-[#029560]" : undefined}
        >
          {isSaving ? t("editor.saving") : t("editor.save")}
        </Button>
      </div>
    </div>
  );
};
