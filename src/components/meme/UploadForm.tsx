"use client";

// src/components/meme/UploadForm.tsx
import { useCallback, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { processAndUploadMedia } from "@/lib/media-processing";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { MAX_FILE_SIZE, SUPPORTED_MEDIA_TYPES } from "@/config/media";
import { cn } from "@/lib/utils";
import { captureException } from "@sentry/nextjs";

interface UploadingFile {
  file: File;
  preview: string;
  status: "waiting" | "processing" | "uploading" | "done" | "error";
  error?: string;
  title?: string;
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
      try {
        const video = document.createElement("video");
        video.setAttribute("playsinline", "");
        video.setAttribute("webkit-playsinline", "");
        video.setAttribute("muted", "");
        video.setAttribute("preload", "metadata");
        video.setAttribute("type", file.type);

        // Check if browser can play this video format
        const canPlay = video.canPlayType(file.type);
        if (!canPlay) {
          throw new Error(`Browser cannot play video format: ${file.type}`);
        }

        return new Promise((resolve, reject) => {
          video.onloadedmetadata = () => {
            video.currentTime = 0;
          };
          video.onseeked = () => {
            try {
              const canvas = document.createElement("canvas");
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              const ctx = canvas.getContext("2d");
              if (!ctx) {
                throw new Error("Failed to get canvas context");
              }
              ctx.drawImage(video, 0, 0);
              URL.revokeObjectURL(video.src);
              resolve(canvas.toDataURL());
            } catch (error) {
              captureException(error, {
                tags: {
                  hint: "Error creating video preview",
                },
              });
              reject(error);
            }
          };
          video.onerror = (error) => {
            captureException(error, {
              tags: {
                hint: "Video loading error",
                details: typeof error === 'string' ? error : JSON.stringify(error)
              },
            });
            reject(new Error("Failed to load video for preview"));
          };
          video.src = URL.createObjectURL(file);
        });
      } catch (error) {
        captureException(error, {
          tags: {
            hint: "Error in video preview creation",
          },
        });
        // Fallback to a default video thumbnail or empty string
        return "";
      }
    }
    return URL.createObjectURL(file);
  }, []);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const newFiles = await Promise.all(
        files.map(async (file) => {
          const error = validateFile(file);
          if (error) {
            return {
              file,
              preview: "",
              status: "error",
              error,
            } as UploadingFile;
          }

          try {
            const preview = await createPreview(file);
            if (!preview && file.type.startsWith("video/")) {
              toast({
                description:
                  "Video preview generation failed. The video will still be uploaded.",
                variant: "default",
              });
            }
            return {
              file,
              preview: preview || "",
              status: "waiting",
            } as UploadingFile;
          } catch (error) {
            const errorMessage = file.type.startsWith("video/")
              ? `Failed to process video: ${
                  error instanceof Error ? error.message : "Unknown error"
                }. The video will still be uploaded.`
              : `Failed to create preview: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`;
            return {
              file,
              preview: "",
              status: "waiting", // Changed to waiting since we still want to upload the file
              error: errorMessage,
            } as UploadingFile;
          }
        })
      );

      setUploadingFiles((prev) => [...prev, ...newFiles]);
    },
    [createPreview, toast]
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer?.files || []);
      handleFiles(files);
    },
    [handleFiles]
  );

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
      dropZone.addEventListener("drop", handleDrop);
      dropZone.addEventListener("dragover", handleDragOver);
      dropZone.addEventListener("dragleave", handleDragLeave);

      return () => {
        dropZone.removeEventListener("drop", handleDrop);
        dropZone.removeEventListener("dragover", handleDragOver);
        dropZone.removeEventListener("dragleave", handleDragLeave);
      };
    }
  }, [handleDrop, handleDragOver, handleDragLeave]);

  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items || []);
      const files = items
        .filter((item) => item.kind === "file")
        .map((item) => item.getAsFile())
        .filter((file): file is File => file !== null);

      if (files.length > 0) {
        await handleFiles(files);
      }
    },
    [handleFiles]
  );

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
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

  const updateFileTitle = (index: number, title: string) => {
    setUploadingFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, title } : f))
    );
  };

  const uploadFile = async (fileData: UploadingFile, index: number) => {
    try {
      setUploadingFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: "processing" } : f))
      );

      await processAndUploadMedia(fileData.file, fileData.title);

      setUploadingFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: "done" } : f))
      );

      return true;
    } catch (error) {
      captureException(error, {
        tags: {
          hint: 'Upload failed'
        }
      });
      
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
      if (!("clipboard" in navigator)) {
        toast({
          description:
            "Clipboard functionality is not available in your browser",
          variant: "destructive",
        });
        return;
      }

      const clipboardItems = await navigator.clipboard.read();
      let handled = false;

      for (const item of clipboardItems) {
        const imageType = item.types.find((type) => type.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], "pasted-image.png", {
            type: imageType,
          });
          const error = validateFile(file);
          const newFile = {
            file,
            preview: error ? "" : await createPreview(file),
            status: error ? "error" : "waiting",
            error,
          } as UploadingFile;

          setUploadingFiles((prev) => [...prev, newFile]);
          handled = true;
        }
      }

      if (!handled) {
        toast({
          description:
            "No image found in clipboard. Try copying an image first.",
          variant: "destructive",
        });
      }
    } catch (err) {
      captureException(err, {
        tags: {
          hint: 'Paste error'
        }
      })

      let errorMessage = "Error reading clipboard: ";

      if (err instanceof DOMException) {
        switch (err.name) {
          case "NotAllowedError":
            errorMessage =
              "Clipboard access denied. Please allow clipboard access and try again.";
            break;
          case "SecurityError":
            errorMessage =
              "Clipboard access blocked. Please check your browser settings.";
            break;
          case "NotFoundError":
            errorMessage = "No content found in clipboard.";
            break;
          default:
            errorMessage += err.message || "Unknown clipboard error occurred.";
        }
      } else {
        errorMessage +=
          err instanceof Error
            ? err.message
            : "Unknown error occurred while reading clipboard.";
      }

      toast({
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [createPreview, toast]);

  const handleZoneClick = useCallback((e: React.MouseEvent) => {
    if (
      e.target instanceof HTMLButtonElement ||
      e.target instanceof HTMLInputElement ||
      (e.target instanceof HTMLElement &&
        (e.target.closest("button") || e.target.closest("input")))
    ) {
      return;
    }
    document.getElementById("file-upload")?.click();
  }, []);

  return (
    <div className="space-y-6">
      <div
        ref={dropZoneRef}
        onClick={handleZoneClick}
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-colors",
          "min-h-[300px] flex flex-col items-center justify-center p-8",
          "cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25",
          uploadingFiles.length > 0 ? "bg-muted/50" : "bg-background"
        )}
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
          <div className="w-full space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {uploadingFiles.map((fileData, index) => (
                <div key={index} className="space-y-2">
                  <div className="relative aspect-square rounded-md overflow-hidden bg-muted">
                    {fileData.preview && (
                      <Image
                        src={fileData.preview}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    )}
                    <div
                      className={cn(
                        "absolute inset-0 flex items-center justify-center",
                        "text-sm font-medium text-white transition-colors",
                        fileData.status === "error"
                          ? "bg-destructive/90"
                          : fileData.status === "done"
                          ? "bg-success/90"
                          : "bg-background/80"
                      )}
                    >
                      {fileData.status === "error"
                        ? fileData.error
                        : fileData.status === "done"
                        ? "Uploaded"
                        : fileData.status.charAt(0).toUpperCase() +
                          fileData.status.slice(1)}
                    </div>
                    {fileData.status === "waiting" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {fileData.status === "waiting" && (
                    <Input
                      type="text"
                      placeholder="Optional title"
                      value={fileData.title || ""}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateFileTitle(index, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm"
                    />
                  )}
                </div>
              ))}
              <label
                htmlFor="file-upload"
                className={cn(
                  "aspect-square rounded-md border-2 border-dashed",
                  "flex items-center justify-center cursor-pointer",
                  "text-muted-foreground hover:text-foreground",
                  "transition-colors hover:border-primary"
                )}
              >
                <Upload className="h-8 w-8" />
              </label>
            </div>

            <Button
              onClick={handleUpload}
              className="w-full"
              disabled={
                isUploading ||
                !uploadingFiles.some((f) => f.status === "waiting")
              }
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Uploading...</span>
                </div>
              ) : (
                `Upload ${
                  uploadingFiles.filter((f) => f.status === "waiting").length
                } files`
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="rounded-full bg-muted p-4 inline-block">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Drag & drop files here, or click to select
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMobilePaste();
                }}
                className="gap-2"
              >
                <Clipboard className="h-4 w-4" />
                Paste from clipboard
              </Button>
              <span className="text-sm text-muted-foreground">
                or press Ctrl+V
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>Supported formats: {SUPPORTED_MEDIA_TYPES.join(", ")}</p>
        <p>Maximum file size: {MAX_FILE_SIZE / (1024 * 1024)}MB</p>
      </div>
    </div>
  );
}
