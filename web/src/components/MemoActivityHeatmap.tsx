import dayjs from "dayjs";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface Props {
  activityStats: Record<string, number>;
  days?: number;
}

interface HeatmapDay {
  date: string;
  count: number;
}

const MONTH_LABEL_FORMAT = "MMM";
const DEFAULT_DAYS = 90;

const getHeatColor = (count: number, maxCount: number): string => {
  if (count <= 0 || maxCount <= 0) {
    return "rgba(196, 181, 164, 0.22)";
  }

  const intensity = count / maxCount;

  if (intensity >= 0.75) return "#9e7c64";
  if (intensity >= 0.45) return "#bea48c";
  if (intensity >= 0.2) return "#d8c8b7";
  return "#ece2d7";
};

const MemoActivityHeatmap = ({ activityStats, days = DEFAULT_DAYS }: Props) => {
  const today = dayjs().startOf("day");

  const { columns, maxCount, monthLabels, totalCount } = useMemo(() => {
    const start = today.subtract(days - 1, "day");
    const labels = new Map<number, string>();
    const dayList: HeatmapDay[] = [];
    let localMaxCount = 0;
    let total = 0;

    for (let index = 0; index < days; index += 1) {
      const current = start.add(index, "day");
      const date = current.format("YYYY-MM-DD");
      const count = activityStats[date] ?? 0;

      dayList.push({ date, count });
      localMaxCount = Math.max(localMaxCount, count);
      total += count;

      if (current.date() <= 7) {
        labels.set(Math.floor(index / 7), current.format(MONTH_LABEL_FORMAT));
      }
    }

    const paddedPrefix = start.day();
    const paddedDays = Array.from({ length: paddedPrefix }, (_, index) => {
      const current = start.subtract(paddedPrefix - index, "day");
      return { date: current.format("YYYY-MM-DD"), count: 0 };
    });

    const allDays = [...paddedDays, ...dayList];
    const columnCount = Math.ceil(allDays.length / 7);
    const grouped = Array.from({ length: columnCount }, (_, columnIndex) => allDays.slice(columnIndex * 7, columnIndex * 7 + 7));

    return {
      columns: grouped,
      maxCount: localMaxCount,
      monthLabels: Array.from(labels.entries()),
      totalCount: total,
    };
  }, [activityStats, days, today]);

  return (
    <section className="rounded-[28px] border border-[#e6ddd2] bg-white/80 p-4 shadow-[0_18px_50px_rgba(120,98,76,0.08)] backdrop-blur sm:p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#7b6958]">Activity</p>
          <h2 className="text-lg font-semibold text-[#382f28]">Last 90 days</h2>
        </div>
        <p className="text-xs text-[#9b8979]">{totalCount} memos captured</p>
      </div>

      <div className="mt-4 overflow-x-auto pb-1">
        <div className="inline-flex min-w-full gap-1.5">
          {columns.map((column, columnIndex) => (
            <div key={`column-${column[0]?.date ?? columnIndex}`} className="flex flex-col gap-1.5">
              {column.map((day) => (
                <div
                  key={day.date}
                  className={cn(
                    "h-3.5 w-3.5 rounded-[4px] border border-white/50 transition-transform hover:scale-110",
                    day.count > 0 && "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]",
                  )}
                  style={{ backgroundColor: getHeatColor(day.count, maxCount) }}
                  title={`${day.date}: ${day.count} memo${day.count === 1 ? "" : "s"}`}
                />
              ))}
              <span className="pt-0.5 text-center text-[10px] text-[#b3a190]">{monthLabels.find(([index]) => index === columnIndex)?.[1] ?? ""}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MemoActivityHeatmap;
