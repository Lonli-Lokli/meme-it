// src/components/meme/MemeGrid.tsx
import { Meme } from '@/types'
import { MemeCard } from './MemeCard'

interface MemeGridProps {
  memes: Meme[]
}

export function MemeGrid({ memes }: MemeGridProps) {
  if (memes.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        No memes found. Be the first to upload one!
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {memes.map((meme) => (
        <MemeCard key={meme.id} meme={meme} isDetailView={false} />
      ))}
    </div>
  )
}