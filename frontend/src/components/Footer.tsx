import React from 'react'
import { Coffee, ExternalLink, ShieldCheck, FileText, Activity, Code2 } from 'lucide-react'

const BMC_URL = "https://buymeacoffee.com/luthfanmakl"
const GITHUB_REPO_URL = "https://github.com/luthfan-tech/hackpixel"

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
              <div className="h-8 w-8 rounded-xl bg-[#0A2540] flex items-center justify-center text-white font-bold font-mono text-sm shadow-xs">
                HP
              </div>
              <h3 className="font-heading font-black text-xl tracking-tight text-[#0A2540]">
                Hackpixel
              </h3>
              <span className="text-xs font-mono text-[#007AFF] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold">
                v2.5 Studio
              </span>
            </div>
            
            <p className="text-sm text-[#505054] font-body leading-relaxed max-w-sm">
              Practical hackathon idea assistant providing scoped MVPs, tailored tech stacks, and transparent 5-dimension rubric rankings for developer teams.
            </p>
          </div>

          {/* Col 2: Source Code & Resources (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-[#1D1D1F]">
              Source Code
            </h4>
            <ul className="space-y-2.5 text-sm font-body">
              <li>
                <a 
                  href={GITHUB_REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#505054] hover:text-[#007AFF] transition-colors flex items-center gap-2"
                >
                  <Code2 className="w-4 h-4 text-[#007AFF]" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a 
                  href={`${GITHUB_REPO_URL}#readme`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#505054] hover:text-[#007AFF] transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Architecture Spec &amp; README</span>
                </a>
              </li>
              <li>
                <a 
                  href="/api/status" 
                  className="text-[#505054] hover:text-[#007AFF] transition-colors flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>System Telemetry</span>
                </a>
              </li>
              <li>
                <a 
                  href="/health" 
                  className="text-[#505054] hover:text-[#007AFF] transition-colors flex items-center gap-2"
                >
                  <Activity className="w-4 h-4 text-slate-400" />
                  <span>Service Health Check</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Support & Buy Me a Coffee with QR Code (4 cols) */}
          <div className="md:col-span-4 space-y-3 rounded-2xl border border-slate-200 bg-[#F5F5F7] p-5 shadow-xs">
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-amber-500" />
              <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-[#1D1D1F]">
                Support the Project
              </h4>
            </div>
            
            <p className="text-sm text-[#505054] font-body leading-relaxed">
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-heading font-bold bg-[#007AFF] hover:bg-[#0066d6] text-white shadow-sm transition-all cursor-pointer"
                >
                  <Coffee className="w-4 h-4 fill-current text-white" />
                  <span>Buy me a coffee</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white" />
                </a>
                <div className="text-xs font-mono text-[#6E6E73]">
                  Scan QR or tap to open
                </div>
              </div>
            </div>

            {/* Small & Professional Footer Note below Buy Me A Coffee */}
            <p className="pt-2 text-xs text-[#6E6E73] font-body border-t border-slate-200/80 leading-relaxed">
              Open-source developer utility built to help engineers, students, and teams build resilient hackathon projects on deadline.
            </p>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Info */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#6E6E73] font-body">
          <p>
            &copy; <span id="copyrightYear">{currentYear}</span> Hackpixel. All rights reserved.
          </p>
          <p className="text-xs text-[#6E6E73] font-body">
            Empowering developers to scope, build, and ship winning projects on time.
          </p>
        </div>
      </div>
    </footer>
  )
}
