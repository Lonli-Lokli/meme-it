import Link from "next/link";
import Image from "next/image";
import { LazyVideo } from "./LazyVideo";
import type { Meme } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { isVideoMeme } from "@/types";
import { MemeInteractions } from "./MemeInteractions";

interface MemeCardProps {
  meme: Meme;
  isDetailView: boolean;
}

export function MemeCard({ meme, isDetailView }: MemeCardProps) {
  if (isDetailView) {
    return (
      <div className="bg-background/50 rounded-sm shadow-sm p-4">
        <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
          <span
            className="cursor-help"
            title={new Date(meme.createdAt).toLocaleString()}
          >
            {formatDistanceToNow(new Date(meme.createdAt), { addSuffix: true })}
          </span>
        </div>

        <div className="relative">
          {isVideoMeme(meme) ? (
            <LazyVideo
              src={meme.fileUrl}
              thumbnailUrl={meme.thumbnailUrl}
              className="w-full"
            />
          ) : (
            <Image
              src={meme.fileUrl}
              alt=""
              width={meme.width}
              height={meme.height}
              className="w-full object-cover"
              priority={true}
              placeholder={meme.blurDataUrl ? "blur" : undefined}
              blurDataURL={meme.blurDataUrl}
            />
          )}
        </div>
        <div className="mt-3">
          <MemeInteractions meme={meme} isDetailView={true} />
        </div>
      </div>
    );
  }

  return (
    <Link href={`/meme/${meme.id}`} prefetch={false}>
      <CardContent meme={meme} isDetailView={false} />
    </Link>
  );
}

const MediaContent = ({ meme, isDetailView }: MemeCardProps) => {
  return (
    <div className="relative">
      {isVideoMeme(meme) ? (
        isDetailView ? (
          <LazyVideo
            src={meme.fileUrl}
            thumbnailUrl={meme.thumbnailUrl}
            className="w-full"
          />
        ) : (
          <Image
            src={meme.thumbnailUrl}
            alt=""
            width={300}
            height={300}
            className="w-full aspect-square object-cover"
            placeholder={meme.blurDataUrl ? "blur" : undefined}
            blurDataURL={meme.blurDataUrl}
          />
        )
      ) : (
        <Image
          src={isDetailView ? meme.fileUrl : meme.thumbnailUrl}
          alt=""
          width={isDetailView ? meme.width : 300}
          height={isDetailView ? meme.height : 300}
          className={`w-full ${!isDetailView && "aspect-square"} object-cover`}
          placeholder={meme.blurDataUrl ? "blur" : undefined}
          blurDataURL={meme.blurDataUrl}
        />
      )}
    </div>
  );
};

const CardContent = ({ meme, isDetailView }: MemeCardProps) => (
  <div className="bg-background/50 rounded-sm shadow-sm p-4">
    <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
      <span
        className="cursor-help"
        title={new Date(meme.createdAt).toLocaleString()}
      >
        {formatDistanceToNow(new Date(meme.createdAt), { addSuffix: true })}
      </span>
    </div>

    <MediaContent meme={meme} isDetailView={isDetailView} />
    <div className="mt-3">
      <MemeInteractions meme={meme} isDetailView={isDetailView} />
    </div>
  </div>
);
