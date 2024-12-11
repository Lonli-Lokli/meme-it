'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

interface LazyVideoProps {
  src: string;
  thumbnailUrl: string;
  className?: string;
}

export function LazyVideo({ src, thumbnailUrl, className = '' }: LazyVideoProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleClick = () => {
    setIsVideoLoaded(true);
    // Small delay to allow video to load
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(console.error);
      }
    }, 0);
  };

  if (!isVideoLoaded) {
    return (
      <div 
        className="relative cursor-pointer group" 
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <Image
          src={thumbnailUrl}
          alt=""
          width={800}
          height={600}
          className={`${className} object-contain`}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-12 h-12 text-white" />
        </div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      controls
      playsInline
      preload="auto"
    />
  );
}