import Image from "next/image";
import Link from "next/link";
import type { Meme, ValidSort, ValidType } from "@/types";
import { createRelativeMemeUrl } from "@/lib/utils";
import { VideoPlayer } from "@/components/media/VideoPlayer";

interface MemeContentProps {
  meme: Meme;
  isDetailView: boolean;
  currentSort: ValidSort;
  currentType: ValidType;
}

export function MemeContent({ meme, isDetailView, currentSort, currentType }: MemeContentProps) {
  if (!isDetailView) {
    return (
      <Link 
        href={createRelativeMemeUrl(meme, currentSort, currentType)} 
        className="block w-full h-full"
      >
        <div className="relative bg-black rounded-lg overflow-hidden h-full">
          {meme.fileType === 'video' ? (
            <VideoPlayer fileUrl={meme.fileUrl} thumbnailUrl={meme.thumbnailUrl} />
          ) : (
            <div className="relative h-full">
              <Image
                src={meme.fileUrl}
                alt=""
                width={meme.width || 500}
                height={meme.height || 500}
                className="object-contain w-full h-full max-h-[500px]"
                priority
              />
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <div className="relative bg-muted rounded-lg overflow-hidden w-full max-w-4xl mx-auto flex items-center justify-center h-full">
      {meme.fileType === 'video' ? (
        <VideoPlayer fileUrl={meme.fileUrl} thumbnailUrl={meme.thumbnailUrl} />
      ) : (
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={meme.fileUrl}
            alt=""
            width={meme.width || 800}
            height={meme.height || 600}
            className="w-full h-full object-contain pb-safe"
            priority
          />
        </div>
      )}
    </div>
  );
} 