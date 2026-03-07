import { SearchIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useMemoFilterContext } from "@/contexts/MemoFilterContext";
import { cn } from "@/lib/utils";
import { useTranslate } from "@/utils/i18n";
import MemoDisplaySettingMenu from "./MemoDisplaySettingMenu";

const SearchBar = () => {
  const t = useTranslate();
  const { addFilter } = useMemoFilterContext();
  const [queryText, setQueryText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const onTextChange = (event: React.FormEvent<HTMLInputElement>) => {
    setQueryText(event.currentTarget.value);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmedText = queryText.trim();
      if (trimmedText !== "") {
        const words = trimmedText.split(/\s+/);
        words.forEach((word) => {
          addFilter({
            factor: "contentSearch",
            value: word,
          });
        });
        setQueryText("");
      }
    }
  };

  return (
    <div className="relative w-full h-auto flex flex-row justify-start items-center">
      <SearchIcon className="absolute left-3 w-4 h-auto opacity-50 text-sidebar-foreground" />
      <input
        className={cn(
          "w-full rounded-2xl border border-[rgba(150,124,102,0.16)] bg-white/70 py-2 pr-10 pl-10 text-sm leading-6 text-sidebar-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur",
        )}
        placeholder={t("memo.search-placeholder")}
        value={queryText}
        onChange={onTextChange}
        onKeyDown={onKeyDown}
        ref={inputRef}
      />
      <MemoDisplaySettingMenu className="absolute top-2 right-3 text-sidebar-foreground/70" />
    </div>
  );
};

export default SearchBar;
