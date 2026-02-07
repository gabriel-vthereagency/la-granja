interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-surface-3/60 ${className}`}
    />
  )
}

export function CardSkeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-glass border border-glass-border rounded-xl p-5 space-y-3 ${className}`}
    >
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}

export function TableSkeleton({
  rows = 8,
  className = '',
}: SkeletonProps & { rows?: number }) {
  return (
    <div
      className={`bg-glass border border-glass-border rounded-xl overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 bg-surface-2/80">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-12 ml-auto" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-16" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 px-4 py-3 border-t border-glass-border"
          style={{ opacity: 1 - i * 0.08 }}
        >
          <Skeleton className="h-4 w-6" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-10 ml-auto" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-14" />
        </div>
      ))}
    </div>
  )
}
