export function CartSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" role="status" aria-label={`Cargando ${count} productos del carrito`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-neutral-50 rounded-xl animate-pulse">
          <div className="w-20 h-20 bg-neutral-200 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-neutral-200 rounded w-3/4" />
            <div className="h-4 bg-neutral-200 rounded w-1/2" />
            <div className="flex gap-3 mt-2">
              <div className="h-8 w-8 bg-neutral-200 rounded" />
              <div className="h-8 w-8 bg-neutral-200 rounded" />
              <div className="h-8 w-8 bg-neutral-200 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function OrderSummarySkeleton() {
  return (
    <div className="bg-white p-6 rounded-xl border border-neutral-100 sticky top-24">
      <div className="h-6 bg-neutral-200 rounded w-1/3 animate-pulse mb-4" />
      <div className="space-y-3 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-14 h-14 bg-neutral-200 rounded-lg" />
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-neutral-200 rounded w-3/4" />
              <div className="h-3 bg-neutral-200 rounded w-1/2" />
            </div>
            <div className="h-4 bg-neutral-200 rounded w-16" />
          </div>
        ))}
      </div>
      <div className="border-t border-neutral-100 pt-4 space-y-2">
        <div className="flex justify-between">
          <div className="h-4 bg-neutral-200 rounded w-20" />
          <div className="h-4 bg-neutral-200 rounded w-16" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-neutral-200 rounded w-16" />
          <div className="h-4 bg-neutral-200 rounded w-20" />
        </div>
        <div className="flex justify-between pt-2 border-t border-neutral-100">
          <div className="h-6 bg-neutral-200 rounded w-16" />
          <div className="h-6 bg-neutral-200 rounded w-24" />
        </div>
      </div>
    </div>
  )
}