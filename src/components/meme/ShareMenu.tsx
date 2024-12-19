// src/components/meme/ShareMenu.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { Meme } from "@/types";
import { createAbsoluteMemeUrl } from "@/lib/utils";

interface ShareMenuProps {
  meme: Meme;
}

const TwitterIcon = () => (
  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
  </svg>
);

const TelegramIcon = () => (
  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const NativeShareIcon = () => (
  <svg
    className="h-4 w-4 mr-2"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
  </svg>
);



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

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      createAbsoluteMemeUrl(meme)
    )}&text=${encodeURIComponent("Check out this meme!")}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      createAbsoluteMemeUrl(meme)
    )}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(
      createAbsoluteMemeUrl(meme)
    )}&text=${encodeURIComponent("Check out this meme!")}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(
      "Check out this meme!" + " " + createAbsoluteMemeUrl(meme)
    )}`,
  };

  const handleSocialShare = (url: string) => {
    if (!user) {
      handleUnauthorizedClick();
      return;
    }
    window.open(url, "_blank");
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
        {typeof navigator !== "undefined" &&
          typeof navigator.share !== "undefined" && (
            <DropdownMenuItem onClick={handleNativeShare}>
              <NativeShareIcon />
              Share to...
            </DropdownMenuItem>
          )}

        <DropdownMenuItem onClick={() => handleSocialShare(shareUrls.twitter)}>
          <TwitterIcon />
          Twitter
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleSocialShare(shareUrls.facebook)}>
          <FacebookIcon />
          Facebook
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleSocialShare(shareUrls.telegram)}>
          <TelegramIcon />
          Telegram
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleSocialShare(shareUrls.whatsapp)}>
          <WhatsAppIcon />
          WhatsApp
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
