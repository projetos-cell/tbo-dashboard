"use client"

export default function UserProfileLoading() {
  return (
    <div className="space-y-6">
      {/* Back button skeleton */}
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4 lg:col-span-1">
          {/* Profile header skeleton */}
          <div className="rounded-lg border p-6">
            <div className="flex flex-col items-center space-y-3">
              <div className="h-20 w-20 animate-pulse rounded-full bg-muted" />
              <div className="h-5 w-36 animate-pulse rounded bg-muted" />
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="flex gap-2">
                <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                <div className="h-5 w-12 animate-pulse rounded bg-muted" />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-muted/40" />
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-muted/30" />
              ))}
            </div>
          </div>

          {/* Completion skeleton */}
          <div className="rounded-lg border p-6">
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-2 animate-pulse rounded-full bg-muted" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-muted/30" />
              ))}
            </div>
          </div>

          {/* Skills skeleton */}
          <div className="rounded-lg border p-6">
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="mt-3 flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-6 w-20 animate-pulse rounded-full bg-muted/40" />
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2">
          <div className="h-10 w-80 animate-pulse rounded bg-muted" />
          <div className="mt-4 space-y-4">
            <div className="h-48 animate-pulse rounded-lg border bg-muted/30" />
            <div className="h-64 animate-pulse rounded-lg border bg-muted/30" />
          </div>
        </div>
      </div>
    </div>
  )
}
