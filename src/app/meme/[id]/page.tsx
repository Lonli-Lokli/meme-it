// src/app/meme/[id]/page.tsx
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MemeView } from './MemeView';
import type { Meme } from '@/types';

// This is a Server Component
export default async function MemePage({ params }: { params: { id: string } }) {
  const memeRef = doc(db, 'memes', params.id);
  const memeSnap = await getDoc(memeRef);
  
  if (!memeSnap.exists()) {
    return <div>Meme not found</div>;
  }

  const meme = {
    id: memeSnap.id,
    ...memeSnap.data()
  } as Meme;

  return <MemeView meme={meme} />;
}