"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/auth-context";
import type { Meme } from "@/types";
import { formatDate } from "@/types";
import Link from 'next/link';

interface MemeCardProps {
  meme: Meme;
  isFullPage?: boolean;
}

export function MemeCard({ meme }: MemeCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isVoting, setIsVoting] = useState(false);
  const [votes, setVotes] = useState({
    up: meme.upvotes || 0,
    down: meme.downvotes || 0,
  });

  const handleVote = async (type: "up" | "down") => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to vote on memes",
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

      toast({
        title: "Vote Recorded",
        description: `Successfully ${
          type === "up" ? "upvoted" : "downvoted"
        } the meme`,
      });
    } catch (error) {
      console.error("Vote error:", error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Link href={`/meme/${meme.id}`}>
      <Card className="overflow-hidden relative group">
        <div className="aspect-square relative bg-slate-100">
          {meme.fileType === "image" ? (
            <img
              src={meme.fileUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <video
              src={meme.fileUrl}
              className="absolute inset-0 w-full h-full object-cover"
              controls
              muted
              preload="metadata"
            />
          )}
        </div>

        {/* Date and Votes overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between text-white">
            <p className="text-sm">{formatDate(meme.createdAt)}</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleVote("up")}
                disabled={isVoting}
                className="flex items-center gap-1 opacity-90 hover:opacity-100 transition-opacity"
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="text-sm">{votes.up}</span>
              </button>
              <button
                onClick={() => handleVote("down")}
                disabled={isVoting}
                className="flex items-center gap-1 opacity-90 hover:opacity-100 transition-opacity"
              >
                <ThumbsDown className="h-4 w-4" />
                <span className="text-sm">{votes.down}</span>
              </button>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
