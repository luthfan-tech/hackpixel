import React from 'react'
import { Terminal, Clock, Activity, Zap } from 'lucide-react'

interface StatusStripProps {
  systemMode: string
  localCount: number
  lastRunTime: string | null
  modelName?: string
}

export const StatusStrip: React.FC<StatusStripProps> = ({
  systemMode,
  localCount,
  lastRunTime,
  modelName = 'gemini-2.5-flash',
}) => {
  const isLive = systemMode.toLowerCase().includes('live') || systemMode.toLowerCase().includes('gemini')

  return (
    <section 
      id="systemStatusSection" 
      aria-label="System status & telemetry strip"
      className="w-full border-y border-slate-200 bg-white py-3.5 px-4 sm:px-6 relative z-10 shadow-xs"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-sm font-mono">
        {/* Cell 1: System Mode & Health */}
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            {isLive ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            )}
          </span>
          <span className="text-slate-500 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#007AFF]" />
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">System Mode:</span>
          </span>
          <strong id="statusMode" className="text-[#1D1D1F] font-bold tracking-wide text-sm">
            {systemMode} {isLive && `(${modelName})`}
          </strong>
        </div>

        {/* Divider */}
        <span className="hidden md:inline text-slate-300 select-none text-sm" aria-hidden="true">//</span>

        {/* Cell 2: Ideas Generated in this Browser (localStorage) */}
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-500" />
          <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Saved In Browser:</span>
          <strong id="statusIdeasCount" className="text-[#1D1D1F] font-bold text-sm bg-[#F5F5F7] px-2.5 py-0.5 rounded border border-slate-200">
            {localCount} {localCount === 1 ? 'idea' : 'ideas'}
          </strong>
        </div>

        {/* Divider */}
        <span className="hidden md:inline text-slate-300 select-none text-sm" aria-hidden="true">//</span>

        {/* Cell 3: Last Run Timestamp */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Last Generated:</span>
          <strong id="statusLastRun" className="text-[#1D1D1F] font-bold text-sm">
            {lastRunTime || 'None recorded'}
          </strong>
        </div>

        {/* Divider */}
        <span className="hidden lg:inline text-slate-300 select-none text-sm" aria-hidden="true">//</span>

        {/* Cell 4: Jamstack / Edge Architecture indicator */}
        <div className="hidden lg:flex items-center gap-2 text-slate-500">
          <Zap className="w-4 h-4 text-[#007AFF]" />
          <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Engine:</span>
          <span className="text-[#007AFF] font-bold bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded text-xs">
            FastAPI + Gemini 2.5
          </span>
        </div>
      </div>
    </section>
  )
}
