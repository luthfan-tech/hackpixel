import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Copy, 
  Check, 
  Package, 
  Clock, 
  Code2, 
  AlertTriangle, 
  Database, 
  BarChart3, 
  ExternalLink,
  Cpu,
  Users,
  Monitor,
  Target,
  Sparkles
} from 'lucide-react'
import { PixelBloomAccent } from './PixelBloomAccent'

export interface IdeaItem {
  title: string
  one_line_pitch: string
  minimum_version: string
  estimated_hours: number
  stack: string[]
  optional_extras?: string[]
  risks?: string[]
  data_sources?: string[]
  scores: Record<string, number>
  score_explanations: Record<string, string>
  total_score: number
  duplicate_warning?: string
}

interface IdeaCardProps {
  idea: IdeaItem
  rank: number
  index: number
  onCopy?: (idea: IdeaItem, rank: number) => void
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea, rank, index, onCopy }) => {
  const [copied, setCopied] = useState(false)
  const isTopIdea = rank === 1

  const handleCopyClick = () => {
    setCopied(true)
    if (onCopy) onCopy(idea, rank)
    setTimeout(() => setCopied(false), 2000)
  }

  // Duplicate badge styling
  let duplicateBadge = null
  const warning = idea.duplicate_warning || 'check skipped'
  if (warning.startsWith('possible match:')) {
    const urlMatch = warning.replace('possible match:', '').trim()
    duplicateBadge = (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
        <span>Possible match:</span>
        <a href={urlMatch} target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900">
          GitHub
        </a>
      </span>
    )
  } else if (warning === 'none found') {
    duplicateBadge = (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
        <Check className="w-3.5 h-3.5 text-emerald-600" />
        No duplicates found on GitHub
      </span>
    )
  }

  // Rubric metric icon mapper
  const getRubricIcon = (crit: string) => {
    switch (crit) {
      case 'time_fit':
        return <Clock className="w-3 h-3 text-[#007AFF]" />
      case 'feasibility':
        return <Cpu className="w-3 h-3 text-[#007AFF]" />
      case 'team_fit':
        return <Users className="w-3 h-3 text-[#007AFF]" />
      case 'demo_fit':
        return <Monitor className="w-3 h-3 text-[#007AFF]" />
      case 'theme_fit':
        return <Target className="w-3 h-3 text-[#007AFF]" />
      default:
        return <Sparkles className="w-3 h-3 text-[#007AFF]" />
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={`group relative rounded-2xl border bg-white p-6 shadow-sm transition-all ${
        isTopIdea
          ? 'border-amber-300 ring-2 ring-amber-400/20 shadow-md'
          : 'border-slate-200 hover:border-[#007AFF]/50 hover:shadow-md'
      }`}
    >
      {/* Card Header: Rank, Title, Actions & Total Score */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <span
            className={`inline-flex items-center justify-center font-mono font-bold text-xs px-2.5 py-1 rounded-lg border ${
              isTopIdea
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                : 'bg-[#F5F5F7] text-[#1D1D1F] border-slate-200'
            }`}
          >
            {isTopIdea ? (
              <>
                <Trophy className="w-3.5 h-3.5 mr-1 text-amber-600 inline" />
                #1 Top Pick
              </>
            ) : (
              `#${rank}`
            )}
          </span>

          {isTopIdea && (
            <div className="hidden sm:inline-flex items-center gap-1.5" title="Top Pick Accent">
              <PixelBloomAccent size={20} />
            </div>
          )}

          <h3 className="font-heading text-lg sm:text-xl font-bold text-[#1D1D1F] group-hover:text-[#007AFF] transition-colors">
            {idea.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleCopyClick}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-[#F5F5F7] hover:bg-slate-200 text-[#1D1D1F] border border-slate-200 transition-all cursor-pointer"
            title="Copy idea formatted as Markdown"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>Copy</span>
              </>
            )}
          </button>

          <div className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-mono font-semibold bg-blue-50 text-[#007AFF] border border-blue-200 whitespace-nowrap">
            Score: {idea.total_score ? idea.total_score.toFixed(2) : 'N/A'} / 5.0
          </div>
        </div>
      </div>

      {/* Pitch */}
      <p className="mt-3 text-sm text-[#424245] font-body leading-relaxed font-normal">
        {idea.one_line_pitch}
      </p>

      {/* Duplicate warning badge */}
      {duplicateBadge && <div className="mt-3">{duplicateBadge}</div>}

      {/* MVP Box */}
      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-[#007AFF]">
          <Package className="w-3.5 h-3.5" />
          <span>Minimum Viable Version (MVP)</span>
        </div>
        <p className="text-sm text-[#1D1D1F] font-body font-medium">{idea.minimum_version}</p>
      </div>

      {/* Development Effort */}
      <div className="mt-3.5 flex items-center gap-2 text-xs font-body text-[#6E6E73]">
        <Clock className="w-3.5 h-3.5 text-[#007AFF]" />
        <span>Development Effort:</span>
        <span className="font-mono font-bold text-[#1D1D1F]">
          {idea.estimated_hours} hours (estimate)
        </span>
      </div>

      {/* Suggested Stack Badges */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-[#6E6E73]">
          <Code2 className="w-3.5 h-3.5 text-[#007AFF]" />
          <span>Suggested Stack</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(idea.stack || []).map((tech, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-medium bg-[#F5F5F7] text-[#1D1D1F] border border-slate-200"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Identified Risks & Data Sources */}
      {idea.risks && idea.risks.length > 0 && (
        <div className="mt-3.5 space-y-1 rounded-xl bg-amber-50/50 border border-amber-200/60 p-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Identified Risks</span>
          </div>
          <ul className="list-disc list-inside text-xs text-amber-900/80 space-y-0.5 font-body">
            {idea.risks.map((risk, rIdx) => (
              <li key={rIdx}>{risk}</li>
            ))}
          </ul>
        </div>
      )}

      {idea.data_sources && idea.data_sources.length > 0 && (
        <div className="mt-3.5 space-y-1 rounded-xl bg-slate-50 border border-slate-200 p-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-slate-700">
            <Database className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>Data Sources</span>
          </div>
          <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5 font-body">
            {idea.data_sources.map((src, sIdx) => {
              const isUrl = src.startsWith('http://') || src.startsWith('https://')
              return (
                <li key={sIdx}>
                  {isUrl ? (
                    <a href={src} target="_blank" rel="noopener noreferrer" className="underline hover:text-[#007AFF] inline-flex items-center gap-1">
                      {src} <ExternalLink className="w-3 h-3 inline" />
                    </a>
                  ) : (
                    src
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Rubric Breakdown Grid with 5-Segment LED Visual Meters */}
      <div className="mt-4 pt-3.5 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-[#6E6E73] mb-2.5">
          <BarChart3 className="w-3.5 h-3.5 text-[#007AFF]" />
          <span>Rubric Breakdown (5-Point Heuristic)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(idea.scores || {}).map(([crit, score]) => {
            const roundedScore = Math.round(score)
            const reason = (idea.score_explanations || {})[crit] || ''
            const label = crit.replace('_', ' ')

            return (
              <div key={crit} className="rounded-xl border border-slate-200 bg-[#F5F5F7] p-2.5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold capitalize text-[#1D1D1F] flex items-center gap-1.5">
                    {getRubricIcon(crit)}
                    <span>{label}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    {/* 5-Segment Glowing LED Meter in Apple Electric Blue */}
                    <div className="inline-flex gap-1" aria-hidden="true">
                      {[1, 2, 3, 4, 5].map((b) => (
                        <span
                          key={b}
                          className={`w-1.5 h-2.5 rounded-xs transition-all ${
                            b <= roundedScore
                              ? 'bg-[#007AFF]'
                              : 'bg-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-mono text-xs font-bold text-[#007AFF]">{score}/5</span>
                  </div>
                </div>
                {reason && <p className="text-[11px] text-[#6E6E73] font-body leading-tight">{reason}</p>}
              </div>
            )
          })}
        </div>
      </div>
    </motion.article>
  )
}
