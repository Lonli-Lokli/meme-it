'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { uploadMeme } from '@/lib/upload-utils';

interface FileWithPreview {
  file: File;
  preview: string | null;
  uploading: boolean;
  error?: string;
}

export function UploadForm() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const createPreview = async (file: File): Promise<string | null> => {
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    } else if (file.type === 'video/mp4') {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    const newFiles = await Promise.all(
      selectedFiles.map(async (file) => ({
        file,
        preview: await createPreview(file),
        uploading: false
      }))
    );

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (fileWithPreview: FileWithPreview, index: number) => {
    if (fileWithPreview.uploading) return;

    setFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, uploading: true, error: undefined } : f
    ));

    try {
      await uploadMeme(fileWithPreview.file);
      // Remove successfully uploaded file from the list
      setFiles(prev => prev.filter((_, i) => i !== index));
    } catch (err) {
        console.log(err);
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, uploading: false, error: err instanceof Error ? err.message : 'Upload failed' } : f
      ));
    }
  };

  const uploadAll = async () => {
    await Promise.all(
      files.map((file, index) => uploadFile(file, index))
    );
    if (files.every(f => !f.error)) {
      router.push('/');
      router.refresh();
    }
  };

  const PreviewContent = ({ file, preview }: { file: File, preview: string | null }) => {
    if (file.type.startsWith('image/')) {
      return (
        <img 
          src={preview!} 
          alt="Preview" 
          className="w-full h-full object-contain"
        />
      );
    } else if (file.type === 'video/mp4') {
      return (
        <video 
          src={preview!}
          ref={videoRef}
          className="w-full h-full object-contain"
          controls
          muted
          loop
        />
      );
    }
    return null;
  };

  return (
    <Card className="max-w-3xl mx-auto p-6">
      <form onSubmit={(e) => { e.preventDefault(); uploadAll(); }} className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-4 text-center">
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*, video/mp4"
            className="hidden"
            id="file-upload"
            multiple
          />
          <label 
            htmlFor="file-upload" 
            className="cursor-pointer block"
          >
            {files.length === 0 ? (
              <div className="py-8">
                <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <span className="text-sm text-slate-500">
                  Click to upload images or videos (Max 30MB each)
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {files.map((fileWithPreview, index) => (
                  <div key={index} className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden group">
                    <PreviewContent file={fileWithPreview.file} preview={fileWithPreview.preview} />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 p-1 bg-slate-900/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {fileWithPreview.uploading && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <div className="loading-spinner" />
                      </div>
                    )}
                    {fileWithPreview.error && (
                      <div className="absolute bottom-0 inset-x-0 bg-red-500 text-white text-xs p-1">
                        {fileWithPreview.error}
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {fileWithPreview.file.name}
                    </div>
                  </div>
                ))}
                <div className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-500 transition-colors">
                  <Upload className="h-8 w-8" />
                </div>
              </div>
            )}
          </label>
        </div>

        {files.length > 0 && (
          <Button 
            type="submit" 
            className="w-full"
            disabled={files.every(f => f.uploading)}
          >
            {files.some(f => f.uploading) 
              ? 'Uploading...' 
              : `Upload ${files.length} Meme${files.length > 1 ? 's' : ''}`
            }
          </Button>
        )}
      </form>
    </Card>
  );
}