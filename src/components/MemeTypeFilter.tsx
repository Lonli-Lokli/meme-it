"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageIcon, VideoIcon, LayoutGridIcon } from "lucide-react";

type MemeType = "all" | "image" | "video";

interface MemeTypeFilterProps {
  selectedType: MemeType;
  onChange: (type: MemeType) => void;
}

export function MemeTypeFilter({ selectedType, onChange }: MemeTypeFilterProps) {
  const filterOptions: { value: MemeType; label: string; icon: React.ReactNode }[] = [
    { value: "all", label: "All", icon: <LayoutGridIcon className="h-4 w-4" /> },
    { value: "image", label: "Images", icon: <ImageIcon className="h-4 w-4" /> },
    { value: "video", label: "Videos", icon: <VideoIcon className="h-4 w-4" /> },
  ];

  return (
    <div className="flex gap-2">
      {filterOptions.map((option) => (
        <Button
          key={option.value}
          variant="outline"
          size="sm"
          onClick={() => onChange(option.value)}
          className={cn(
            "min-w-[40px] md:min-w-[80px]",
            selectedType === option.value && "bg-primary text-primary-foreground"
          )}
        >
          {option.icon}
          <span className="hidden md:inline-block md:ml-2">{option.label}</span>
        </Button>
      ))}
    </div>
  );
} 