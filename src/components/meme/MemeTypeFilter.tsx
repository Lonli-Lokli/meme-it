"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type MemeType = "all" | "image" | "video";

interface MemeTypeFilterProps {
  activeType: MemeType;
  onChange: (type: MemeType) => void;
}

export function MemeTypeFilter({ activeType, onChange }: MemeTypeFilterProps) {
  const router = useRouter();

  const handleChange = (type: MemeType) => {
    onChange(type);
    router.push(`/?type=${type}`, { scroll: false });
  };

  return (
    <div className="flex gap-2 mb-4">
      <Button 
        variant={activeType === "all" ? "default" : "outline"}
        onClick={() => handleChange("all")}
        size="sm"
      >
        All
      </Button>
      <Button 
        variant={activeType === "image" ? "default" : "outline"}
        onClick={() => handleChange("image")}
        size="sm"
      >
        Images
      </Button>
      <Button 
        variant={activeType === "video" ? "default" : "outline"}
        onClick={() => handleChange("video")}
        size="sm"
      >
        Videos
      </Button>
    </div>
  );
} 