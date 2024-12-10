export default function Loading() {
    return (
      <div>
        <div className="flex items-baseline justify-between mb-6">
          <div className="h-7 w-32 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-slate-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }