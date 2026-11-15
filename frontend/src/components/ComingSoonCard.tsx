import React from 'react'
import { GitBranch, Cpu, Compass, Layers } from 'lucide-react'

export const ComingSoonCard: React.FC = () => {
  return (
    <div 
      id="comingSoonCard"
      className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <Compass className="w-5 h-5 text-[#007AFF]" />
          <h3 className="font-heading font-black text-sm uppercase tracking-wider text-[#1D1D1F]">
            Roadmap &amp; Planned API Capabilities
          </h3>
        </div>
        <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#007AFF] font-bold">
          [PLANNED // NOT ACTIVE]
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
        {/* Planned 1: Live Duplicate Search */}
        <div className="rounded-xl border border-slate-200 bg-[#F5F5F7] p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-mono font-bold text-[#1D1D1F]">
            <GitBranch className="w-4 h-4 text-[#007AFF]" />
            <span>LIVE DUPLICATE SEARCH</span>
          </div>
          <p className="text-sm text-[#505054] font-body leading-relaxed">
            Real-time embeddings scan against 100,000+ past winning hackathon repos.
          </p>
          <span className="inline-block text-xs font-mono text-[#6E6E73] font-medium uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-slate-200">
            Q2 Roadmap
          </span>
        </div>

        {/* Planned 2: Multi-Model Routing */}
        <div className="rounded-xl border border-slate-200 bg-[#F5F5F7] p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-mono font-bold text-[#1D1D1F]">
            <Cpu className="w-4 h-4 text-[#007AFF]" />
            <span>MORE MODELS ROUTING</span>
          </div>
          <p className="text-sm text-[#505054] font-body leading-relaxed">
            Multi-LLM consensus routing across Gemini 2.5 Pro, Claude 3.7, and GPT-4o.
          </p>
          <span className="inline-block text-xs font-mono text-[#6E6E73] font-medium uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-slate-200">
            Planned
          </span>
        </div>

        {/* Planned 3: 1-Click Jamstack Scaffolding */}
        <div className="rounded-xl border border-slate-200 bg-[#F5F5F7] p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-mono font-bold text-[#1D1D1F]">
            <Layers className="w-4 h-4 text-[#007AFF]" />
            <span>1-CLICK REPO EXPORT</span>
          </div>
          <p className="text-sm text-[#505054] font-body leading-relaxed">
            Export idea card directly into a bootstrapped Next.js 15 + Tailwind repo.
          </p>
          <span className="inline-block text-xs font-mono text-[#6E6E73] font-medium uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-slate-200">
            Planned
          </span>
        </div>
      </div>
    </div>
  )
}
