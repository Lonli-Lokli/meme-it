"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/navigation/Pagination";

const tabs = [
  { name: "New", value: "new" },
  { name: "Top", value: "top" },
  { name: "Random", value: "random" },
];

interface NavigationTabsProps {
  totalMemes: number;
  perPage: number;
}

export function NavigationTabs({ totalMemes, perPage }: NavigationTabsProps) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("sort") || "new";

  return (
    <div className="mb-6">
      <div className="flex gap-6 items-center">
      <div className="flex gap-6">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/?sort=${tab.value}`}
            className={cn(
              "py-2 text-[15px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
              tab.value === currentTab &&
                "border-b-[3px] border-slate-900 dark:border-white text-slate-900 dark:text-white"
            )}
          >
            {tab.name}
          </Link>
        ))}
      </div>
      <div className="ml-6 text-sm text-slate-600">
        <Pagination total={totalMemes} perPage={perPage} />
      </div>
      </div>
      <div className="h-px bg-slate-200 dark:bg-slate-800 -mt-px" />
    </div>
  );
}
