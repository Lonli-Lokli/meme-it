// src/components/meme/MemeInteractions.tsx
"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Meme } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { isAdmin } from "@/lib/firebase-utils";
import { useDeleteDialog } from "@/context/delete-dialog-context";

interface MemeInteractionsProps {
  meme: Meme;
  isDetailView: boolean;
}

export function MemeInteractions({ meme }: MemeInteractionsProps) {
  const { setMemeToDelete } = useDeleteDialog();
  const { user } = useAuth();
  const [votes, setVotes] = useState({
    up: meme.upvotes || 0,
    down: meme.downvotes || 0,
  });
  const [isVoting, setIsVoting] = useState(false);
  const { toast } = useToast();

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

  const canDelete = user && (isAdmin(user) || user?.uid === meme.authorId);

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
      <div className="flex items-center gap-2">
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
      </div>
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
}
