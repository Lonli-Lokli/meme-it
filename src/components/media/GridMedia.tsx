'use client';

// src/components/media/GridMedia.tsx
import Image from 'next/image';
import { useState } from 'react';
import type { Meme } from '@/types';
import { isVideoMeme } from '@/types';

interface GridMediaProps {
  meme: Meme;
  priority?: boolean;
}

export function GridMedia({ meme, priority = false }: GridMediaProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="aspect-square relative overflow-hidden bg-slate-100">
      {/* Thumbnail/poster image */}
      <Image
        src={isVideoMeme(meme) ? meme.posterUrl : meme.thumbnailUrl}
        alt=""
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
        className={`object-cover duration-700 ease-in-out
          ${isLoading ? 'scale-110 blur-lg' : 'scale-100 blur-0'}`}
        onLoadingComplete={() => setIsLoading(false)}
        priority={priority}
      />
      
      {/* Video duration badge */}
      {isVideoMeme(meme) && (
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 rounded">
          {formatDuration(meme.duration)}
        </div>
      )}
    </div>
  );
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}