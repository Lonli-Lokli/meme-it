'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Copy } from 'lucide-react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LazyVideo } from './LazyVideo';
import type { Meme } from '@/types';
import { isVideoMeme } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

interface MemeCardProps {
  meme: Meme;
  isDetailView?: boolean;
}

export function MemeCard({ meme, isDetailView = false }: MemeCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [votes, setVotes] = useState({ 
    up: meme.upvotes || 0, 
    down: meme.downvotes || 0 
  });
  const [isVoting, setIsVoting] = useState(false);

  const handleCopy = async () => {
    try {
      const response = await fetch(meme.fileUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      toast({
        description: "Media copied to clipboard",
      });
    } catch {
      toast({
        description: "Failed to copy media",
        variant: "destructive"
      });
    }
  };

  const handleVote = async (type: 'up' | 'down', e: React.MouseEvent) => {
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
      const memeRef = doc(db, 'memes', meme.id);
      await updateDoc(memeRef, {
        [type === 'up' ? 'upvotes' : 'downvotes']: increment(1)
      });
      
      setVotes(prev => ({
        ...prev,
        [type]: prev[type] + 1
      }));
    } catch (error) {
      console.error('Vote error:', error);
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
          />
        )
      ) : (
        <Image
          src={isDetailView ? meme.fileUrl : meme.thumbnailUrl}
          alt=""
          width={isDetailView ? 800 : 300}
          height={isDetailView ? 600 : 300}
          className={`w-full ${!isDetailView && 'aspect-square'} object-cover`}
          placeholder={meme.blurDataUrl ? "blur" : undefined}
          blurDataURL={meme.blurDataUrl}
        />
      )}
      
      {/* Copy button overlay */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
        aria-label="Copy to clipboard"
      >
        <Copy className="h-4 w-4" />
      </button>
    </div>
  );

  const VoteActions = () => (
    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
      <Link 
        href={`/meme/${meme.id}`} 
        className="text-slate-400 hover:text-slate-600 mr-2"
      >
        #{meme.id}
      </Link>
      <div className="flex items-center gap-4 ml-auto">
        <button 
          onClick={(e) => handleVote('up', e)}
          className="hover:text-slate-900"
        >
          [+]
        </button>
        <span>{votes.up - votes.down}</span>
        <button 
          onClick={(e) => handleVote('down', e)}
          className="hover:text-slate-900"
        >
          [-]
        </button>
      </div>
    </div>
  );

  const CardContent = () => (
    <div className="bg-background rounded-sm shadow-sm p-4">
      <MediaContent />
      <div className="mt-3">
        <VoteActions />
      </div>
    </div>
  );

  if (isDetailView) {
    return <CardContent />;
  }

  return (
    <Link href={`/meme/${meme.id}`}>
      <CardContent />
    </Link>
  );
}