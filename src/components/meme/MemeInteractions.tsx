// src/components/meme/MemeInteractions.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { addVote, getVote } from "@/lib/firebase-utils";
import type { Meme, Vote, VoteType } from "@/types";
import { MemeVoteOverlay } from "@/components/meme/MemeVoteOverlay";
import { useToast } from "@/hooks/use-toast";

interface MemeInteractionsProps {
  meme: Meme;
}

type VoteCount = {
  upvotes: number;
  downvotes: number;
};

type VoteCountKey = `${VoteType}s`;

export function MemeInteractions({ meme }: MemeInteractionsProps) {
  const { user } = useAuth();
  const [currentVote, setCurrentVote] = useState<Vote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [voteCount, setVoteCount] = useState<VoteCount>({
    upvotes: meme.upvotes,
    downvotes: meme.downvotes
  });
  const [showOverlay, setShowOverlay] = useState<"upvote" | "downvote" | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      getVote(meme.id, user.uid).then(setCurrentVote);
    }
  }, [meme.id, user]);

  const handleVote = async (type: VoteType, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking vote buttons
    if (!user) {
      toast({
        description: "Please sign in to vote",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Show overlay animation
      setShowOverlay(type);
      setTimeout(() => setShowOverlay(null), 700);

      const voteKey: VoteCountKey = `${type}s`;
      if (currentVote?.type === type) {
        // Removing vote
        setVoteCount(prev => ({
          ...prev,
          [voteKey]: prev[voteKey] - 1
        }));
      } else if (currentVote) {
        // Changing vote
        const currentVoteKey: VoteCountKey = `${currentVote.type}s`;
        setVoteCount(prev => ({
          ...prev,
          [currentVoteKey]: prev[currentVoteKey] - 1,
          [voteKey]: prev[voteKey] + 1
        }));
      } else {
        // New vote
        setVoteCount(prev => ({
          ...prev,
          [voteKey]: prev[voteKey] + 1
        }));
      }

      await addVote(meme.id, type);
      const newVote = await getVote(meme.id, user.uid);
      setCurrentVote(newVote);
    } catch (error) {
      console.error("Error voting:", error);
      // Revert vote counts on error
      setVoteCount({
        upvotes: meme.upvotes,
        downvotes: meme.downvotes
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center gap-4">
      <MemeVoteOverlay 
        type={showOverlay === "upvote" ? "upvote" : "downvote"}
        show={showOverlay !== null}
      />
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => handleVote("downvote", e)}
          disabled={isLoading}
          data-active={currentVote?.type === "downvote"}
          className="data-[active=true]:text-red-500 hover:text-red-500 transition-colors"
        >
          <X className="w-4 h-4 mr-1" />
          {voteCount.downvotes}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => handleVote("upvote", e)}
          disabled={isLoading}
          data-active={currentVote?.type === "upvote"}
          className="data-[active=true]:text-green-500 hover:text-green-500 transition-colors"
        >
          <Heart className="w-4 h-4 mr-1" />
          {voteCount.upvotes}
        </Button>
      </div>
    </div>
  );
}
