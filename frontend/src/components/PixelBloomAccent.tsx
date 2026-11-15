import React from 'react'

interface PixelBloomAccentProps {
  size?: number
  className?: string
}

/**
 * PixelBloomAccent — Pixel-art generative bloom inspired by the user's reference image
 * Features a pixelated stem and vibrant pixel blossoms in baby blue, gold, coral, and cream.
 */
export const PixelBloomAccent: React.FC<PixelBloomAccentProps> = ({
  size = 28,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      {/* Background / shadow pixels */}
      <rect x="11" y="16" width="2" height="6" fill="#64748b" />
      <rect x="10" y="14" width="4" height="2" fill="#94a3b8" />

      {/* Stem / core base */}
      <rect x="11" y="11" width="2" height="3" fill="#f8fafc" />
      <rect x="9" y="9" width="6" height="2" fill="#f1f5f9" />

      {/* Left petal cluster (Baby Blue / Sky) */}
      <rect x="6" y="7" width="2" height="3" fill="#89cff0" />
      <rect x="4" y="6" width="2" height="2" fill="#38bdf8" />
      <rect x="6" y="5" width="2" height="2" fill="#bae6fd" />
      <rect x="8" y="6" width="1" height="2" fill="#0284c7" />

      {/* Center petal cluster (Gold / Yellow / Warm) */}
      <rect x="10" y="4" width="4" height="4" fill="#fbbf24" />
      <rect x="11" y="2" width="2" height="2" fill="#fef08a" />
      <rect x="9" y="5" width="1" height="2" fill="#f59e0b" />
      <rect x="14" y="5" width="1" height="2" fill="#d97706" />

      {/* Right petal cluster (Coral / Rose / Warm) */}
      <rect x="16" y="7" width="2" height="3" fill="#f43f5e" />
      <rect x="18" y="6" width="2" height="2" fill="#fb7185" />
      <rect x="16" y="5" width="2" height="2" fill="#fecdd3" />
      <rect x="15" y="6" width="1" height="2" fill="#e11d48" />

      {/* Ambient pixel sparks */}
      <rect x="3" y="10" width="1" height="1" fill="#89cff0" opacity="0.8" />
      <rect x="20" y="10" width="1" height="1" fill="#fbbf24" opacity="0.8" />
      <rect x="7" y="3" width="1" height="1" fill="#38bdf8" opacity="0.7" />
      <rect x="17" y="3" width="1" height="1" fill="#f43f5e" opacity="0.7" />
    </svg>
  )
}
