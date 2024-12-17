'use client';

import { forwardRef } from 'react';

interface LazyVideoProps {
  src: string;
  thumbnailUrl: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
}

export const LazyVideo = forwardRef<HTMLVideoElement, LazyVideoProps>(
  ({ src, thumbnailUrl, className, autoPlay, controls }, ref) => {
    return (
      <video 
        ref={ref}
        src={src} 
        className={className}
        poster={thumbnailUrl}
        autoPlay={autoPlay}
        controls={controls}
        loop
        playsInline
      />
    );
  }
);

LazyVideo.displayName = 'LazyVideo';