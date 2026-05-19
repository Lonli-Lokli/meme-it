import type { Meme } from "@/types";
import { MemeContent } from "./MemeContent";
import { MemeInteractions } from "./MemeInteractions";
import { MemeKeyboardNavigation } from "./MemeKeyboardNavigation";
import { ValidSort, ValidType } from "@/types";
import { MemeCardTitle } from "./MemeCardTitle";
import { ShareMenu } from "./ShareMenu";

interface MemeCardProps {
  meme: Meme;
  isDetailView: boolean;
  currentSort: ValidSort;
  currentType: ValidType;
}

export function MemeCard({
  meme,
  isDetailView,
  currentSort,
  currentType,
}: MemeCardProps) {
  return isDetailView ? (
    // Detail view - fixed positioning
    <div className="fixed inset-0 flex flex-col bg-background pt-12">
      <div className="p-4 w-full max-w-3xl mx-auto bg-gradient-to-b from-black/50 to-transparent">
        <MemeCardTitle meme={meme} />
      </div>
      
      <div className="relative flex-1 flex items-center justify-center w-full overflow-hidden">
        <div className="absolute left-1 md:left-4 top-1/2 -translate-y-1/2 z-50">
          <MemeKeyboardNavigation
            direction="prev"
            memeId={meme.id}
            sort={currentSort}
            type={currentType}
          />
        </div>

        <MemeContent
          meme={meme}
          isDetailView={isDetailView}
          currentSort={currentSort}
          currentType={currentType}
        />

        <div className="absolute right-1 md:right-4 top-1/2 -translate-y-1/2 z-50">
          <MemeKeyboardNavigation
            direction="next"
            memeId={meme.id}
            sort={currentSort}
            type={currentType}
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 h-16 px-4 z-50 bg-background/80">
        <MemeInteractions meme={meme} />
        <div className="md:hidden">
          <ShareMenu meme={meme} />
        </div>
      </div>
    </div>
  ) : (
    // Grid view - scrollable card
    <div className="flex flex-col bg-background h-full">
      <div className="p-4">
        <MemeCardTitle meme={meme} />
      </div>
      
      <div className="relative flex-1 flex items-center justify-center">
        <div className="max-h-[calc(100vh-16rem)] w-full flex items-center justify-center">
          <MemeContent
            meme={meme}
            isDetailView={isDetailView}
            currentSort={currentSort}
            currentType={currentType}
          />
        </div>
      </div>

      <div className="flex items-center justify-between h-16 px-4 bg-background/80 mt-auto">
        <MemeInteractions meme={meme} />
        <div className="md:hidden">
          <ShareMenu meme={meme} />
        </div>
      </div>
    </div>
  );
}
