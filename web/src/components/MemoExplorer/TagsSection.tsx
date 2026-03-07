import { HashIcon, MoreVerticalIcon, TagsIcon } from "lucide-react";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { Switch } from "@/components/ui/switch";
import { type MemoFilter, useMemoFilterContext } from "@/contexts/MemoFilterContext";
import { cn } from "@/lib/utils";
import { useTranslate } from "@/utils/i18n";
import TagTree from "../TagTree";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface Props {
  readonly?: boolean;
  tagCount: Record<string, number>;
}

const TagsSection = (props: Props) => {
  const t = useTranslate();
  const { getFiltersByFactor, addFilter, removeFilter } = useMemoFilterContext();
  const [treeMode, setTreeMode] = useLocalStorage<boolean>("tag-view-as-tree", false);
  const [treeAutoExpand, setTreeAutoExpand] = useLocalStorage<boolean>("tag-tree-auto-expand", false);

  const tags = Object.entries(props.tagCount)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .sort((a, b) => b[1] - a[1]);

  const handleTagClick = (tag: string) => {
    const isActive = getFiltersByFactor("tagSearch").some((filter: MemoFilter) => filter.value === tag);
    if (isActive) {
      removeFilter((f: MemoFilter) => f.factor === "tagSearch" && f.value === tag);
    } else {
      // Remove all existing tag filters first, then add the new one
      removeFilter((f: MemoFilter) => f.factor === "tagSearch");
      addFilter({
        factor: "tagSearch",
        value: tag,
      });
    }
  };

  return (
    <div className="mt-4 flex h-auto w-full shrink-0 flex-col items-start rounded-[24px] border border-[rgba(150,124,102,0.12)] bg-white/55 px-3 py-3 backdrop-blur">
      <div className="mb-2 flex w-full select-none flex-row items-center justify-between gap-1 text-sm leading-6 text-muted-foreground">
        <span className="font-medium text-[#7b6958]">{t("common.tags")}</span>
        {tags.length > 0 && (
          <Popover>
            <PopoverTrigger>
              <MoreVerticalIcon className="w-4 h-auto shrink-0 text-muted-foreground cursor-pointer hover:text-foreground" />
            </PopoverTrigger>
            <PopoverContent align="end" alignOffset={-12}>
              <div className="w-auto flex flex-row justify-between items-center gap-2 p-1">
                <span className="text-sm shrink-0">{t("common.tree-mode")}</span>
                <Switch checked={treeMode} onCheckedChange={(checked) => setTreeMode(checked)} />
              </div>
              <div className="w-auto flex flex-row justify-between items-center gap-2 p-1">
                <span className="text-sm shrink-0">{t("common.auto-expand")}</span>
                <Switch disabled={!treeMode} checked={treeAutoExpand} onCheckedChange={(checked) => setTreeAutoExpand(checked)} />
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
      {tags.length > 0 ? (
        treeMode ? (
          <TagTree tagAmounts={tags} expandSubTags={!!treeAutoExpand} />
        ) : (
          <div className="relative flex w-full flex-row items-center justify-start gap-x-2 gap-y-2 flex-wrap">
            {tags.map(([tag, amount]) => {
              const isActive = getFiltersByFactor("tagSearch").some((filter: MemoFilter) => filter.value === tag);
              return (
                <div
                  key={tag}
                  className={cn(
                    "flex w-auto max-w-full shrink-0 cursor-pointer flex-row items-center justify-start rounded-full border px-2.5 py-1 text-sm leading-6 transition-colors",
                    isActive
                      ? "border-[rgba(143,111,88,0.18)] bg-[#f0e3d4] text-primary"
                      : "border-[rgba(150,124,102,0.12)] bg-[#fbf7f2] text-muted-foreground hover:bg-[#f5ede4]",
                  )}
                  onClick={() => handleTagClick(tag)}
                >
                  <HashIcon className="w-4 h-auto shrink-0" />
                  <div className="inline-flex flex-nowrap ml-0.5 gap-0.5 max-w-[calc(100%-16px)]">
                    <span className={cn("truncate", isActive ? "font-medium" : "")}>{tag}</span>
                    {amount > 1 && <span className="opacity-60 shrink-0">({amount})</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        !props.readonly && (
          <div className="p-2 border border-dashed rounded-md flex flex-row justify-start items-start gap-2 text-muted-foreground">
            <TagsIcon className="w-5 h-5 shrink-0" />
            <p className="text-sm leading-snug italic">{t("tag.create-tags-guide")}</p>
          </div>
        )
      )}
    </div>
  );
};

export default TagsSection;
