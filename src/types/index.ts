// src/types/index.ts
export interface Meme {
  id: string;
  fileUrl: string;
  fileType: 'image' | 'video';
  // ISO 8601 UTC string format (e.g., "2024-12-10T15:30:00.000Z")
  createdAt: string;
  createdBy: string | null; // null for anonymous uploads
  upvotes: number;
  downvotes: number;
}

export interface Vote {
  userId: string;
  memeId: string;
  voteType: 'up' | 'down';
  // ISO 8601 UTC string format
  createdAt: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Utility type for creating new memes
export type CreateMemeInput = Omit<Meme, 'id' | 'upvotes' | 'downvotes'>;

// Helper function to get current UTC timestamp
export const getCurrentUTCTimestamp = (): string => 
  new Date().toISOString();

// Helper function to format date for display
export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};