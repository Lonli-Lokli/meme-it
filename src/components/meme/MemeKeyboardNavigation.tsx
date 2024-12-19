"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown } from "lucide-react";
import { getAdjacentMemes } from "@/lib/firebase-utils";
import type { Meme, ValidSort, ValidType } from "@/types";
import { Button } from "../ui/button";
import { createRelativeMemeUrl } from "@/lib/utils";

interface MemeKeyboardNavigationProps {
  memeId: string;
  sort: ValidSort;
  type: ValidType;
  direction: 'prev' | 'next';
}

export function MemeKeyboardNavigation({
  memeId,
  sort,
  type,
  direction
}: MemeKeyboardNavigationProps) {
  const router = useRouter();
  // Update touch handlers for vertical swipes
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);

  const [adjacentMemes, setAdjacentMemes] = useState<{
    prev: Meme | null;
    next: Meme | null;
  }>({ prev: null, next: null });

  const navigateToMeme = useCallback(
    (meme: Meme | null) => {
      if (meme) {
        router.push(createRelativeMemeUrl(meme, sort, type));
      }
    },
    [router, sort, type]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          navigateToMeme(adjacentMemes.prev);
          break;
        case "ArrowDown":
          navigateToMeme(adjacentMemes.next);
          break;
        case "ArrowLeft":
          // Handle downvote
          break;
        case "ArrowRight":
          // Handle upvote
          break;
        case "Escape":
          router.push("/");
          break;
      }
    },
    [adjacentMemes, navigateToMeme, router]
  );

  const handleTouchStart = (e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      const verticalDiff = touchStartY.current - touchEndY;
      const horizontalDiff = touchStartX.current - touchEndX;

      // Determine if the swipe was more horizontal or vertical
      if (Math.abs(horizontalDiff) > Math.abs(verticalDiff)) {
        // Horizontal swipe - handle voting
        if (Math.abs(horizontalDiff) > 50) {
          if (horizontalDiff > 0) {
            // Swipe left - downvote
            // Add vote handling here
          } else {
            // Swipe right - upvote
            // Add vote handling here
          }
        }
      } else {
        // Vertical swipe - handle navigation
        if (Math.abs(verticalDiff) > 50) {
          if (verticalDiff > 0) {
            // Swipe up - next meme
            navigateToMeme(adjacentMemes.next);
          } else {
            // Swipe down - previous meme
            navigateToMeme(adjacentMemes.prev);
          }
        }
      }
    },
    [adjacentMemes, navigateToMeme]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleKeyDown, handleTouchEnd]);

  useEffect(() => {
    getAdjacentMemes(memeId, sort, type)
      .then(setAdjacentMemes)
      .catch(console.error);
  }, [memeId, sort, type]);

  const handlePrevious = () => {
    navigateToMeme(adjacentMemes.prev);
  };

  const handleNext = () => {
    navigateToMeme(adjacentMemes.next);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => direction === 'prev' ? handlePrevious() : handleNext()}
      disabled={direction === 'prev' ? !adjacentMemes.prev : !adjacentMemes.next}
    >
      {direction === 'prev' ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      )}
    </Button>
  );
}
