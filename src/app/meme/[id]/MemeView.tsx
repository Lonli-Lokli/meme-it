'use client';

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
        description: "Link copied to clipboard",
      });
    });
  };

  return (
    <div className="max-w-[800px] mx-auto px-4">
      <div className="flex justify-center gap-4 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(`${window.location.origin}/meme/${meme.id}`)}
          className="text-slate-600 hover:text-slate-900"
        >
          Share Page
        </Button>
        {user && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(meme.fileUrl)}
            className="text-slate-600 hover:text-slate-900"
          >
            Share Direct Link
          </Button>
        )}
      </div>

      <MemeCard meme={meme} isDetailView={true} />
    </div>
  );
}