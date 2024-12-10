'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, limit, startAfter } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MemeGrid } from '@/components/meme/MemeGrid';
import { NavigationTabs } from '@/components/navigation/NavigationTabs';
import { Pagination } from '@/components/navigation/Pagination';
import type { Meme } from '@/types';
import { useSearchParams } from 'next/navigation';

const MEMES_PER_PAGE = 12;

export default function Home() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [totalMemes, setTotalMemes] = useState(0);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
  const sort = searchParams.get('sort') || 'new';

  useEffect(() => {
    async function fetchMemes() {
      setLoading(true);
      try {
        const memesRef = collection(db, 'memes');
        let q;

        switch (sort) {
          case 'top':
            q = query(
              memesRef, 
              orderBy('upvotes', 'desc'),
              limit(MEMES_PER_PAGE)
            );
            break;
          case 'random':
            // Basic random implementation - could be improved
            q = query(
              memesRef,
              orderBy('createdAt'),
              limit(MEMES_PER_PAGE)
            );
            break;
          default: // 'new'
            q = query(
              memesRef,
              orderBy('createdAt', 'desc'),
              limit(MEMES_PER_PAGE)
            );
        }

        if (currentPage > 1) {
          // Add pagination
          q = query(q, startAfter((currentPage - 1) * MEMES_PER_PAGE));
        }

        const snapshot = await getDocs(q);
        const memesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Meme[];

        setMemes(memesData);

        // Get total count
        const countSnapshot = await getDocs(collection(db, 'memes'));
        setTotalMemes(countSnapshot.size);
      } catch (error) {
        console.error('Error fetching memes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMemes();
  }, [sort, currentPage]);

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
          <Pagination total={totalMemes} perPage={MEMES_PER_PAGE} />
        </>
      )}
    </div>
  );
}