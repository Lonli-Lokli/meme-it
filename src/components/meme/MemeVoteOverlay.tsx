"use client";

import { Heart, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemeVoteOverlayProps {
  type: "upvote" | "downvote";
  show: boolean;
}

export function MemeVoteOverlay({ type, show }: MemeVoteOverlayProps) {
  return (
    <div className={cn(
      "absolute inset-0 flex items-center justify-center pointer-events-none",
      "transition-opacity duration-300",
      show ? "opacity-100" : "opacity-0"
    )}>
      <div className={cn(
        "transform transition-all duration-300",
        show ? "scale-100" : "scale-0",
        show && "animate-vote-overlay"
      )}>
        {type === "upvote" ? (
          <Heart className="w-32 h-32 text-green-500 fill-green-500" />
        ) : (
          <X className="w-32 h-32 text-red-500" />
        )}
      </div>
    </div>
  );
} 