"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";
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
        case "ArrowLeft":
          navigateToMeme(adjacentMemes.prev);
          break;
        case "ArrowRight":
          navigateToMeme(adjacentMemes.next);
          break;
        case "Escape":
          router.push("/");
          break;
      }
    },
    [adjacentMemes, navigateToMeme, router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

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
        <ChevronLeft className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </Button>
  );
}
