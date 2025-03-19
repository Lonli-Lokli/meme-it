"use client";

// src/lib/media-processing.ts
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db, auth } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import type { MediaUploadResult } from "@/types";
import { MAX_FILE_SIZE, SUPPORTED_MEDIA_TYPES } from "@/config/media";
import { captureException } from "@sentry/nextjs";

interface ProcessedMedia {
  thumbnail: Blob;
  blurDataUrl: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
  };
}

async function generateImageThumbnail(file: File): Promise<ProcessedMedia> {
  const img = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  // Generate 300x300 thumbnail
  canvas.width = 300;
  canvas.height = 300;

  // Calculate dimensions to maintain aspect ratio with center crop
  const scale = Math.max(300 / img.width, 300 / img.height);
  const scaledWidth = img.width * scale;
  const scaledHeight = img.height * scale;
  const x = (300 - scaledWidth) / 2;
  const y = (300 - scaledHeight) / 2;

  ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

  // Generate thumbnail blob
  const thumbnailBlob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.8);
  });

  // Generate blur data URL (tiny image for loading placeholder)
  canvas.width = 10;
  canvas.height = 10;
  ctx.drawImage(img, 0, 0, 10, 10);
  const blurDataUrl = canvas.toDataURL("image/jpeg", 0.5);

  return {
    thumbnail: thumbnailBlob,
    blurDataUrl,
    metadata: {
      width: img.width,
      height: img.height,
    },
  };
}

async function generateVideoThumbnail(file: File): Promise<ProcessedMedia> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    const cleanup = () => {
      video.removeEventListener("loadedmetadata", handleMetadata);
      video.removeEventListener("error", handleError);
      URL.revokeObjectURL(video.src);
    };

    const handleError = () => {
      cleanup();
      reject(new Error("Failed to process video"));
    };

    const handleMetadata = async () => {
      try {
        // Set video to first frame
        video.currentTime = 0;
        await new Promise<void>((resolve) => {
          video.onseeked = () => resolve();
        });

        // Generate 300x300 thumbnail
        canvas.width = 300;
        canvas.height = 300;

        // Calculate dimensions for center crop
        const scale = Math.max(300 / video.videoWidth, 300 / video.videoHeight);
        const scaledWidth = video.videoWidth * scale;
        const scaledHeight = video.videoHeight * scale;
        const x = (300 - scaledWidth) / 2;
        const y = (300 - scaledHeight) / 2;

        ctx.drawImage(video, x, y, scaledWidth, scaledHeight);

        // Generate thumbnail
        const thumbnailBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.8);
        });

        // Generate blur placeholder
        canvas.width = 10;
        canvas.height = 10;
        ctx.drawImage(video, 0, 0, 10, 10);
        const blurDataUrl = canvas.toDataURL("image/jpeg", 0.5);

        cleanup();
        resolve({
          thumbnail: thumbnailBlob,
          blurDataUrl,
          metadata: {
            width: video.videoWidth,
            height: video.videoHeight,
            duration: video.duration,
          },
        });
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    video.addEventListener("loadedmetadata", handleMetadata);
    video.addEventListener("error", handleError);
    video.src = URL.createObjectURL(file);
  });
}

export async function processAndUploadMedia(
  file: File,
  title?: string
): Promise<MediaUploadResult> {
  // Validate file
  if (!file) {
    throw new Error("No file provided");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`
    );
  }

  if (!SUPPORTED_MEDIA_TYPES.includes(file.type as any)) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }

  try {
    // Process media based on type
    const isVideo = file.type.startsWith("video/");
    const processed = await (isVideo
      ? generateVideoThumbnail(file)
      : generateImageThumbnail(file));

    // Generate unique file names
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).slice(2);
    const extension = file.name.split(".").pop();
    const basePath = `memes/${timestamp}-${randomId}`;

    // Upload original file and thumbnail
    const [originalUpload, thumbnailUpload] = await Promise.all([
      uploadBytes(ref(storage, `${basePath}.${extension}`), file),
      uploadBytes(ref(storage, `${basePath}-thumb.jpg`), processed.thumbnail),
    ]);

    // Get download URLs
    const [fileUrl, thumbnailUrl] = await Promise.all([
      getDownloadURL(originalUpload.ref),
      getDownloadURL(thumbnailUpload.ref),
    ]);

    // Create database record
    const memeData = {
      fileUrl,
      thumbnailUrl,
      blurDataUrl: processed.blurDataUrl,
      fileType: isVideo ? "video" : "image",
      createdAt: new Date().toISOString(),
      ...(processed.metadata || {}),
      upvotes: 0,
      downvotes: 0,
      createdBy: auth.currentUser?.uid || null,
      title: title || null,
    };

    await addDoc(collection(db, "memes"), memeData);

    return {
      fileUrl,
      thumbnailUrl,
      blurDataUrl: processed.blurDataUrl,
      ...processed.metadata,
    };
  } catch (error) {
    captureException(error, {
      tags: {
        hint: 'Media processing error'
      }
    })
    throw new Error("Failed to process and upload media");
  }
}
