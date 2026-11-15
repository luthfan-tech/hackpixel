import React from 'react'
import { Coffee, ExternalLink, ShieldCheck, FileText, Activity } from 'lucide-react'

const BMC_URL = "https://buymeacoffee.com/luthfanmakl"

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer 
      id="appFooter"
      aria-label="Site footer"
      className="relative z-10 border-t border-slate-200 bg-white py-12 px-4 sm:px-6 lg:px-8 text-[#1D1D1F]"
    >
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Main 3-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Col 1: About & Purpose (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-[#1D1D1F] flex items-center justify-center text-white font-bold font-mono text-xs shadow-xs">
                HP
              </div>
              <h3 className="font-heading font-extrabold text-base tracking-tight text-[#1D1D1F]">
                Hackpixel
              </h3>
              <span className="text-[10px] font-mono text-[#007AFF] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                v2.5 Studio
              </span>
            </div>
            
            <p className="text-xs text-[#6E6E73] font-body leading-relaxed max-w-sm">
              Practical hackathon idea assistant providing scoped MVPs, tailored tech stacks, and transparent 5-dimension rubric rankings for developer teams.
            </p>
          </div>

          {/* Col 2: Documentation & Spec Links (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#1D1D1F]">
              Documentation &amp; API
            </h4>
            <ul className="space-y-2 text-xs font-body">
              <li>
                <a 
                  href="/README.md" 
                  className="text-[#6E6E73] hover:text-[#007AFF] transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Project README &amp; Spec</span>
                </a>
              </li>
              <li>
                <a 
                  href="/health" 
                  className="text-[#6E6E73] hover:text-[#007AFF] transition-colors flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                  <span>API Health Check</span>
                </a>
              </li>
              <li>
                <a 
                  href="/api/status" 
                  className="text-[#6E6E73] hover:text-[#007AFF] transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Safe Config Telemetry</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Support & Buy Me a Coffee with QR Code (4 cols) */}
          <div className="md:col-span-4 space-y-3 rounded-2xl border border-slate-200 bg-[#F5F5F7] p-5 shadow-xs">
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-amber-500" />
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#1D1D1F]">
                Support the Project
              </h4>
            </div>
            
            <p className="text-xs text-[#6E6E73] font-body">
              If Hackpixel helped your team scope and win a hackathon, buy us a coffee to keep the AI servers running!
            </p>

            {/* QR Code and Button Row */}
            <div className="flex items-center gap-4 pt-1">
              {/* QR Code wrapper with clean silver border */}
              <div className="relative group p-1.5 bg-white rounded-xl border border-slate-200 shadow-sm flex-shrink-0">
                <img 
                  src="/bmc-qr.jpg" 
                  alt="QR code for the Buy Me a Coffee page" 
                  className="w-20 h-20 rounded-lg object-contain bg-white"
                  width="80"
                  height="80"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = '/bmc-qr.svg'
                  }}
                />
              </div>

              {/* Action Button & Link */}
              <div className="space-y-2">
                <a
                  href={BMC_URL}
                  id="bmcBtn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-heading font-bold bg-[#007AFF] hover:bg-[#0066d6] text-white shadow-sm transition-all cursor-pointer"
                >
                  <Coffee className="w-3.5 h-3.5 fill-current text-white" />
                  <span>Buy me a coffee</span>
                  <ExternalLink className="w-3 h-3 text-white" />
                </a>
                <div className="text-[10px] font-mono text-[#86868B]">
                  Scan QR or tap to open
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Info */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#86868B] font-body">
          <p>
            &copy; <span id="copyrightYear">{currentYear}</span> Hackpixel. Built with Next.js/Vite, React 19, Tailwind CSS v4, and Google Gemini 2.5.
          </p>
          <p className="font-mono text-[11px] text-[#86868B]">
            Apple Modern Palette // WCAG AAA Compliant // Open Heuristic Rubrics
          </p>
        </div>
      </div>
    </footer>
  )
}
