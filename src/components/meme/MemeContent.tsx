import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import type { Meme, ValidSort, ValidType } from "@/types";
import { createRelativeMemeUrl } from "@/lib/utils";

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
            <>
              <div className="relative h-full">
                <Image
                  src={meme.thumbnailUrl || meme.fileUrl}
                  alt=""
                  width={meme.width || 500}
                  height={meme.height || 500}
                  className="object-contain w-full h-full max-h-[500px]"
                  priority
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="w-12 h-12 text-white" />
                </div>
              </div>
            </>
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
    <div className="relative bg-muted rounded-lg overflow-hidden w-full max-w-4xl mx-auto flex items-center justify-center">
      {meme.fileType === 'video' ? (
        <div className="w-full h-full max-h-[calc(100vh-12rem)] flex items-center justify-center">
          <video
            src={meme.fileUrl}
            controls
            playsInline
            className="w-full h-full object-contain"
            poster={meme.thumbnailUrl}
            style={{ maxHeight: 'calc(100vh - 12rem)' }}
          />
        </div>
      ) : (
        <div className="relative">
          <Image
            src={meme.fileUrl}
            alt=""
            width={meme.width || 800}
            height={meme.height || 600}
            className="w-full object-contain max-h-[calc(100vh-12rem)]"
            priority
          />
        </div>
      )}
    </div>
  );
} 