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

// Some videos (notably HEVC/H.265 recorded by modern Android phones) cannot be
// decoded by the mobile browser's <video> element. Rather than failing the
// whole upload, we time out and fall back to a generated placeholder so the
// original file still gets uploaded.
const VIDEO_PROCESSING_TIMEOUT = 15000;

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/jpeg",
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Failed to encode canvas")),
      type,
      quality
    );
  });
}

// Generic "video" placeholder used when the browser can't decode the video for
// a real thumbnail. Keeps thumbnailUrl/blurDataUrl non-empty so the grid and
// <video poster> still render.
async function generatePlaceholderThumbnail(): Promise<ProcessedMedia> {
  const canvas = document.createElement("canvas");
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#1f2937";
  ctx.fillRect(0, 0, 300, 300);
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.beginPath();
  ctx.moveTo(125, 105);
  ctx.lineTo(125, 195);
  ctx.lineTo(200, 150);
  ctx.closePath();
  ctx.fill();

  const thumbnail = await canvasToBlob(canvas);

  const blurCanvas = document.createElement("canvas");
  blurCanvas.width = 10;
  blurCanvas.height = 10;
  const blurCtx = blurCanvas.getContext("2d")!;
  blurCtx.fillStyle = "#1f2937";
  blurCtx.fillRect(0, 0, 10, 10);
  const blurDataUrl = blurCanvas.toDataURL("image/jpeg", 0.5);

  return { thumbnail, blurDataUrl };
}

async function generateVideoThumbnail(file: File): Promise<ProcessedMedia> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    let settled = false;

    const timeoutId = setTimeout(
      () => fail(new Error("Video processing timed out")),
      VIDEO_PROCESSING_TIMEOUT
    );

    const cleanup = () => {
      clearTimeout(timeoutId);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("error", handleError);
      URL.revokeObjectURL(video.src);
    };

    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(
        error instanceof Error ? error : new Error("Failed to process video")
      );
    };

    const succeed = (result: ProcessedMedia) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };

    const handleError = () => {
      // The <video> element fires an opaque error event when it can't decode
      // the file (common with Android HEVC). No useful detail is available.
      fail(new Error("Failed to process video"));
    };

    const handleLoadedData = async () => {
      try {
        if (!video.videoWidth || !video.videoHeight) {
          throw new Error("Video has no decodable dimensions");
        }

        // Seek slightly into the video to land on a real frame. Seeking to 0
        // when currentTime is already 0 never fires "seeked" on most browsers,
        // so use a small offset and a timeout fallback.
        const duration = Number.isFinite(video.duration) ? video.duration : 0;
        const seekTime = duration > 0 ? Math.min(0.1, duration / 2) : 0;
        if (seekTime > 0) {
          await new Promise<void>((seekResolve) => {
            let seeked = false;
            const onSeeked = () => {
              if (seeked) return;
              seeked = true;
              video.removeEventListener("seeked", onSeeked);
              seekResolve();
            };
            video.addEventListener("seeked", onSeeked);
            video.currentTime = seekTime;
            setTimeout(onSeeked, 3000);
          });
        }

        canvas.width = 300;
        canvas.height = 300;
        const scale = Math.max(300 / video.videoWidth, 300 / video.videoHeight);
        const scaledWidth = video.videoWidth * scale;
        const scaledHeight = video.videoHeight * scale;
        const x = (300 - scaledWidth) / 2;
        const y = (300 - scaledHeight) / 2;
        ctx.drawImage(video, x, y, scaledWidth, scaledHeight);

        const thumbnail = await canvasToBlob(canvas);

        canvas.width = 10;
        canvas.height = 10;
        ctx.drawImage(video, 0, 0, 10, 10);
        const blurDataUrl = canvas.toDataURL("image/jpeg", 0.5);

        succeed({
          thumbnail,
          blurDataUrl,
          metadata: {
            width: video.videoWidth,
            height: video.videoHeight,
            duration: duration || undefined,
          },
        });
      } catch (error) {
        fail(error);
      }
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("error", handleError);

    // preload="auto" so the first frame is actually decoded on Android
    // (preload="metadata" often never fires "loadeddata" there).
    video.preload = "auto";
    video.playsInline = true;
    video.muted = true;
    video.src = URL.createObjectURL(file);
    video.load();
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
    let processed: ProcessedMedia;
    if (isVideo) {
      try {
        processed = await generateVideoThumbnail(file);
      } catch (thumbnailError) {
        // The browser couldn't decode this video (e.g. Android HEVC). Don't
        // block the upload — keep the original file and use a placeholder
        // thumbnail so it can still be played on devices that support it.
        captureException(thumbnailError, {
          level: "warning",
          tags: {
            hint: "Video thumbnail fallback",
          },
        });
        processed = await generatePlaceholderThumbnail();
      }
    } else {
      processed = await generateImageThumbnail(file);
    }

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
        hint: "Media processing error",
      },
    });
    throw new Error("Failed to process and upload media");
  }
}
