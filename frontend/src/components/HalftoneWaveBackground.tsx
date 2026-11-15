import React, { useEffect, useRef } from 'react'

interface HalftoneWaveBackgroundProps {
  className?: string
}

export const HalftoneWaveBackground: React.FC<HalftoneWaveBackgroundProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let isVisible = true
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Resize handler
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    // IntersectionObserver to pause when off-screen
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
    })
    observer.observe(canvas)

    let time = 0
    const step = 20 // Dot grid spacing in CSS px

    const render = () => {
      if (!canvas || !ctx) return
      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height

      ctx.clearRect(0, 0, width, height)

      // Draw dot matrix topography waves inspired by reference image
      for (let x = 0; x < width; x += step) {
        for (let y = 0; y < height; y += step) {
          // Dual harmonic wave function
          const wave1 = Math.sin(x * 0.006 + time * 0.4) * Math.cos(y * 0.006 + time * 0.3)
          const wave2 = Math.sin((x + y) * 0.004 + time * 0.6) * 0.5
          const elevation = (wave1 + wave2 + 1.5) / 3 // Normalized 0..1

          if (elevation < 0.25) continue // Don't draw in deep voids

          const radius = 0.5 + elevation * 2.2
          const alpha = Math.min(0.35, Math.max(0.04, (elevation - 0.2) * 0.5))

          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          // Gradient from deep slate to baby-blue accent (#89cff0)
          if (elevation > 0.75) {
            ctx.fillStyle = `rgba(137, 207, 240, ${alpha * 1.5})`
          } else if (elevation > 0.5) {
            ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`
          } else {
            ctx.fillStyle = `rgba(148, 163, 184, ${alpha * 0.7})`
          }
          ctx.fill()
        }
      }

      if (prefersReducedMotion) return // Draw once for reduced motion

      time += 0.012

      if (isVisible && !document.hidden) {
        animationFrameId = requestAnimationFrame(render)
      } else {
        // Retry lightly when tab resumes
        setTimeout(() => {
          if (!document.hidden && isVisible) {
            animationFrameId = requestAnimationFrame(render)
          }
        }, 500)
      }
    }

    render()

    const handleVisibilityChange = () => {
      if (!document.hidden && isVisible && !prefersReducedMotion) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = requestAnimationFrame(render)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      observer.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
    />
  )
}
