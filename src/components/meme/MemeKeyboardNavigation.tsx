"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { getAdjacentMemes } from "@/lib/firebase-utils";
import type { Meme, ValidSort, ValidType } from "@/types";
import { Button } from "../ui/button";
import { createRelativeMemeUrl } from "@/lib/utils";
import { captureException } from "@sentry/nextjs";

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
      .catch(err => captureException(err, {
        tags: {
          hint: 'Adjacent mems loading failed'
        }
      }));
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
      aria-label={direction === 'prev' ? 'Previous meme' : 'Next meme'}
      onClick={() => direction === 'prev' ? handlePrevious() : handleNext()}
      disabled={direction === 'prev' ? !adjacentMemes.prev : !adjacentMemes.next}
      className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-sm shadow-md"
    >
      {direction === 'prev' ? (
        <ChevronLeft className="h-7 w-7 md:h-10 md:w-10" />
      ) : (
        <ChevronRight className="h-7 w-7 md:h-10 md:w-10" />
      )}
    </Button>
  );
}
