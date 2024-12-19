import Link from "next/link";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/navigation/Pagination";
import { Button } from "@/components/ui/button";
import { ImageIcon, VideoIcon, LayoutGridIcon, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MemeType = "all" | "image" | "video";

const tabs = [
  { name: "New", value: "new" },
  { name: "Top", value: "top" },
  { name: "Random", value: "random" },
];

const filterOptions: { value: MemeType; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All", icon: <LayoutGridIcon className="h-4 w-4" /> },
  { value: "image", label: "Images", icon: <ImageIcon className="h-4 w-4" /> },
  { value: "video", label: "Videos", icon: <VideoIcon className="h-4 w-4" /> },
];

interface NavigationTabsProps {
  totalMemes: number;
  perPage: number;
  currentSort: string;
  currentType: MemeType;
}

export function NavigationTabs({ totalMemes, perPage, currentSort, currentType }: NavigationTabsProps) {
  const currentFilter = filterOptions.find(opt => opt.value === currentType);

  return (
    <div className="sticky top-12 z-40 bg-background">
      <div className="flex items-center justify-between">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={`/?sort=${tab.value}&type=${currentType}`}
              className={cn(
                "py-2 text-[15px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
                tab.value === currentSort &&
                  "border-b-[3px] border-slate-900 dark:border-white text-slate-900 dark:text-white"
              )}
            >
              {tab.name}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {/* Mobile Dropdown */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="min-w-[40px]">
                  {currentFilter?.icon}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {filterOptions.map((option) => (
                  <DropdownMenuItem key={option.value} asChild>
                    <Link
                      href={`/?sort=${currentSort}&type=${option.value}`}
                      className="flex items-center"
                    >
                      {option.icon}
                      <span className="ml-2">{option.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* Desktop Buttons */}
          <div className="hidden md:flex gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant="ghost"
                size="sm"
                asChild
              >
                <Link
                  href={`/?sort=${currentSort}&type=${option.value}`}
                  className={cn(
                    "min-w-[80px]",
                    currentType === option.value && "bg-primary/10"
                  )}
                >
                  {option.icon}
                  <span className="ml-2">{option.label}</span>
                </Link>
              </Button>
            ))}
          </div>
          <div className="text-sm text-slate-600">
            <Pagination total={totalMemes} perPage={perPage} />
          </div>
        </div>
      </div>
    </div>
  );
}
