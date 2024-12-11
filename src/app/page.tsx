'use client';

import { useEffect, useState } from 'react';
import { MemeGrid } from '@/components/meme/MemeGrid';
import { NavigationTabs } from '@/components/navigation/NavigationTabs';
import type { Meme } from '@/types';
import { useSearchParams } from 'next/navigation';
import { getMemesByPage } from '@/lib/firebase-utils';

const MEMES_PER_PAGE = 12;

export default function HomePage() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMemes, setTotalMemes] = useState(0);
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
  const sort = searchParams.get('sort') || 'new';

  useEffect(() => {
    async function loadMemes() {
      setLoading(true);
      const { memes, total } = await getMemesByPage(currentPage, sort);
      setMemes(memes);
      setTotalMemes(total);
      setLoading(false);
    }
    loadMemes();
  }, [currentPage, sort]);

  return (
    <div>
      <NavigationTabs totalMemes={totalMemes} perPage={MEMES_PER_PAGE} />
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
        </div>
      ) : (
        <MemeGrid memes={memes} />
      )}
    </div>
  );
}