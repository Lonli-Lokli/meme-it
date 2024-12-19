import { Meme } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ShareMenu } from "./ShareMenu";
import { DeleteMemeButton } from "./DeleteMemeButton";

interface MemeCardTitleProps {
  meme: Meme;
}

export function MemeCardTitle({ meme }: MemeCardTitleProps) {
  const timeAgo = meme.createdAt
    ? formatDistanceToNow(new Date(meme.createdAt), { addSuffix: true })
    : "recently";

  return (
    <div className="flex items-center justify-between gap-2 p-3 border-b border-border bg-muted/50">
      <div className="flex items-center gap-2 min-w-0">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-medium truncate">
            {meme.title || "Untitled"}
          </h2>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <DeleteMemeButton meme={meme} />
        <ShareMenu meme={meme} />
      </div>
    </div>
  );
}
