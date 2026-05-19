'use client';

import { forwardRef } from 'react';

interface LazyVideoProps {
  src: string;
  thumbnailUrl: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
}

export const LazyVideo = forwardRef<HTMLVideoElement, LazyVideoProps>(
  ({ src, thumbnailUrl, className, autoPlay, controls, onPlay, onPause }, ref) => {
    return (
      <video
        ref={ref}
        src={src}
        className={className}
        poster={thumbnailUrl}
        autoPlay={autoPlay}
        controls={controls}
        onPlay={onPlay}
        onPause={onPause}
        loop
        playsInline
      />
    );
  }
);

LazyVideo.displayName = 'LazyVideo';