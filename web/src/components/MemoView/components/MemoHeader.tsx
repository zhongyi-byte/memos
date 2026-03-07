import { timestampDate } from "@bufbuild/protobuf/wkt";
import { BookmarkIcon, MessageCircleMoreIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import i18n from "@/i18n";
import { cn } from "@/lib/utils";
import { Visibility } from "@/types/proto/api/v1/memo_service_pb";
import type { User } from "@/types/proto/api/v1/user_service_pb";
import { useTranslate } from "@/utils/i18n";
import { convertVisibilityToString } from "@/utils/memo";
import MemoActionMenu from "../../MemoActionMenu";
import { ReactionSelector } from "../../MemoReactionListView";
import UserAvatar from "../../UserAvatar";
import VisibilityIcon from "../../VisibilityIcon";
import { useMemoViewContext, useMemoViewDerived } from "../MemoViewContext";
import type { MemoHeaderProps } from "../types";

const MemoHeader: React.FC<MemoHeaderProps> = ({ showCreator, showVisibility, showPinned, onEdit, onGotoDetail, onUnpin }) => {
  const t = useTranslate();
  const [reactionSelectorOpen, setReactionSelectorOpen] = useState(false);

  const { memo, creator, currentUser, parentPage, isArchived, readonly } = useMemoViewContext();
  const { isInMemoDetailPage, commentAmount, relativeTimeFormat } = useMemoViewDerived();

  const displayTime = isArchived ? (
    (memo.displayTime ? timestampDate(memo.displayTime) : undefined)?.toLocaleString(i18n.language)
  ) : (
    <relative-time
      datetime={(memo.displayTime ? timestampDate(memo.displayTime) : undefined)?.toISOString()}
      lang={i18n.language}
      format={relativeTimeFormat}
    ></relative-time>
  );

  return (
    <div className="flex w-full flex-row items-center justify-between gap-2">
      <div className="flex w-auto max-w-[calc(100%-8rem)] grow flex-row items-center justify-start">
        {showCreator && creator ? (
          <CreatorDisplay creator={creator} displayTime={displayTime} onGotoDetail={onGotoDetail} />
        ) : (
          <TimeDisplay displayTime={displayTime} onGotoDetail={onGotoDetail} />
        )}
      </div>

      <div className="flex shrink-0 select-none flex-row items-center justify-end gap-2 rounded-full bg-white/60 px-2 py-1">
        {currentUser && !isArchived && (
          <ReactionSelector
            className={cn("border-none w-auto h-auto", reactionSelectorOpen && "block!", "block sm:hidden sm:group-hover:block")}
            memo={memo}
            onOpenChange={setReactionSelectorOpen}
          />
        )}

        {!isInMemoDetailPage && commentAmount > 0 && (
          <Link
            className={cn("flex flex-row justify-start items-center rounded-md px-1 hover:opacity-80 gap-0.5")}
            to={`/${memo.name}#comments`}
            viewTransition
            state={{ from: parentPage }}
          >
            <MessageCircleMoreIcon className="w-4 h-4 mx-auto text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{commentAmount}</span>
          </Link>
        )}

        {showVisibility && memo.visibility !== Visibility.PRIVATE && (
          <Tooltip>
            <TooltipTrigger>
              <span className="flex justify-center items-center rounded-md hover:opacity-80">
                <VisibilityIcon visibility={memo.visibility} />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {t(`memo.visibility.${convertVisibilityToString(memo.visibility).toLowerCase()}` as Parameters<typeof t>[0])}
            </TooltipContent>
          </Tooltip>
        )}

        {showPinned && memo.pinned && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-pointer">
                  <BookmarkIcon className="w-4 h-auto text-primary" onClick={onUnpin} />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("common.unpin")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <MemoActionMenu memo={memo} readonly={readonly} onEdit={onEdit} />
      </div>
    </div>
  );
};

interface CreatorDisplayProps {
  creator: User;
  displayTime: React.ReactNode;
  onGotoDetail: () => void;
}

const CreatorDisplay: React.FC<CreatorDisplayProps> = ({ creator, displayTime, onGotoDetail }) => (
  <div className="flex w-full flex-row items-center justify-start">
    <Link className="w-auto rounded-full transition-colors hover:opacity-80" to={`/u/${encodeURIComponent(creator.username)}`} viewTransition>
      <UserAvatar className="mr-3 shrink-0" avatarUrl={creator.avatarUrl} />
    </Link>
    <div className="flex w-full flex-col items-start justify-center">
      <Link
        className="block truncate rounded-md text-sm font-medium leading-tight text-[#4d4035] transition-colors hover:opacity-80"
        to={`/u/${encodeURIComponent(creator.username)}`}
        viewTransition
      >
        {creator.displayName || creator.username}
      </Link>
      <button
        type="button"
        className="mt-0.5 w-auto cursor-pointer select-none text-left text-xs leading-tight text-[#9b8979] transition-colors hover:opacity-80"
        onClick={onGotoDetail}
      >
        {displayTime}
      </button>
    </div>
  </div>
);

interface TimeDisplayProps {
  displayTime: React.ReactNode;
  onGotoDetail: () => void;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({ displayTime, onGotoDetail }) => (
  <button
    type="button"
    className="w-full cursor-pointer select-none text-left text-sm font-medium leading-tight text-[#8d7867] transition-colors hover:text-foreground"
    onClick={onGotoDetail}
  >
    {displayTime}
  </button>
);

export default MemoHeader;
