'use client';

// src/app/meme/[id]/MemeView.tsx
import { Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MemeCard } from '@/components/meme/MemeCard';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import type { Meme } from '@/types';

interface MemeViewProps {
  meme: Meme;
}

export function MemeView({ meme }: MemeViewProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(`${window.location.origin}/meme/${meme.id}`)}
          >
            <Share className="h-4 w-4 mr-2" />
            Share Page
          </Button>
          {user && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(meme.fileUrl)}
            >
              <Share className="h-4 w-4 mr-2" />
              Share Direct Link
            </Button>
          )}
        </div>
      </div>

      <MemeCard meme={meme} isDetailView={true} />
    </div>
  );
}