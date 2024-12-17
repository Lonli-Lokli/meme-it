'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { MemeGrid } from './MemeGrid';
import { Button } from '@/components/ui/button';
import type { Meme } from '@/types';

interface MemeClientWrapperProps {
  initialMemes: Meme[];
  initialTotal: number;
  sort: string;
  type: "all" | "image" | "video";
}

export function MemeClientWrapper({ initialMemes, initialTotal}: MemeClientWrapperProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = Number(searchParams.get('page')) || 1;

  const handleLoadMore = () => {
    if (initialMemes.length < initialTotal) {
      const params = new URLSearchParams(searchParams);
      params.set('page', (currentPage + 1).toString());
      router.push(`?${params.toString()}`);
    }
  };

  return (
    <>
      <MemeGrid memes={initialMemes} />
      <div className="text-center py-8">
        {initialMemes.length < initialTotal ? (
          <Button
            onClick={handleLoadMore}
            variant="outline"
          >
            Load More
          </Button>
        ) : (
          <div className="text-slate-500">
            You&apos;ve reached the end!
          </div>
        )}
      </div>
    </>
  );
} 