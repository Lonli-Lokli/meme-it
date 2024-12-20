// src/components/meme/ShareMenu.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Copy, Link2, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { Meme } from "@/types";
import { createAbsoluteMemeUrl } from "@/lib/utils";

interface ShareMenuProps {
  meme: Meme;
}

export function ShareMenu({ meme }: ShareMenuProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleUnauthorizedClick = () => {
    toast({
      description: "Please sign in to share memes",
      variant: "destructive",
    });
  };

  const handleCopy = async () => {
    if (!user) {
      handleUnauthorizedClick();
      return;
    }

    try {
      await navigator.clipboard.writeText(createAbsoluteMemeUrl(meme));
      toast({
        description: "Link copied to clipboard",
      });
    } catch {
      toast({
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (!user) {
      handleUnauthorizedClick();
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this meme!",
          url: createAbsoluteMemeUrl(meme),
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast({
            description: "Failed to share",
            variant: "destructive",
          });
        }
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Link
        </DropdownMenuItem>

        {typeof navigator !== "undefined" &&
          typeof navigator.share !== "undefined" && (
            <DropdownMenuItem onClick={handleNativeShare}>
              <Link2 className="h-4 w-4 mr-2" />
              Share URL
            </DropdownMenuItem>
          )}

        {typeof navigator !== "undefined" &&
          typeof navigator.share !== "undefined" && (
            <DropdownMenuItem onClick={handleNativeShare}>
              <ImageIcon className="h-4 w-4 mr-2" />
              Share Image
            </DropdownMenuItem>
          )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
