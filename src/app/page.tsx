import { MemeGrid } from '@/components/meme/MemeGrid'
import { getMemes } from '@/lib/firebase-utils'

export default async function Home() {
  const { memes } = await getMemes();

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-xl font-medium">Latest Memes</h1>
        {/* We'll implement filtering later */}
      </div>
      <MemeGrid memes={memes} />
    </div>
  )
}