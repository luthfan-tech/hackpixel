import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Terminal, 
  Download, 
  Search, 
  Coffee, 
  Check, 
  Boxes 
} from 'lucide-react'

import { Hero3DLaptop } from './components/Hero3DLaptop'
import { StatusStrip } from './components/StatusStrip'
import { ComingSoonCard } from './components/ComingSoonCard'
import { ParametersForm, type HackathonFormInput } from './components/ParametersForm'
import { IdeaCarousel } from './components/IdeaCarousel'
import type { IdeaItem } from './components/IdeaCard'
import { SkeletonCard } from './components/SkeletonCard'
import { Footer } from './components/Footer'

const BMC_URL = "https://buymeacoffee.com/luthfanmakl"
const STORAGE_COUNT_KEY = "hackpixel_ideas_generated_count"
const STORAGE_LAST_RUN_KEY = "hackpixel_last_run_timestamp"
const STORAGE_IDEAS_KEY = "hackpixel_saved_ideas"

export const App: React.FC = () => {
  const [ideas, setIdeas] = useState<IdeaItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [systemMode, setSystemMode] = useState<string>('Live Gemini')
  const [modelName, setModelName] = useState<string>('gemini-2.5-flash')
  const [localCount, setLocalCount] = useState<number>(0)
  const [lastRunTime, setLastRunTime] = useState<string | null>(null)
  const [filterQuery, setFilterQuery] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // 1. Initial Load: Restore localStorage stats and fetch /api/status
  useEffect(() => {
    try {
      const storedCount = localStorage.getItem(STORAGE_COUNT_KEY)
      if (storedCount) setLocalCount(parseInt(storedCount, 10) || 0)

      const storedLastRun = localStorage.getItem(STORAGE_LAST_RUN_KEY)
      if (storedLastRun) setLastRunTime(storedLastRun)

      const cachedIdeas = localStorage.getItem(STORAGE_IDEAS_KEY)
      if (cachedIdeas) {
        const parsed = JSON.parse(cachedIdeas)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setIdeas(parsed)
        }
      }
    } catch {
      // Storage unavailable or blocked
    }

    // Fetch backend status
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.mode) setSystemMode(data.mode)
        if (data.model) setModelName(data.model)
      })
      .catch(() => setSystemMode('Offline / Mock'))
  }, [])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  // 2. Handle Form Submit -> Call FastAPI /api/ideas
  const handleFormSubmit = async (formData: HackathonFormInput) => {
    setIsLoading(true)
    setErrorMessage(null)

    const payload = {
      hours_remaining: formData.hours_remaining,
      team_size: formData.team_size,
      skill_level: formData.skill_level,
      tone: formData.tone,
      demo_style: formData.demo_style,
      risk_appetite: formData.risk_appetite,
      theme: formData.theme.trim() || null,
      preferred_stack: formData.preferred_stack.trim()
        ? formData.preferred_stack.split(',').map((s) => s.trim()).filter(Boolean)
        : null,
    }

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const detail = errorData.detail || `Server returned status ${response.status}`
        throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail))
      }

      const data = await response.json()
      const generatedIdeas: IdeaItem[] = data.ideas || []
      setIdeas(generatedIdeas)

      // Update telemetry & localStorage
      const newCount = localCount + generatedIdeas.length
      setLocalCount(newCount)
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      setLastRunTime(nowStr)

      try {
        localStorage.setItem(STORAGE_COUNT_KEY, newCount.toString())
        localStorage.setItem(STORAGE_LAST_RUN_KEY, nowStr)
        localStorage.setItem(STORAGE_IDEAS_KEY, JSON.stringify(generatedIdeas))
      } catch {
        // Ignored
      }

      showToast(`✓ Generated & ranked ${generatedIdeas.length} ideas with ${modelName}!`)

      // Scroll smoothly to results
      const resultsEl = document.getElementById('workspace')
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: 'smooth' })
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate ideas.')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter ideas by stack
  const filteredIdeas = ideas.filter((idea) => {
    if (!filterQuery.trim()) return true
    const q = filterQuery.toLowerCase()
    return (idea.stack || []).some((tech) => tech.toLowerCase().includes(q))
  })

  // Export all to markdown
  const handleExportMarkdown = () => {
    if (ideas.length === 0) return
    const header = `# Hackpixel Ideation Export\nGenerated: ${new Date().toLocaleString()}\n\n---\n\n`
    const body = ideas
      .map(
        (idea, idx) =>
          `### #${idx + 1} ${idea.title} [Score: ${idea.total_score ? idea.total_score.toFixed(2) : 'N/A'}/5.0]\n> ${idea.one_line_pitch}\n\n- **MVP**: ${idea.minimum_version}\n- **Effort**: ${idea.estimated_hours}h\n- **Stack**: ${(idea.stack || []).join(', ')}\n`
      )
      .join('\n---\n\n')

    const fullText = header + body
    navigator.clipboard.writeText(fullText)
    showToast('All 10 ideas copied to clipboard as Markdown! ✓')

    try {
      const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hackpixel-ideas-${Date.now()}.md`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // Ignored
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col relative selection:bg-[#007AFF]/25 selection:text-[#007AFF]">
      {/* 1. Header Bar — Apple Modern */}
      <header className="relative z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 py-4 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#0A2540] flex items-center justify-center text-white font-bold font-mono text-sm shadow-xs">
              HP
            </div>
            <div>
              <span className="font-heading font-black text-xl sm:text-2xl tracking-tight text-[#0A2540]">
                Hackpixel
              </span>
              <span className="hidden sm:inline-block ml-2.5 text-sm font-mono text-[#6E6E73]">
                // Hackathon Idea Assistant
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-mono font-medium border border-slate-200 bg-[#F5F5F7] text-[#1D1D1F]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{systemMode}</span>
            </span>
            <a
              href={BMC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-[#F5F5F7] hover:bg-slate-200 text-[#1D1D1F] border border-slate-200 transition-colors"
            >
              <Coffee className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Buy me a coffee</span>
            </a>
          </div>
        </div>
      </header>

      {/* 2. Apple Modern Hero Section: Crisp White Background, Dark Blue "HACKPIXEL" Heading, 90° Upright 3D Laptop */}
      <section className="relative z-10 pt-6 pb-12 overflow-hidden bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* 3D Floating Laptop at 90° Upright Angle with Curvy Rounded Edges & Dark Blue "HACKPIXEL" Heading */}
          <Hero3DLaptop />

          {/* Subtitle & Launch Button */}
          <div className="text-center max-w-2xl mx-auto mt-2 space-y-4">
            <p className="font-body text-lg sm:text-xl text-[#1D1D1F] font-medium leading-relaxed">
              Tell us your hours and theme. Get <span className="text-[#007AFF] font-bold">10 scoped ideas</span> you can actually finish on time.
            </p>
            <div className="flex justify-center gap-3 pt-1">
              <a
                href="#workspace"
                className="inline-flex items-center gap-2 rounded-full bg-[#0A2540] hover:bg-[#007AFF] text-white font-heading font-bold text-base py-3 px-8 shadow-sm transition-all cursor-pointer"
              >
                <span>Launch Ideation Workspace</span>
                <span>↓</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Real-time Status & Telemetry Strip */}
      <StatusStrip 
        systemMode={systemMode} 
        localCount={localCount} 
        lastRunTime={lastRunTime} 
        modelName={modelName}
      />

      {/* 4. Main Ideation Workspace (Apple Modern Light Palette) */}
      <main id="workspace" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-8">
        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-base text-red-700 font-mono flex items-start gap-3">
            <span className="text-red-600 font-bold">Error:</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Parameters Form (Sticky on desktop) */}
          <div className="lg:col-span-5 lg:sticky lg:top-6">
            <ParametersForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>

          {/* Right Column: Generated Ideas & Results Area */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
              <div>
                <h2 className="font-heading text-2xl font-black text-[#1D1D1F] flex items-center gap-2.5">
                  <Boxes className="w-6 h-6 text-[#007AFF]" />
                  <span>Generated Project Cards</span>
                </h2>
                <p className="text-sm text-[#424245] font-body mt-0.5">
                  {ideas.length > 0
                    ? `Showing ${filteredIdeas.length} of ${ideas.length} ideas.`
                    : 'Awaiting submission. Select any preset or adjust constraints and generate.'}
                </p>
              </div>

              {ideas.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportMarkdown}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-mono font-semibold bg-white hover:bg-slate-100 text-[#1D1D1F] border border-slate-200 transition-all cursor-pointer shadow-2xs"
                  >
                    <Download className="w-4 h-4 text-[#007AFF]" />
                    <span>Export .md</span>
                  </button>
                </div>
              )}
            </div>

            {/* Filter by Stack input (if ideas loaded) */}
            {ideas.length > 0 && (
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter cards by technology (e.g. Next.js, React, Python)..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:border-[#007AFF] focus:outline-hidden transition-colors font-mono shadow-2xs"
                />
              </div>
            )}

            {/* Loading State: Pulsing Skeleton Card Outlines */}
            {isLoading ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-mono font-semibold text-[#007AFF] animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Generating and scoring 10 ideas with Google Gemini...</span>
                </div>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : ideas.length > 0 ? (
              /* Carousel & Paginated Grid Display */
              <IdeaCarousel
                ideas={filteredIdeas}
                onCopy={(_idea, rank) => showToast(`Idea #${rank} copied to clipboard!`)}
              />
            ) : (
              /* Empty State */
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3 shadow-2xs">
                <div className="h-14 w-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-[#007AFF]">
                  <Terminal className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-bold text-[#1D1D1F] text-lg">
                  No ideas generated yet
                </h3>
                <p className="text-sm text-[#424245] max-w-sm mx-auto font-body">
                  Set your custom <strong className="text-[#1D1D1F]">hours, team, and stack</strong> on the left, then click Generate to get 10 scoped ideas.
                </p>
              </div>
            )}

            {/* Compact Coming Soon Card */}
            <div className="pt-2">
              <ComingSoonCard />
            </div>
          </div>
        </div>
      </main>

      {/* 5. Footer with Buy Me a Coffee Section & QR Code */}
      <Footer />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 right-6 z-50 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-mono font-semibold text-[#1D1D1F] shadow-xl flex items-center gap-2.5"
          >
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
