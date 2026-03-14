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

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex gap-4 border-b border-slate-100 px-4 py-3">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="h-4 w-20 rounded bg-slate-200" />
        <div className="h-4 w-20 rounded bg-slate-200" />
        <div className="hidden h-4 w-24 rounded bg-slate-200 lg:block" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-slate-50 px-4 py-3.5 last:border-0">
          <div className="h-8 w-8 rounded-full bg-slate-100" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-40 rounded bg-slate-100" />
            <div className="h-3 w-28 rounded bg-slate-100" />
          </div>
          <div className="h-5 w-14 rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="max-w-2xl animate-pulse space-y-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div className="h-5 w-40 rounded bg-slate-200" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3.5 w-20 rounded bg-slate-200" />
            <div className="h-10 w-full rounded-lg bg-slate-100" />
          </div>
        ))}
        <div className="flex justify-end">
          <div className="h-10 w-28 rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Welcome */}
      <div className="space-y-2">
        <div className="h-8 w-56 rounded bg-slate-200" />
        <div className="flex items-center gap-3">
          <div className="h-5 w-16 rounded-full bg-slate-200" />
          <div className="h-3 w-32 rounded bg-slate-200" />
        </div>
      </div>
      {/* Stat cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      {/* Quick actions */}
      <div>
        <div className="h-5 w-28 rounded bg-slate-200 mb-4" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-slate-100" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-24 rounded bg-slate-200" />
                  <div className="h-3 w-16 rounded bg-slate-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Activity */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-5 w-32 rounded bg-slate-200 mb-4" />
        <ActivitySkeleton />
      </div>
    </div>
  );
}
