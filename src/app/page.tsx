'use client';

import { useEffect, useState } from 'react';
import { MemeGrid } from '@/components/meme/MemeGrid';
import { NavigationTabs } from '@/components/navigation/NavigationTabs';
import { collection, getDocs, orderBy, query, limit, startAfter } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Meme } from '@/types';
import { useSearchParams } from 'next/navigation';

const MEMES_PER_PAGE = 12;

export default function HomePage() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);  
  const [totalMemes, setTotalMemes] = useState(0);
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
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
            // Basic random implementation
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
          q = query(q, startAfter((currentPage - 1) * MEMES_PER_PAGE));
        }

        const snapshot = await getDocs(q);
        const memesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Meme[];

        setMemes(memesData);
        setHasMore(memesData.length === MEMES_PER_PAGE);

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
          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setCurrentPage(page => page + 1)}
                className="text-sm text-slate-500 hover:text-slate-900"
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}