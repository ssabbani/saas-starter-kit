"use client";

export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-6 w-16 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 rounded bg-slate-200" />
            <div className="h-3 w-24 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-64 rounded bg-slate-200" />
        <div className="h-4 w-40 rounded bg-slate-200" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-5 w-32 rounded bg-slate-200 mb-4" />
        <ActivitySkeleton />
      </div>
    </div>
  );
}
