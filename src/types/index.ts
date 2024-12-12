// src/types/index.ts

interface BaseMeme {
  id: string;
  authorId?: string;
  createdAt: string;
  createdBy: string | null;
  upvotes: number;
  downvotes: number;
  fileUrl: string;        // Original file URL
  thumbnailUrl: string;   // 300x300 thumbnail URL
  blurDataUrl: string;    // Base64 tiny image for loading placeholder
}

export interface ImageMeme extends BaseMeme {
  fileType: 'image';
  width: number;
  height: number;
  sizes?: {
    small: string;  // 300px width
    medium: string; // 600px width
    large: string;  // 1200px width
  };
}

export interface VideoMeme extends BaseMeme {
  fileType: 'video';
  duration: number;
  width: number;
  height: number;
  posterUrl: string; // static poster image for video
}

export type Meme = ImageMeme | VideoMeme;

export interface MediaProcessingProgress {
  stage: 'processing' | 'uploading';
  progress: number;
  fileName: string;
}

export interface MediaUploadResult {
  fileUrl: string;
  thumbnailUrl: string;
  blurDataUrl: string;
  duration?: number;
  width?: number;
  height?: number;
}

// Type guards
export function isVideoMeme(meme: Meme): meme is VideoMeme {
  return meme.fileType === 'video';
}

export function isImageMeme(meme: Meme): meme is ImageMeme {
  return meme.fileType === 'image';
}

export type UserRole = 'user' | 'admin' | 'owner';

export interface MemeUser {
  uid: string;
  email: string | null;
  role: UserRole;
}