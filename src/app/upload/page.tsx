import { UploadForm } from '@/components/meme/UploadForm';

export default function UploadPage() {
  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Upload Memes</h1>
          <p className="text-muted-foreground">
            Share your favorite memes with the community.
          </p>
        </div>

        <div className="rounded-lg border bg-card">
          <UploadForm />
        </div>
      </div>
    </div>
  );
}