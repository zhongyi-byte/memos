import { HashIcon, NotebookTextIcon, SparklesIcon } from "lucide-react";
import MemoActivityHeatmap from "@/components/MemoActivityHeatmap";

interface Props {
  memoCount: number;
  tagCount: number;
  activeDays: number;
  activityStats: Record<string, number>;
}

const items = [
  { key: "memos", label: "Memos", icon: NotebookTextIcon },
  { key: "tags", label: "Tags", icon: HashIcon },
  { key: "activeDays", label: "Active days (90d)", icon: SparklesIcon },
] as const;

const FlomoLikeDashboard = ({ memoCount, tagCount, activeDays, activityStats }: Props) => {
  const values: Record<(typeof items)[number]["key"], number> = {
    memos: memoCount,
    tags: tagCount,
    activeDays,
  };

  return (
    <div className="flex w-full flex-col gap-4 md:gap-5">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {items.map(({ key, label, icon: Icon }) => (
          <div
            key={key}
            className="rounded-[24px] border border-[#e8ddd1] bg-white/85 px-4 py-4 shadow-[0_16px_40px_rgba(120,98,76,0.07)] backdrop-blur"
          >
            <div className="mb-3 flex items-center gap-2 text-[#8b7868]">
              <div className="rounded-full bg-[#f4ede5] p-2">
                <Icon className="size-4" />
              </div>
              <span className="text-sm font-medium">{label}</span>
            </div>
            <p className="text-3xl font-semibold tracking-tight text-[#342c26]">{values[key].toLocaleString()}</p>
          </div>
        ))}
      </section>

      <MemoActivityHeatmap activityStats={activityStats} />
    </div>
  );
};

export default FlomoLikeDashboard;
