// src/config/media.ts

// File size limits in bytes
export const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB

// Supported media types
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
] as const;

export const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm'
] as const;

export const SUPPORTED_MEDIA_TYPES = [
  ...SUPPORTED_IMAGE_TYPES,
  ...SUPPORTED_VIDEO_TYPES
] as const;

// Type utils
export type SupportedImageType = typeof SUPPORTED_IMAGE_TYPES[number];
export type SupportedVideoType = typeof SUPPORTED_VIDEO_TYPES[number];
export type SupportedMediaType = typeof SUPPORTED_MEDIA_TYPES[number];