import type { Meme, ValidType, ValidSort } from "@/types";
import { MemeCard } from "./MemeCard";

interface MemeGridProps {
  memes: Meme[];
  currentSort: ValidSort;
  currentType: ValidType;
}

export function MemeGrid({ memes, currentSort, currentType }: MemeGridProps) {
  if (memes.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        No memes found. Be the first to upload one!
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {memes.map((meme) => (
        <div 
          key={meme.id} 
          className="bg-card rounded-lg overflow-hidden border dark:border-slate-700 border-border shadow-sm"
        >
          <MemeCard
            meme={meme}
            isDetailView={false}
            currentSort={currentSort}
            currentType={currentType}
          />
        </div>
      ))}
    </div>
  );
}
