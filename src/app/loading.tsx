export default function Loading() {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-muted rounded-lg" />
              <div className="mt-2 h-4 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }