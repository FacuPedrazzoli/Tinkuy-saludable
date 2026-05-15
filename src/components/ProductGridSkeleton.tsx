export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" role="status" aria-label={`Cargando ${count} productos`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden border border-primary-100">
          <div className="bg-cream-100 h-44 animate-pulse" />
          <div className="p-3.5 space-y-3">
            <div className="h-4 bg-neutral-200 rounded animate-pulse w-3/4" />
            <div className="flex justify-between">
              <div className="h-6 bg-neutral-200 rounded animate-pulse w-1/3" />
              <div className="h-4 bg-neutral-200 rounded animate-pulse w-1/4" />
            </div>
            <div className="flex gap-1.5">
              <div className="h-8 bg-neutral-200 rounded animate-pulse flex-1" />
              <div className="h-8 bg-neutral-200 rounded animate-pulse flex-1" />
              <div className="h-8 bg-neutral-200 rounded animate-pulse flex-1" />
              <div className="h-8 bg-neutral-200 rounded animate-pulse flex-1" />
            </div>
            <div className="h-10 bg-neutral-200 rounded-xl animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}