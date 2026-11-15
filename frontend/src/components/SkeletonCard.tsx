import React from 'react'

export const SkeletonCard: React.FC = () => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse space-y-4">
      {/* Header: Rank + Title + Score */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-12 rounded-lg bg-slate-200" />
          <div className="h-6 w-48 rounded-lg bg-slate-200" />
        </div>
        <div className="h-7 w-24 rounded-lg bg-slate-200" />
      </div>

      {/* One-line Pitch */}
      <div className="h-4 w-3/4 rounded-lg bg-slate-200/80" />

      {/* Duplicate warning placeholder */}
      <div className="h-6 w-44 rounded-lg bg-slate-100" />

      {/* MVP Section */}
      <div className="space-y-2 rounded-xl border border-slate-200 bg-[#F5F5F7] p-3">
        <div className="h-3 w-32 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-200/70" />
        <div className="h-4 w-5/6 rounded bg-slate-200/70" />
      </div>

      {/* Development Effort */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-28 rounded bg-slate-200" />
        <div className="h-4 w-16 rounded bg-slate-200/70" />
      </div>

      {/* Suggested Stack tags */}
      <div className="flex flex-wrap gap-2 pt-1">
        <div className="h-6 w-16 rounded-md bg-slate-200/70" />
        <div className="h-6 w-20 rounded-md bg-slate-200/70" />
        <div className="h-6 w-14 rounded-md bg-slate-200/70" />
        <div className="h-6 w-24 rounded-md bg-slate-200/70" />
      </div>

      {/* Rubric Breakdown Grid Skeletons */}
      <div className="pt-2">
        <div className="h-3 w-40 rounded bg-slate-200 mb-2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-[#F5F5F7] p-2 space-y-1.5">
              <div className="flex justify-between">
                <div className="h-3 w-20 rounded bg-slate-200" />
                <div className="h-3 w-10 rounded bg-slate-200" />
              </div>
              <div className="h-2 w-full rounded bg-slate-200/50" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
