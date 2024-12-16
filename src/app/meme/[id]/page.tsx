import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MemeView } from "./MemeView";
import { notFound } from "next/navigation";
import type { Meme } from "@/types";
import { Metadata } from "next";
import { Suspense } from 'react';
import Loading from "./loading";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const searchParams = await params;
  const memeRef = doc(db, "memes", searchParams.id);
  const memeSnap = await getDoc(memeRef);

  if (!memeSnap.exists()) {
    return {
      title: "Meme not found",
    };
  }

  const meme = { id: memeSnap.id, ...memeSnap.data() } as Meme;
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/meme/${searchParams.id}`;

  const description = `Check out this amazing ${meme.fileType} meme on Meme It! Join our community to discover, share, and create the best memes. Share this meme with your friends and spread the laughter. #MemeIt #Memes #${meme.fileType}`;

  return {
    title: `Meme #${searchParams.id}`,
    description,
    openGraph: {
      title: `Meme #${searchParams.id}`,
      description,
      url,
      siteName: "Meme It!",
      type: meme.fileType === "video" ? "video.other" : "website",
      images: [{ 
        url: meme.fileType === "image" 
          ? meme.fileUrl 
          : meme.thumbnailUrl || '/default-thumbnail.jpg',
        width: meme.width || 1200,
        height: meme.height || 630,
        alt: `Meme #${searchParams.id}`,
      }],
      videos: meme.fileType === "video" ? [{
        url: meme.fileUrl,
        width: meme.width || 1280,
        height: meme.height || 720,
        type: "video/mp4",
      }] : undefined,
    },
    twitter: {
      card: meme.fileType === "video" ? "player" : "summary_large_image",
      title: `Meme #${searchParams.id}`,
      description: `View and share this meme on Meme It!`,
      images: meme.fileType === "image" ? [meme.fileUrl] : undefined,
    },
  };
}

export default async function MemePage({ params }: Props) {
  return (
    <Suspense fallback={<Loading />}>
      <MemeContent params={params} />
    </Suspense>
  );
}

async function MemeContent({ params }: Props) {
  const searchParams = await params;
  const memeRef = doc(db, "memes", searchParams.id);
  const memeSnap = await getDoc(memeRef);

  if (!memeSnap.exists()) {
    notFound();
  }

  const meme = {
    id: memeSnap.id,
    ...memeSnap.data(),
  } as Meme;

  return <MemeView meme={meme} />;
}
