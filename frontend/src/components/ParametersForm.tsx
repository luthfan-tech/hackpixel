import React, { useState } from 'react'
import { 
  Sparkles, 
  Clock, 
  Users, 
  Activity, 
  Smile, 
  Monitor, 
  Compass, 
  Layers, 
  Target, 
  Zap, 
  Cpu, 
  Smartphone, 
  BarChart, 
  Shield 
} from 'lucide-react'

export interface HackathonFormInput {
  hours_remaining: number
  team_size: number
  skill_level: 'beginner' | 'intermediate' | 'advanced'
  tone: 'fun' | 'serious' | 'experimental'
  demo_style: 'live_app' | 'slides_heavy' | 'data_story' | 'no_preference'
  risk_appetite: 'safe' | 'balanced' | 'ambitious'
  preferred_stack: string
  theme: string
}

interface ParametersFormProps {
  onSubmit: (data: HackathonFormInput) => void
  isLoading: boolean
}

export const ARCHITECTURE_PRESETS = [
  {
    id: 'jamstack',
    name: 'Jamstack',
    icon: Zap,
    description: 'Next.js 15, Tailwind, Supabase (24h)',
    data: {
      hours_remaining: 24,
      team_size: 3,
      skill_level: 'intermediate' as const,
      tone: 'serious' as const,
      demo_style: 'live_app' as const,
      risk_appetite: 'balanced' as const,
      preferred_stack: 'Next.js 15, Tailwind CSS, Supabase, TypeScript, Vercel',
      theme: 'Modern Jamstack & Scalable Web',
    },
  },
  {
    id: 'ai-native',
    name: 'AI Native',
    icon: Cpu,
    description: 'FastAPI, Gemini 2.5, React (36h)',
    data: {
      hours_remaining: 36,
      team_size: 3,
      skill_level: 'advanced' as const,
      tone: 'experimental' as const,
      demo_style: 'live_app' as const,
      risk_appetite: 'ambitious' as const,
      preferred_stack: 'FastAPI, Google Gemini, Python, React, ChromaDB',
      theme: 'AI Developer Tooling & Automation',
    },
  },
  {
    id: 'mobile',
    name: 'Mobile App',
    icon: Smartphone,
    description: 'Flutter, Dart, Firebase (24h)',
    data: {
      hours_remaining: 24,
      team_size: 2,
      skill_level: 'intermediate' as const,
      tone: 'fun' as const,
      demo_style: 'live_app' as const,
      risk_appetite: 'balanced' as const,
      preferred_stack: 'Flutter, Dart, Firebase, Cloud Functions',
      theme: 'Mobile-First Offline Experience',
    },
  },
  {
    id: 'data',
    name: 'Data Story',
    icon: BarChart,
    description: 'Streamlit, DuckDB, Plotly (12h)',
    data: {
      hours_remaining: 12,
      team_size: 2,
      skill_level: 'intermediate' as const,
      tone: 'serious' as const,
      demo_style: 'data_story' as const,
      risk_appetite: 'safe' as const,
      preferred_stack: 'Python, Streamlit, DuckDB, Pandas, Plotly',
      theme: 'Open Data & Public Insights',
    },
  },
  {
    id: 'edge',
    name: 'Edge / Go',
    icon: Shield,
    description: 'Go, Docker, PostgreSQL (48h)',
    data: {
      hours_remaining: 48,
      team_size: 4,
      skill_level: 'advanced' as const,
      tone: 'serious' as const,
      demo_style: 'live_app' as const,
      risk_appetite: 'ambitious' as const,
      preferred_stack: 'Go, Docker, PostgreSQL, Redis, Cloudflare Workers',
      theme: 'High-Throughput Edge Infrastructure',
    },
  },
]

export const ParametersForm: React.FC<ParametersFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<HackathonFormInput>({
    hours_remaining: 24,
    team_size: 3,
    skill_level: 'intermediate',
    tone: 'serious',
    demo_style: 'live_app',
    risk_appetite: 'balanced',
    preferred_stack: 'Next.js 15, Tailwind CSS, FastAPI, Supabase',
    theme: '',
  })

  const [hoursInput, setHoursInput] = useState<string>('24')
  const [teamSizeInput, setTeamSizeInput] = useState<string>('3')
  const [activePreset, setActivePreset] = useState<string | null>('jamstack')
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleApplyPreset = (preset: typeof ARCHITECTURE_PRESETS[0]) => {
    setActivePreset(preset.id)
    setFormData(preset.data)
    setHoursInput(preset.data.hours_remaining.toString())
    setTeamSizeInput(preset.data.team_size.toString())
    setValidationError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedHours = parseFloat(hoursInput)
    const parsedTeam = parseInt(teamSizeInput, 10)

    if (isNaN(parsedHours) || parsedHours <= 0 || parsedHours > 1000) {
      setValidationError('Please enter a valid remaining time between 0.5 and 1000 hours.')
      return
    }
    if (isNaN(parsedTeam) || parsedTeam < 1 || parsedTeam > 6) {
      setValidationError('Team size must be between 1 and 6 developers.')
      return
    }

    setValidationError(null)
    onSubmit({
      ...formData,
      hours_remaining: parsedHours,
      team_size: parsedTeam,
    })
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
      <div className="mb-6 space-y-1">
        <h2 className="font-heading text-2xl font-black tracking-tight text-[#1D1D1F] flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-[#007AFF]" />
          <span>Hackathon Constraints</span>
        </h2>
        <p className="text-sm text-[#424245] font-body">
          Choose any timing, theme, and stack, or pick a template below.
        </p>
      </div>

      {/* Quick Architecture Presets */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-[#F5F5F7] p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#007AFF] block">
            ⚡ Quick-Start Templates (Optional)
          </span>
          {activePreset ? (
            <span className="text-xs font-mono text-[#007AFF] bg-blue-100/60 px-2.5 py-0.5 rounded-md font-semibold">
              Template: {activePreset}
            </span>
          ) : (
            <span className="text-xs font-mono text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-md font-bold">
              ✓ Custom Parameters Active
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {ARCHITECTURE_PRESETS.map((p) => {
            const Icon = p.icon
            const isSelected = activePreset === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-mono font-semibold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-xs'
                    : 'bg-white text-[#1D1D1F] border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                title={p.description}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#007AFF]'}`} />
                <span>{p.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {validationError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-600 font-mono font-medium">
          {validationError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Hours & Team Size Grid */}
        <div className="grid grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-bold text-[#1D1D1F]">
              <Clock className="w-4 h-4 text-[#007AFF]" />
              <span>Hours Left *</span>
            </label>
            <input
              type="number"
              min="0.5"
              max="1000"
              step="0.5"
              value={hoursInput}
              onChange={(e) => {
                setActivePreset(null)
                setHoursInput(e.target.value)
                const val = parseFloat(e.target.value)
                if (!isNaN(val)) {
                  setFormData((prev) => ({ ...prev, hours_remaining: val }))
                }
              }}
              required
              className="w-full rounded-xl border border-slate-200 bg-[#F5F5F7] px-3.5 py-2.5 text-base text-[#1D1D1F] font-mono focus:bg-white focus:border-[#007AFF] focus:outline-hidden transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-bold text-[#1D1D1F]">
              <Users className="w-4 h-4 text-[#007AFF]" />
              <span>Team Size *</span>
            </label>
            <input
              type="number"
              min="1"
              max="6"
              value={teamSizeInput}
              onChange={(e) => {
                setActivePreset(null)
                setTeamSizeInput(e.target.value)
                const val = parseInt(e.target.value, 10)
                if (!isNaN(val)) {
                  setFormData((prev) => ({ ...prev, team_size: val }))
                }
              }}
              required
              className="w-full rounded-xl border border-slate-200 bg-[#F5F5F7] px-3.5 py-2.5 text-base text-[#1D1D1F] font-mono focus:bg-white focus:border-[#007AFF] focus:outline-hidden transition-colors"
            />
          </div>
        </div>

        {/* Skill Level */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-bold text-[#1D1D1F]">
            <Activity className="w-4 h-4 text-[#007AFF]" />
            <span>Skill Level *</span>
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-[#F5F5F7] border border-slate-200">
            {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => {
                  setActivePreset(null)
                  setFormData({ ...formData, skill_level: level })
                }}
                className={`py-2 rounded-lg text-sm font-semibold capitalize transition-all cursor-pointer ${
                  formData.skill_level === level
                    ? 'bg-[#007AFF] text-white shadow-xs'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-bold text-[#1D1D1F]">
            <Smile className="w-4 h-4 text-[#007AFF]" />
            <span>Project Tone *</span>
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-[#F5F5F7] border border-slate-200">
            {(['fun', 'serious', 'experimental'] as const).map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => {
                  setActivePreset(null)
                  setFormData({ ...formData, tone })
                }}
                className={`py-2 rounded-lg text-sm font-semibold capitalize transition-all cursor-pointer ${
                  formData.tone === tone
                    ? 'bg-[#007AFF] text-white shadow-xs'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        {/* Demo Style */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-bold text-[#1D1D1F]">
            <Monitor className="w-4 h-4 text-[#007AFF]" />
            <span>Target Demo Style *</span>
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#F5F5F7] border border-slate-200">
            {[
              { id: 'live_app', label: 'Live App' },
              { id: 'slides_heavy', label: 'Slides Heavy' },
              { id: 'data_story', label: 'Data Story' },
              { id: 'no_preference', label: 'No Preference' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setActivePreset(null)
                  setFormData({ ...formData, demo_style: d.id as any })
                }}
                className={`py-2 px-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  formData.demo_style === d.id
                    ? 'bg-[#007AFF] text-white shadow-xs'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Risk Appetite */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-bold text-[#1D1D1F]">
            <Compass className="w-4 h-4 text-[#007AFF]" />
            <span>Risk Appetite *</span>
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-[#F5F5F7] border border-slate-200">
            {(['safe', 'balanced', 'ambitious'] as const).map((risk) => (
              <button
                key={risk}
                type="button"
                onClick={() => {
                  setActivePreset(null)
                  setFormData({ ...formData, risk_appetite: risk })
                }}
                className={`py-2 rounded-lg text-sm font-semibold capitalize transition-all cursor-pointer ${
                  formData.risk_appetite === risk
                    ? 'bg-[#007AFF] text-white shadow-xs'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                {risk}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Stack */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-bold text-[#1D1D1F]">
            <Layers className="w-4 h-4 text-[#007AFF]" />
            <span>Preferred Stack (Comma-separated)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Next.js, Tailwind, FastAPI, Python"
            value={formData.preferred_stack}
            onChange={(e) => {
              setActivePreset(null)
              setFormData({ ...formData, preferred_stack: e.target.value })
            }}
            className="w-full rounded-xl border border-slate-200 bg-[#F5F5F7] px-3.5 py-2.5 text-base text-[#1D1D1F] placeholder:text-[#86868B] focus:bg-white focus:border-[#007AFF] focus:outline-hidden transition-colors font-mono"
          />
        </div>

        {/* Theme */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-bold text-[#1D1D1F]">
            <Target className="w-4 h-4 text-[#007AFF]" />
            <span>Theme / Track (Optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. AI for Productivity, Climate Action"
            value={formData.theme}
            onChange={(e) => {
              setActivePreset(null)
              setFormData({ ...formData, theme: e.target.value })
            }}
            className="w-full rounded-xl border border-slate-200 bg-[#F5F5F7] px-3.5 py-2.5 text-base text-[#1D1D1F] placeholder:text-[#86868B] focus:bg-white focus:border-[#007AFF] focus:outline-hidden transition-colors"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-3 inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#007AFF] hover:bg-[#0066d6] text-white font-heading font-black text-base py-3.5 px-5 shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating &amp; Ranking 10 Ideas...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate 10 Scoped Ideas</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
