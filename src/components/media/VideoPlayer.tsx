"use client";

import { useState, useRef } from "react";
import { Play } from "lucide-react";
import { LazyVideo } from "./LazyVideo";

interface VideoPlayerProps {
  fileUrl: string;
  thumbnailUrl: string;
}

export function VideoPlayer({ fileUrl, thumbnailUrl }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    videoRef.current?.play();
  };

  return (
    <div className="relative">
      {!isPlaying && (
        <button
          type="button"
          onClick={handlePlayClick}
          aria-label="Play video"
          className="absolute inset-0 z-10 flex items-center justify-center"
        >
          <div className="bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors">
            <Play className="w-8 h-8 text-white" fill="white" />
          </div>
        </button>
      )}
      <LazyVideo
        ref={videoRef}
        src={fileUrl}
        thumbnailUrl={thumbnailUrl}
        className="w-full"
        controls
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
} 