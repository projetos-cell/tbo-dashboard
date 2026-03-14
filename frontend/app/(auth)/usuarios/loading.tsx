"use client"

export default function UsuariosLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-40 animate-pulse rounded bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded bg-muted" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-lg border bg-muted/40"
          />
        ))}
      </div>

      {/* Filters skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-80 animate-pulse rounded bg-muted" />
        <div className="h-9 w-40 animate-pulse rounded bg-muted" />
        <div className="h-9 w-44 animate-pulse rounded bg-muted" />
      </div>

      {/* Table skeleton */}
      <div className="space-y-2 rounded-lg border p-4">
        <div className="h-10 animate-pulse rounded bg-muted/60" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded bg-muted/30"
          />
        ))}
      </div>
    </div>
  )
}
