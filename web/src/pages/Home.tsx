import dayjs from "dayjs";
import FlomoLikeDashboard from "@/components/FlomoLikeDashboard";
import MemoView from "@/components/MemoView";
import PagedMemoList from "@/components/PagedMemoList";
import { useInstance } from "@/contexts/InstanceContext";
import { useFilteredMemoStats, useMemoFilters, useMemoSorting } from "@/hooks";
import { useFlomoLike } from "@/hooks/useFlomoLike";
import useCurrentUser from "@/hooks/useCurrentUser";
import { State } from "@/types/proto/api/v1/common_pb";
import { Memo } from "@/types/proto/api/v1/memo_service_pb";

const Home = () => {
  const user = useCurrentUser();
  const { isInitialized } = useInstance();

  const memoFilter = useMemoFilters({
    creatorName: user?.name,
    includeShortcuts: true,
    includePinned: true,
  });
  const { flomoLike } = useFlomoLike();
  const { statistics, tags } = useFilteredMemoStats({ userName: user?.name });

  const activeDays = Object.keys(statistics.activityStats).filter((date) => dayjs(date).isAfter(dayjs().subtract(90, "day"))).length;
  const memoCount = Object.values(statistics.activityStats).reduce((acc, value) => acc + value, 0);
  const heroName = user?.displayName || user?.username || "My notes";

  const { listSort, orderBy } = useMemoSorting({
    pinnedFirst: true,
    state: State.NORMAL,
  });

  return (
    <div className="w-full min-h-full bg-background text-foreground">
      <PagedMemoList
        renderer={(memo: Memo) => <MemoView key={`${memo.name}-${memo.displayTime}`} memo={memo} showVisibility showPinned compact />}
        listSort={listSort}
        orderBy={orderBy}
        filter={memoFilter}
        enabled={isInitialized}
        memoEditorClassName={flomoLike ? "mb-3 rounded-[24px] border border-[#e8ddd1] bg-white/95 p-3 shadow-[0_16px_40px_rgba(120,98,76,0.08)]" : "mb-2"}
        prefixElement={
          flomoLike ? (
            <div className="mb-4 flex w-full flex-col gap-4">
              <section className="rounded-[32px] border border-[#e6dbce] bg-[linear-gradient(135deg,rgba(255,253,249,0.96),rgba(245,236,226,0.82))] px-5 py-6 shadow-[0_22px_60px_rgba(120,98,76,0.08)] sm:px-7">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#a18b78]">Memos</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#342c26] sm:text-4xl">{heroName}</h1>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-[#7a6758] sm:text-[15px]">
                      快速记录，轻量整理，让想法像 flomo 一样自然流动。
                    </p>
                  </div>
                  <div className="rounded-full border border-[#eadfd2] bg-white/70 px-4 py-2 text-sm text-[#8d7867] shadow-[0_10px_24px_rgba(120,98,76,0.06)]">
                    {memoCount.toLocaleString()} memos captured
                  </div>
                </div>
              </section>

              <FlomoLikeDashboard
                memoCount={memoCount}
                tagCount={Object.keys(tags).length}
                activeDays={activeDays}
                activityStats={statistics.activityStats}
              />
            </div>
          ) : undefined
        }
      />
    </div>
  );
};

export default Home;
