// src/components/meme/ShareMenu.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Link, Share, ClipboardCopy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { Meme } from "@/types";
import { createAbsoluteMemeUrl } from "@/lib/utils";
import { useState } from "react";
import { captureException } from "@sentry/nextjs";

interface ShareMenuProps {
  meme: Meme;
}

export function ShareMenu({ meme }: ShareMenuProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const [isSharing, setIsSharing] = useState(false);

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

  const handleCopyImage = async () => {
    setIsSharing(true);
    try {
      const response = await fetch(meme.fileUrl);
      const blob = await response.blob();

      // Create a ClipboardItem
      const data = new ClipboardItem({
        [blob.type]: blob,
      });

      await navigator.clipboard.write([data]);

      toast({
        description: "Image copied to clipboard",
      });
    } catch (error) {
      captureException(error, {
        tags: {
          hint: 'Copy image error'
        }
      });
      toast({
        description: "Failed to copy image. Try copying the link instead.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleNativeShare = async (shareType: "url" | "image") => {
    if (!user) {
      handleUnauthorizedClick();
      return;
    }

    if (navigator.share) {
      if (shareType === "image") {
        setIsSharing(true);

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);

          const response = await fetch(meme.fileUrl, {
            signal: controller.signal,
          });

          const contentLength = response.headers.get("content-length");
          if (contentLength && parseInt(contentLength) > 50 * 1024 * 1024) {
            throw new Error(
              "File too large to share directly. Please share the link instead."
            );
          }

          const blob = await response.blob();
          clearTimeout(timeoutId);

          const cleanTitle = meme.title
            ? meme.title
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "-")
                .slice(0, 50)
            : meme.id;

          const url = new URL(meme.fileUrl);
          const pathname = url.pathname;
          let extension = pathname.split(".").pop()?.toLowerCase();
          if (!extension || extension.length > 4) {
            extension = blob.type.startsWith("video/") ? "mp4" : "png";
          }

          const filename = `meme-${cleanTitle}.${extension}`;
          const file = new File([blob], filename, { type: blob.type });

          await navigator.share({
            title: meme.title || "Check out this meme!",
            files: [file],
          });
        } catch (error) {
          if ((error as Error).name === "AbortError") {
            toast({
              description:
                "Sharing took too long. Try sharing the link instead.",
              variant: "destructive",
            });
          } else {
            toast({
              description:
                error instanceof Error ? error.message : "Failed to share",
              variant: "destructive",
            });
          }
        } finally {
          setIsSharing(false);
        }
      } else {
        await navigator.share({
          url: createAbsoluteMemeUrl(meme),
        });
      }
    }
  };

  const canCopyImage =
    typeof ClipboardItem !== "undefined" && navigator.clipboard?.write;

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
          <Link className="h-4 w-4 mr-2" />
          Copy Link
        </DropdownMenuItem>

        {canCopyImage && (
          <DropdownMenuItem 
            onClick={handleCopyImage}
            disabled={isSharing}
          >
            {isSharing ? (
              <>
                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Copying...
              </>
            ) : (
              <>
                <ClipboardCopy className="h-4 w-4 mr-2" />
                Copy Meme
              </>
            )}
          </DropdownMenuItem>
        )}

        {typeof navigator !== "undefined" &&
          typeof navigator.share !== "undefined" && (
            <DropdownMenuItem onClick={() => handleNativeShare("url")}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </DropdownMenuItem>
          )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
