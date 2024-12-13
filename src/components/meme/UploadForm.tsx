"use client";

// src/components/meme/UploadForm.tsx
import { useCallback, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { processAndUploadMedia } from "@/lib/media-processing";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { MAX_FILE_SIZE, SUPPORTED_MEDIA_TYPES } from "@/config/media";
import { writeBatch, doc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UploadingFile {
  file: File;
  preview: string;
  status: "waiting" | "processing" | "uploading" | "done" | "error";
  error?: string;
}

const validateFile = (file: File): string | null => {
  if (file.size > MAX_FILE_SIZE) {
    return `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`;
  }
  if (!SUPPORTED_MEDIA_TYPES.includes(file.type as any)) {
    return `Unsupported file type: ${file.type}`;
  }
  return null;
};

export function UploadForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const createPreview = useCallback(async (file: File): Promise<string> => {
    if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.currentTime = 0;
        };
        video.onseeked = () => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(video, 0, 0);
          URL.revokeObjectURL(video.src);
          resolve(canvas.toDataURL());
        };
        video.src = URL.createObjectURL(file);
      });
    }
    return URL.createObjectURL(file);
  }, []);

  const handleFiles = useCallback(async (files: File[]) => {
    const newFiles = await Promise.all(
      files.map(async (file) => {
        const error = validateFile(file);
        return {
          file,
          preview: error ? "" : await createPreview(file),
          status: error ? "error" : "waiting",
          error,
        } as UploadingFile;
      })
    );

    setUploadingFiles((prev) => [...prev, ...newFiles]);
  }, [createPreview]);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer?.files || []);
    handleFiles(files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (dropZone) {
      dropZone.addEventListener('drop', handleDrop);
      dropZone.addEventListener('dragover', handleDragOver);
      dropZone.addEventListener('dragleave', handleDragLeave);

      return () => {
        dropZone.removeEventListener('drop', handleDrop);
        dropZone.removeEventListener('dragover', handleDragOver);
        dropZone.removeEventListener('dragleave', handleDragLeave);
      };
    }
  }, [handleDrop, handleDragOver, handleDragLeave]);

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = Array.from(e.clipboardData?.items || []);
    const files = items
      .filter(item => item.kind === 'file')
      .map(item => item.getAsFile())
      .filter((file): file is File => file !== null);

    if (files.length > 0) {
      await handleFiles(files);
    }
  }, [handleFiles]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const removeFile = useCallback((index: number) => {
    setUploadingFiles((prev) => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  }, []);

  const uploadFile = async (fileData: UploadingFile, index: number) => {
    try {
      setUploadingFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: "processing" } : f))
      );

      await processAndUploadMedia(fileData.file);

      setUploadingFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: "done" } : f))
      );

      return true;
    } catch (error) {
      setUploadingFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                status: "error",
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : f
        )
      );
      return false;
    }
  };

  const handleUpload = async () => {
    if (isUploading) return;
    setIsUploading(true);

    try {
      const filesToUpload = uploadingFiles.filter(
        (f) => f.status === "waiting"
      );
      const results = await Promise.all(
        filesToUpload.map((fileData, index) => uploadFile(fileData, index))
      );

      // Update total count in one batch
      const batch = writeBatch(db);
      batch.set(
        doc(db, "stats", "memes"),
        { totalMemes: increment(filesToUpload.length) },
        { merge: true }
      );
      await batch.commit();

      if (results.every((success) => success)) {
        toast({
          description: "All files uploaded successfully",
        });
        router.push("/");
        router.refresh();
      } else {
        toast({
          description: "Some files failed to upload",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        description: "Upload failed",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleMobilePaste = useCallback(async () => {
    try {
      if (!('clipboard' in navigator)) {
        toast({
          description: "Clipboard functionality is not available in your browser",
          variant: "destructive",
        });
        return;
      }

      const clipboardItems = await navigator.clipboard.read();
      let handled = false;

      for (const item of clipboardItems) {
        const imageType = item.types.find(type => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], 'pasted-image.png', { type: imageType });
          const error = validateFile(file);
          const newFile = {
            file,
            preview: error ? "" : await createPreview(file),
            status: error ? "error" : "waiting",
            error,
          } as UploadingFile;
          
          setUploadingFiles(prev => [...prev, newFile]);
          handled = true;
        }
      }

      if (!handled) {
        toast({
          description: "No image found in clipboard. Try copying an image first.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Paste error:', err);
      
      let errorMessage = 'Error reading clipboard: ';
      
      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError':
            errorMessage = 'Clipboard access denied. Please allow clipboard access and try again.';
            break;
          case 'SecurityError':
            errorMessage = 'Clipboard access blocked. Please check your browser settings.';
            break;
          case 'NotFoundError':
            errorMessage = 'No content found in clipboard.';
            break;
          default:
            errorMessage += err.message || 'Unknown clipboard error occurred.';
        }
      } else {
        errorMessage += err instanceof Error ? err.message : 'Unknown error occurred while reading clipboard.';
      }

      toast({
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [createPreview, toast]);

  return (
    <Card className="max-w-3xl mx-auto p-6">
      <div 
        ref={dropZoneRef}
        className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border'
        }`}
      >
        <input
          type="file"
          onChange={(e) => handleFiles(Array.from(e.target.files || []))}
          accept={SUPPORTED_MEDIA_TYPES.join(",")}
          className="hidden"
          id="file-upload"
          multiple
        />

        {uploadingFiles.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {uploadingFiles.map((fileData, index) => (
                <div
                  key={index}
                  className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden group"
                >
                  {fileData.preview && (
                    <div className="absolute inset-0">
                      <Image
                        src={fileData.preview}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Status overlay */}
                  {fileData.status !== "waiting" && (
                    <div
                      className={`absolute inset-0 flex items-center justify-center text-white text-sm
                      ${
                        fileData.status === "processing"
                          ? "bg-slate-900/50"
                          : fileData.status === "uploading"
                          ? "bg-slate-900/50"
                          : fileData.status === "error"
                          ? "bg-red-500/50"
                          : "bg-green-500/50"
                      }`}
                    >
                      {fileData.status === "error"
                        ? fileData.error
                        : fileData.status === "done"
                        ? "Done"
                        : fileData.status.charAt(0).toUpperCase() +
                          fileData.status.slice(1)}
                    </div>
                  )}

                  {/* Remove button */}
                  {fileData.status === "waiting" && (
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}

              {/* Add more button */}
              <label
                htmlFor="file-upload"
                className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-500 cursor-pointer"
              >
                <Upload className="h-8 w-8" />
              </label>
            </div>

            <Button
              onClick={handleUpload}
              className="w-full"
              disabled={isUploading || !uploadingFiles.some((f) => f.status === "waiting")}
            >
              {isUploading
                ? "Uploading..."
                : `Upload ${uploadingFiles.filter((f) => f.status === "waiting").length} files`}
            </Button>
          </>
        ) : (
          <div className="py-12 text-center space-y-4">
            <label htmlFor="file-upload" className="cursor-pointer block">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Drag & drop files here, or click to select
              </span>
            </label>

            <div className="text-sm text-muted-foreground space-y-2">
              <div className="md:block hidden">
                Press Ctrl+V or ⌘+V to paste from clipboard
              </div>
              
              <div className="md:hidden block">
                <button
                  onClick={handleMobilePaste}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <Clipboard className="h-4 w-4" />
                  <span>Paste from clipboard</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
