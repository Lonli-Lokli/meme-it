// src/types/index.ts

interface BaseMeme {
  id: string;
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
}

export interface VideoMeme extends BaseMeme {
  fileType: 'video';
  duration: number;
  width: number;
  height: number;
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