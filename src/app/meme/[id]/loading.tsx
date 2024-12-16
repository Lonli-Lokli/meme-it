// src/app/meme/[id]/loading.tsx
export default function Loading() {
    return (
      <div className="max-w-[800px] mx-auto px-4">
        <div className="bg-background/50 rounded-sm shadow-sm p-4">
          <div className="animate-pulse bg-muted aspect-square" />
        </div>
      </div>
    );
  }