import React from 'react'
import { Award, Zap, Target, CheckCircle2 } from 'lucide-react'

export const ComingSoonCard: React.FC = () => {
  return (
    <div 
      id="playbookCard"
      className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <Award className="w-5 h-5 text-[#007AFF]" />
          <h3 className="font-heading font-black text-sm uppercase tracking-wider text-[#1D1D1F]">
            Hackathon Execution Playbook &amp; Judging Tips
          </h3>
        </div>
        <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
          [PRO TIPS // WINNING STRATEGY]
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
        {/* Playbook 1: Scope Down to 1 Core Flow */}
        <div className="rounded-xl border border-slate-200 bg-[#F5F5F7] p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-mono font-bold text-[#1D1D1F]">
            <Target className="w-4 h-4 text-[#007AFF]" />
            <span>SCOPE DOWN TO 1 CORE FLOW</span>
          </div>
          <p className="text-sm text-[#505054] font-body leading-relaxed">
            Judges heavily reward one working, polished end-to-end user flow over 5 half-finished or broken features.
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-700 font-semibold uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-slate-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> MVP Rule
          </span>
        </div>

        {/* Playbook 2: First 60 Seconds Demo Rule */}
        <div className="rounded-xl border border-slate-200 bg-[#F5F5F7] p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-mono font-bold text-[#1D1D1F]">
            <Zap className="w-4 h-4 text-[#007AFF]" />
            <span>FIRST 60 SECONDS WIN</span>
          </div>
          <p className="text-sm text-[#505054] font-body leading-relaxed">
            In your 3-minute pitch, show your live application before discussing slides. Visual proof captivates judges immediately.
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-mono text-[#007AFF] font-semibold uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-slate-200">
            <CheckCircle2 className="w-3 h-3 text-[#007AFF]" /> Pitch Strategy
          </span>
        </div>

        {/* Playbook 3: Transparent 5-Metric Rubric */}
        <div className="rounded-xl border border-slate-200 bg-[#F5F5F7] p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-mono font-bold text-[#1D1D1F]">
            <Award className="w-4 h-4 text-[#007AFF]" />
            <span>5-DIMENSION RUBRIC FIT</span>
          </div>
          <p className="text-sm text-[#505054] font-body leading-relaxed">
            Every card is scored across Time Fit, Feasibility, Team Balance, Demo Punch, and Theme Alignment for maximum scoring.
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-mono text-purple-700 font-semibold uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-slate-200">
            <CheckCircle2 className="w-3 h-3 text-purple-600" /> Rubric Match
          </span>
        </div>
      </div>
    </div>
  )
}
