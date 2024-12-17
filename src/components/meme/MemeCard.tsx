import Link from "next/link";
import Image from "next/image";
import type { Meme } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { isVideoMeme } from "@/types";
import { MemeInteractions } from "./MemeInteractions";
import { ExternalLink } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";

interface MemeCardProps {
  meme: Meme;
  isDetailView: boolean;
}

const MemeCardTitle = ({ createdAt, memeId, isDetailView }: { 
  createdAt: string;
  memeId: string;
  isDetailView: boolean;
}) => (
  <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
    <span
      className="cursor-help"
      title={new Date(createdAt).toLocaleString()}
    >
      {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
    </span>
    {!isDetailView && (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.open(`/meme/${memeId}`, "_blank", "noopener,noreferrer");
        }}
        className="text-slate-300 hover:text-slate-50"
        title="Open in new tab"
      >
        <ExternalLink className="h-4 w-4" />
      </button>
    )}
  </div>
);

export function MemeCard({ meme, isDetailView }: MemeCardProps) {
  if (isDetailView) {
    return (
      <div className="bg-background/50 rounded-sm shadow-sm p-4">
        <MemeCardTitle createdAt={meme.createdAt} memeId={meme.id} isDetailView={isDetailView} />
        <MediaContent meme={meme} isDetailView={isDetailView} />
        <div className="mt-3">
          <MemeInteractions meme={meme} isDetailView={true} />
        </div>
      </div>
    );
  }

  return (
    <Link href={`/meme/${meme.id}`} prefetch={false} onClick={(e) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target instanceof HTMLVideoElement) {
        e.preventDefault();
        e.stopPropagation();
      }
    }}>
      <CardContent meme={meme} isDetailView={false} />
    </Link>
  );
}

const MediaContent = ({ meme, isDetailView }: MemeCardProps) => (
  <div className="relative">
    {isVideoMeme(meme) ? (
      <VideoPlayer
        fileUrl={meme.fileUrl}
        thumbnailUrl={meme.thumbnailUrl}
      />
    ) : (
      <Image
        src={isDetailView ? meme.fileUrl : meme.thumbnailUrl}
        alt=""
        width={isDetailView ? meme.width : 300}
        height={isDetailView ? meme.height : 300}
        className={`w-full ${!isDetailView && "aspect-square"} object-cover`}
        placeholder="blur"
        blurDataURL={meme.thumbnailUrl}
      />
    )}
  </div>
);

const CardContent = ({ meme, isDetailView }: MemeCardProps) => (
  <div className="bg-background/50 rounded-sm shadow-sm p-4">
    <MemeCardTitle createdAt={meme.createdAt} memeId={meme.id} isDetailView={isDetailView} />
    <MediaContent meme={meme} isDetailView={isDetailView} />
    <div className="mt-3">
      <MemeInteractions meme={meme} isDetailView={isDetailView} />
    </div>
  </div>
);
