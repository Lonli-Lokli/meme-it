'use client';

import { useEffect, useState } from 'react';
import { MemeGrid } from '@/components/meme/MemeGrid';
import { NavigationTabs } from '@/components/navigation/NavigationTabs';
import type { Meme } from '@/types';
import { useSearchParams, useRouter } from 'next/navigation';
import { getMemesByPage } from '@/lib/firebase-utils';
import { Button } from '@/components/ui/button';

const MEMES_PER_PAGE = 12;

export default function HomePage() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMemes, setTotalMemes] = useState(0);
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
  const sort = searchParams.get('sort') || 'new';
  const router = useRouter();

  useEffect(() => {
    async function loadMemes() {
      setLoading(true);
      const { memes: newMemes, total } = await getMemesByPage(currentPage, sort);
      setMemes(newMemes);
      setTotalMemes(total);
      setLoading(false);
    }
    loadMemes();
  }, [currentPage, sort]);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    const params = new URLSearchParams(searchParams);
    params.set('page', nextPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div>
      <NavigationTabs totalMemes={totalMemes} perPage={MEMES_PER_PAGE} />
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <MemeGrid memes={memes} />
          <div className="text-center py-8">
            {memes.length < totalMemes ? (
              <Button
                onClick={handleLoadMore}
                disabled={loading}
                variant="outline"
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            ) : (
              <div className="text-slate-500">
                You&apos;ve reached the end!
              </div>
            )}
          </div>
        </>
      )}
      
    </div>
  );
}