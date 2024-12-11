import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MemeView } from './MemeView';
import { notFound } from 'next/navigation';
import type { Meme } from '@/types';
import { Metadata } from 'next';

interface Props {
  params: Promise< { id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const searchParams = await params;
  const memeRef = doc(db, 'memes', searchParams.id);
  const memeSnap = await getDoc(memeRef);
  
  if (!memeSnap.exists()) {
    return {
      title: 'Meme not found'
    };
  }

  const meme = { id: memeSnap.id, ...memeSnap.data() } as Meme;
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/meme/${searchParams.id}`;

  return {
    title: `Meme #${searchParams.id}`,
    description: `View and share this meme on Meme It!`,
    openGraph: {
      title: `Meme #${searchParams.id}`,
      description: `View and share this meme on Meme It!`,
      url,
      siteName: 'Meme It!',
      type: meme.fileType === 'video' ? 'video.other' : 'website',
      images: meme.fileType === 'image' ? [{ url: meme.fileUrl }] : undefined,
      videos: meme.fileType === 'video' ? [{ url: meme.fileUrl }] : undefined,
    },
    twitter: {
      card: meme.fileType === 'video' ? 'player' : 'summary_large_image',
      title: `Meme #${searchParams.id}`,
      description: `View and share this meme on Meme It!`,
      images: meme.fileType === 'image' ? [meme.fileUrl] : undefined,
    },
  };
}

export default async function MemePage({ params }: Props) {
  const searchParams = await params;
  const memeRef = doc(db, 'memes', searchParams.id);
  const memeSnap = await getDoc(memeRef);
  
  if (!memeSnap.exists()) {
    notFound();
  }

  const meme = {
    id: memeSnap.id,
    ...memeSnap.data()
  } as Meme;

  return <MemeView meme={meme} />;
}