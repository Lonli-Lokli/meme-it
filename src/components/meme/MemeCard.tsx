'use client';

import Link from 'next/link';
import { useState } from 'react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import type { Meme } from '@/types';

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

  const handleVote = async (type: 'up' | 'down') => {
    if (!user) {
      toast({
        description: "Please sign in to vote"
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

  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.toLocaleDateString('en-US')} at ${d.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  };

  const MediaContent = () => (
    <div>
      {meme.fileType === 'image' ? (
        <img
          src={meme.fileUrl}
          alt=""
          className="w-full h-auto"
          loading="lazy"
        />
      ) : (
        <video
          src={meme.fileUrl}
          className="w-full"
          controls
          muted
          preload="metadata"
        />
      )}
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
      <span className="text-slate-400">{formatDate(meme.createdAt)}</span>
      <div className="flex items-center gap-4 ml-auto">
        <button 
          onClick={(e) => {
            e.preventDefault();
            handleVote('up');
          }}
          className="hover:text-slate-900"
        >
          [+]
        </button>
        <span>{votes.up - votes.down}</span>
        <button 
          onClick={(e) => {
            e.preventDefault();
            handleVote('down');
          }}
          className="hover:text-slate-900"
        >
          [-]
        </button>
        {user && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              window.open(meme.fileUrl, '_blank');
            }}
            className="hover:text-slate-900"
          >
            [↓]
          </button>
        )}
      </div>
    </div>
  );

  const Card = () => (
    <div className={`${isDetailView ? "p-0" : "bg-white rounded-sm shadow-sm p-4"}`}>
      {isDetailView ? (
        <>
          <MediaContent />
          <div className="bg-white p-4">
            <VoteActions />
          </div>
        </>
      ) : (
        <>
          <MediaContent />
          <div className="mt-3">
            <VoteActions />
          </div>
        </>
      )}
    </div>
  );

  if (isDetailView) {
    return <Card />;
  }

  return (
    <div>
      <Card />
    </div>
  );
}