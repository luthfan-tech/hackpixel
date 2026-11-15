import React from 'react'
import { 
  Globe, 
  Server, 
  Database, 
  Terminal,
  Layers, 
  Gauge 
} from 'lucide-react'

export const JamstackShowcase: React.FC = () => {
  return (
    <section 
      id="jamstackShowcaseSection" 
      aria-labelledby="jamstack-heading"
      className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 sm:p-8 space-y-6 relative overflow-hidden"
    >
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase text-sky-400 font-bold tracking-widest bg-sky-950/60 border border-sky-800/40 px-2 py-0.5 rounded">
              ARCHITECTURAL BLUEPRINT
            </span>
            <span className="text-xs font-mono text-slate-500">// v2.5 Spec</span>
          </div>
          <h2 id="jamstack-heading" className="font-heading text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
            The Modern Jamstack &amp; Full-Framework Stack
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-body mt-1">
            Engineered specifically for SEO-heavy, ultra-scalable hackathon projects and production web applications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs">
            <Gauge className="w-4 h-4 text-emerald-400" />
            <span>Lighthouse 100/100</span>
          </div>
        </div>
      </div>

      {/* 4 Architectural Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: High-Performance Frontend */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-3 hover:border-sky-500/40 transition-colors">
          <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="font-heading font-bold text-sm text-slate-200">
            1. Next.js 15 / React 19 UI
          </h3>
          <p className="text-xs text-slate-400 font-body leading-relaxed">
            Pre-rendered HTML with Tailwind CSS v4 styling, zero runtime layout shift, and instant client hydration with Vite/Turbopack.
          </p>
          <div className="pt-2 flex flex-wrap gap-1 font-mono text-[10px]">
            <span className="px-2 py-0.5 rounded bg-slate-950 text-sky-300 border border-slate-800">React 19</span>
            <span className="px-2 py-0.5 rounded bg-slate-950 text-sky-300 border border-slate-800">Tailwind v4</span>
          </div>
        </div>

        {/* Pillar 2: Edge CDN & Global SEO */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-3 hover:border-sky-500/40 transition-colors">
          <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Globe className="w-4 h-4" />
          </div>
          <h3 className="font-heading font-bold text-sm text-slate-200">
            2. Edge CDN &amp; SEO Engine
          </h3>
          <p className="text-xs text-slate-400 font-body leading-relaxed">
            Global distribution via Vercel Edge / Cloudflare. Automated OpenGraph tags, semantic JSON-LD metadata, and sub-50ms TTFB.
          </p>
          <div className="pt-2 flex flex-wrap gap-1 font-mono text-[10px]">
            <span className="px-2 py-0.5 rounded bg-slate-950 text-emerald-300 border border-slate-800">Edge Caching</span>
            <span className="px-2 py-0.5 rounded bg-slate-950 text-emerald-300 border border-slate-800">SEO Schema</span>
          </div>
        </div>

        {/* Pillar 3: Microservice Backend */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-3 hover:border-sky-500/40 transition-colors">
          <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Server className="w-4 h-4" />
          </div>
          <h3 className="font-heading font-bold text-sm text-slate-200">
            3. Async FastAPI Microservice
          </h3>
          <p className="text-xs text-slate-400 font-body leading-relaxed">
            Strict Pydantic v2 schemas, rate-limiting, and 5-dimension rubric scoring logic running independently of the presentation layer.
          </p>
          <div className="pt-2 flex flex-wrap gap-1 font-mono text-[10px]">
            <span className="px-2 py-0.5 rounded bg-slate-950 text-amber-300 border border-slate-800">FastAPI</span>
            <span className="px-2 py-0.5 rounded bg-slate-950 text-amber-300 border border-slate-800">Pydantic v2</span>
          </div>
        </div>

        {/* Pillar 4: Decoupled AI & Data Tier */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-3 hover:border-sky-500/40 transition-colors">
          <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Database className="w-4 h-4" />
          </div>
          <h3 className="font-heading font-bold text-sm text-slate-200">
            4. Isolated AI Tier
          </h3>
          <p className="text-xs text-slate-400 font-body leading-relaxed">
            Google Gemini 2.5 Flash inference with automatic structured JSON outputs, zero API key leakage, and offline fallback mock engine.
          </p>
          <div className="pt-2 flex flex-wrap gap-1 font-mono text-[10px]">
            <span className="px-2 py-0.5 rounded bg-slate-950 text-purple-300 border border-slate-800">Gemini 2.5</span>
            <span className="px-2 py-0.5 rounded bg-slate-950 text-purple-300 border border-slate-800">Zero Leakage</span>
          </div>
        </div>
      </div>

      {/* Interactive Architecture Flow Diagram */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-950/90 p-4 font-mono text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-[11px] text-slate-400">
          <span className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span>JAMSTACK REQUEST FLOW DIAGRAM</span>
          </span>
          <span className="text-slate-500 font-sans text-[11px]">End-to-End Execution Flow</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 pt-3 items-center text-center">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <div className="text-sky-300 font-bold">1. Client / Browser</div>
            <div className="text-[10px] text-slate-400 font-sans mt-0.5">Static HTML + Tailwind</div>
          </div>
          <div className="text-slate-600 font-bold text-sm hidden md:block">→</div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <div className="text-emerald-300 font-bold">2. Edge CDN</div>
            <div className="text-[10px] text-slate-400 font-sans mt-0.5">Instant SSG / Cached Assets</div>
          </div>
          <div className="text-slate-600 font-bold text-sm hidden md:block">→</div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <div className="text-amber-300 font-bold">3. FastAPI Engine</div>
            <div className="text-[10px] text-slate-400 font-sans mt-0.5">Rubric &amp; Validation (8000)</div>
          </div>
        </div>
      </div>
    </section>
  )
}
