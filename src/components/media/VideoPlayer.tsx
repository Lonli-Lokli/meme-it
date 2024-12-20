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

  return (
    <div 
      className="relative" 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isPlaying) {
          setIsPlaying(true);
          videoRef.current?.play();
        }
      }}
    >
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors">
            <Play className="w-8 h-8 text-white" fill="white" />
          </div>
        </div>
      )}
      <LazyVideo
        ref={videoRef}
        src={fileUrl}
        thumbnailUrl={thumbnailUrl}
        className="w-full"
        autoPlay={isPlaying}
        controls={isPlaying}
      />
    </div>
  );
} 