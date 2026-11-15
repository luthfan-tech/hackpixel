import React from 'react'
import { GitBranch, Cpu, Compass, Layers } from 'lucide-react'

export const ComingSoonCard: React.FC = () => {
  return (
    <div 
      id="comingSoonCard"
      className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3.5 shadow-sm"
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#007AFF]" />
          <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-[#1D1D1F]">
            Roadmap &amp; Planned API Capabilities
          </h3>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#007AFF] font-bold">
          [PLANNED // NOT ACTIVE]
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* Planned 1: Live Duplicate Search */}
        <div className="rounded-xl border border-slate-200 bg-[#F5F5F7] p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#1D1D1F]">
            <GitBranch className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>LIVE DUPLICATE SEARCH</span>
          </div>
          <p className="text-[11px] text-[#6E6E73] font-body leading-normal">
            Real-time embeddings scan against 100,000+ past winning hackathon repos.
          </p>
          <span className="inline-block text-[9px] font-mono text-[#86868B] uppercase tracking-widest bg-white px-1.5 py-0.5 rounded border border-slate-200">
            Q2 Roadmap
          </span>
        </div>

        {/* Planned 2: Multi-Model Routing */}
        <div className="rounded-xl border border-slate-200 bg-[#F5F5F7] p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#1D1D1F]">
            <Cpu className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>MORE MODELS ROUTING</span>
          </div>
          <p className="text-[11px] text-[#6E6E73] font-body leading-normal">
            Multi-LLM consensus routing across Gemini 2.5 Pro, Claude 3.7, and GPT-4o.
          </p>
          <span className="inline-block text-[9px] font-mono text-[#86868B] uppercase tracking-widest bg-white px-1.5 py-0.5 rounded border border-slate-200">
            Planned
          </span>
        </div>

        {/* Planned 3: 1-Click Jamstack Scaffolding */}
        <div className="rounded-xl border border-slate-200 bg-[#F5F5F7] p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#1D1D1F]">
            <Layers className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>1-CLICK REPO EXPORT</span>
          </div>
          <p className="text-[11px] text-[#6E6E73] font-body leading-normal">
            Export idea card directly into a bootstrapped Next.js 15 + Tailwind repo.
          </p>
          <span className="inline-block text-[9px] font-mono text-[#86868B] uppercase tracking-widest bg-white px-1.5 py-0.5 rounded border border-slate-200">
            Planned
          </span>
        </div>
      </div>
    </div>
  )
}
