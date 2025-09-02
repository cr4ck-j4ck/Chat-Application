export default function Loading() {
  return (
    <main className="px-4 py-6 md:px-8 lg:px-12">
      <div className="mb-6">
        <div className="h-7 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted/70" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-6">
          <div className="h-44 animate-pulse rounded-lg bg-muted" />
          <div className="h-60 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="space-y-6 md:col-span-2">
          <div className="h-40 animate-pulse rounded-lg bg-muted" />
          <div className="h-72 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </main>
  )
}
