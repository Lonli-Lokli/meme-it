"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Copy, ExternalLink, Trash2 } from "lucide-react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LazyVideo } from "./LazyVideo";
import type { Meme } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { isVideoMeme } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { isAdmin } from "@/lib/firebase-utils";
import { useDeleteDialog } from '@/context/delete-dialog-context';

interface MemeCardProps {
  meme: Meme;
  isDetailView?: boolean;
}

export function MemeCard({ meme, isDetailView = false }: MemeCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [votes, setVotes] = useState({
    up: meme.upvotes || 0,
    down: meme.downvotes || 0,
  });
  const [isVoting, setIsVoting] = useState(false);
  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null);
  const { setMemeToDelete } = useDeleteDialog();

  const canDelete = isAdmin(user) || user?.uid === meme.authorId;

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (!loadedImg) {
        throw new Error("Image not loaded");
      }

      const canvas = document.createElement("canvas");
      canvas.width = loadedImg.naturalWidth;
      canvas.height = loadedImg.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(loadedImg, 0, 0);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, "image/png");
      });

      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      toast({
        description: "Media copied to clipboard",
      });
    } catch {
      toast({
        description: "Failed to copy media",
        variant: "destructive",
      });
    }
  };

  const handleVote = async (type: "up" | "down", e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking vote buttons

    if (!user) {
      toast({
        description: "Please sign in to vote",
        variant: "destructive",
      });
      return;
    }

    if (isVoting) return;

    setIsVoting(true);
    try {
      const memeRef = doc(db, "memes", meme.id);
      await updateDoc(memeRef, {
        [type === "up" ? "upvotes" : "downvotes"]: increment(1),
      });

      setVotes((prev) => ({
        ...prev,
        [type]: prev[type] + 1,
      }));
    } catch (error) {
      console.error("Vote error:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const MediaContent = () => (
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
            onLoad={e => setLoadedImg(e.currentTarget)}
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
          onLoad={e => setLoadedImg(e.currentTarget)}
        />
      )}

      {/* Copy button overlay */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 bg-black/25 hover:bg-black/40 hover:text-white/75 transition-all duration-200 ease-in-out"
        aria-label="Copy to clipboard"
      >
        <Copy className="h-4 w-4" />
      </button>
    </div>
  );

  const VoteActions = () => (
    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300" onClick={e => e.stopPropagation()}>
      {canDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMemeToDelete(meme);
          }}
          className="hover:text-red-400 transition-colors"
          title="Delete meme"
          type="button"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
      <div className="flex items-center gap-4 ml-auto">
        <button
          onClick={(e) => handleVote("up", e)}
          className="hover:text-slate-50"
        >
          [+]
        </button>
        <span>{votes.up - votes.down}</span>
        <button
          onClick={(e) => handleVote("down", e)}
          className="hover:text-slate-50"
        >
          [-]
        </button>
      </div>
    </div>
  );

  const CardContent = () => (
    <div className="bg-background/50 rounded-sm shadow-sm p-4">
      <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
        <span
            className="cursor-help"
            title={new Date(meme.createdAt).toLocaleString()}
          >
            {formatDistanceToNow(new Date(meme.createdAt), { addSuffix: true })}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const url = isDetailView ? meme.fileUrl : `/meme/${meme.id}`;
              window.open(url, '_blank', 'noopener,noreferrer');
            }}
            className="text-slate-300"
            title={isDetailView ? "View original file" : "Open in new tab"}
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>

        <MediaContent />
        <div className="mt-3">
          <VoteActions />
        </div>
      </div>
    );

  if (isDetailView) {
    return (
      <CardContent />
    );
  }

  return (
      <Link href={`/meme/${meme.id}`}>
        <CardContent />
      </Link>
  );
}
