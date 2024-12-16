import { MemeCard } from "@/components/meme/MemeCard";
import type { Meme } from "@/types";
import { ShareMenu } from "@/components/meme/ShareMenu";

interface MemeViewProps {
  meme: Meme;
}

export function MemeView({ meme }: MemeViewProps) {
  return (
    <div className="max-w-[800px] mx-auto px-4">
      <div className="flex justify-end mb-4">
        <ShareMenu meme={meme} />
      </div>

      <MemeCard meme={meme} isDetailView={true} />
    </div>
  );
}
