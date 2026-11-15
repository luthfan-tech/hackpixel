import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface Hero3DLaptopProps {
  className?: string
}

export const Hero3DLaptop: React.FC<Hero3DLaptopProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth || 600
    const height = container.clientHeight || 450

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    camera.position.set(0, 0.35, 3.8)
    camera.lookAt(0, 0.1, 0)

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true, 
      powerPreference: 'high-performance' 
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.shadowMap.enabled = true
    container.appendChild(renderer.domElement)

    // 2. Apple Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0)
    scene.add(ambientLight)

    // Main studio key light (top right)
    const mainLight = new THREE.DirectionalLight(0xffffff, 2.4)
    mainLight.position.set(4, 5, 4)
    scene.add(mainLight)

    // Electric Blue rim light for metallic bevel highlights (#007AFF)
    const rimLight = new THREE.DirectionalLight(0x007aff, 1.8)
    rimLight.position.set(-3, 3, -2)
    scene.add(rimLight)

    // Front fill light
    const fillLight = new THREE.DirectionalLight(0xf5f5f7, 1.2)
    fillLight.position.set(0, 2, 4)
    scene.add(fillLight)

    // 3. Apple Modern Metallic Materials
    // Anodized aluminum chassis
    const chassisMaterial = new THREE.MeshStandardMaterial({
      color: 0xc8cdd5,
      metalness: 0.92,
      roughness: 0.16,
    })

    // Keyboard well
    const keyboardWellMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f242c,
      metalness: 0.5,
      roughness: 0.4,
    })

    // Individual black keys
    const keyMaterial = new THREE.MeshStandardMaterial({
      color: 0x14181f,
      metalness: 0.2,
      roughness: 0.35,
    })

    // Trackpad frosted glass
    const trackpadMaterial = new THREE.MeshStandardMaterial({
      color: 0xb8bec8,
      metalness: 0.85,
      roughness: 0.2,
    })

    // Display bezel
    const bezelMaterial = new THREE.MeshStandardMaterial({
      color: 0x12151b,
      metalness: 0.9,
      roughness: 0.15,
    })

    // Electric Blue accent edge trim (#007AFF)
    const edgeTrimMaterial = new THREE.MeshStandardMaterial({
      color: 0x007aff,
      metalness: 0.95,
      roughness: 0.1,
    })

    // 4. Dynamic Screen Canvas Texture (Retina-style terminal)
    const screenCanvas = document.createElement('canvas')
    screenCanvas.width = 1024
    screenCanvas.height = 640
    const sCtx = screenCanvas.getContext('2d')

    function drawScreen(cursorBlink: boolean) {
      if (!sCtx) return

      // Dark retina screen background
      sCtx.fillStyle = '#0f141c'
      sCtx.fillRect(0, 0, 1024, 640)

      // macOS style Window title bar
      sCtx.fillStyle = '#181f2a'
      sCtx.fillRect(0, 0, 1024, 52)

      // Traffic light dots: Close, Minimize, Zoom
      sCtx.fillStyle = '#ff5f56'
      sCtx.beginPath()
      sCtx.arc(36, 26, 8, 0, Math.PI * 2)
      sCtx.fill()

      sCtx.fillStyle = '#ffbd2e'
      sCtx.beginPath()
      sCtx.arc(64, 26, 8, 0, Math.PI * 2)
      sCtx.fill()

      sCtx.fillStyle = '#27c93f'
      sCtx.beginPath()
      sCtx.arc(92, 26, 8, 0, Math.PI * 2)
      sCtx.fill()

      // Window title
      sCtx.fillStyle = '#86868b'
      sCtx.font = '600 20px -apple-system, BlinkMacSystemFont, sans-serif'
      sCtx.fillText('hackpixel-studio — ideation-engine', 124, 33)

      // Terminal header & status
      sCtx.font = 'bold 22px monospace'
      sCtx.fillStyle = '#007aff'
      sCtx.fillText('> SYS.READY --target="hackathon_assistant"', 48, 105)

      sCtx.fillStyle = '#38bdf8'
      sCtx.fillText('> AI INFERENCE: GOOGLE GEMINI 3.5 FLASH [ONLINE]', 48, 148)

      sCtx.font = '20px monospace'
      sCtx.fillStyle = '#f5f5f7'
      sCtx.fillText('> Constraints: 24h · 3 Devs · Stack: Next.js + Tailwind + FastAPI', 48, 195)

      sCtx.fillStyle = '#34d399'
      sCtx.fillText('✔ Rubric Validation: Time Fit (25%), Feasibility (25%), Team (20%)', 48, 240)
      sCtx.fillText('✔ GitHub Repository Scanner: 0 Duplicate Conflicts', 48, 280)

      // Sleek telemetry visual box
      sCtx.fillStyle = '#161d27'
      sCtx.fillRect(48, 325, 928, 190)
      sCtx.strokeStyle = '#007aff'
      sCtx.lineWidth = 2.5

      // Elegant smooth telemetry line
      sCtx.beginPath()
      for (let x = 0; x < 928; x += 8) {
        const y = 420 + Math.sin(x * 0.02) * 35 * Math.sin(x * 0.005)
        if (x === 0) sCtx.moveTo(48 + x, y)
        else sCtx.lineTo(48 + x, y)
      }
      sCtx.stroke()

      // Prompt and blinking cursor
      sCtx.fillStyle = '#ffffff'
      sCtx.font = 'bold 22px monospace'
      sCtx.fillText(`> Status: 10/10 Ideas Generated ${cursorBlink ? '█' : ' '}`, 48, 565)
    }

    drawScreen(true)
    const screenTexture = new THREE.CanvasTexture(screenCanvas)
    screenTexture.minFilter = THREE.LinearFilter

    const screenMaterial = new THREE.MeshBasicMaterial({
      map: screenTexture,
    })

    // 5. Laptop 3D Mesh Assembly with Smooth Curved Edges & Full Unibody Contours
    const laptopGroup = new THREE.Group()

    // Helper to create rounded 2D shape in X-Y plane
    const createRoundedShape = (w: number, d: number, r: number) => {
      const shape = new THREE.Shape()
      const x = -w / 2
      const y = -d / 2
      const radius = Math.min(r, w / 2, d / 2)
      shape.moveTo(x + radius, y)
      shape.lineTo(x + w - radius, y)
      shape.quadraticCurveTo(x + w, y, x + w, y + radius)
      shape.lineTo(x + w, y + d - radius)
      shape.quadraticCurveTo(x + w, y + d, x + w - radius, y + d)
      shape.lineTo(x + radius, y + d)
      shape.quadraticCurveTo(x, y + d, x, y + d - radius)
      shape.lineTo(x, y + radius)
      shape.quadraticCurveTo(x, y, x + radius, y)
      return shape
    }

    // A. Base Chassis (Bottom Half) — Smooth Curved Unibody
    const baseWidth = 2.45
    const baseDepth = 1.62
    const baseShape = createRoundedShape(baseWidth, baseDepth, 0.12)
    const baseGeometry = new THREE.ExtrudeGeometry(baseShape, {
      depth: 0.048,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: 0.018,
      bevelThickness: 0.016,
    })
    baseGeometry.center()
    baseGeometry.rotateX(Math.PI / 2)
    const baseMesh = new THREE.Mesh(baseGeometry, chassisMaterial)
    baseMesh.castShadow = true
    baseMesh.receiveShadow = true
    laptopGroup.add(baseMesh)

    // Sleek Electric Blue curved perimeter line under chassis
    const trimShape = createRoundedShape(baseWidth + 0.03, baseDepth + 0.03, 0.125)
    const trimGeo = new THREE.ExtrudeGeometry(trimShape, {
      depth: 0.012,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.005,
      bevelThickness: 0.005,
    })
    trimGeo.center()
    trimGeo.rotateX(Math.PI / 2)
    const trimMesh = new THREE.Mesh(trimGeo, edgeTrimMaterial)
    trimMesh.position.set(0, -0.042, 0)
    laptopGroup.add(trimMesh)

    // Keyboard well indent with soft rounded corners
    const wellShape = createRoundedShape(2.16, 0.94, 0.05)
    const wellGeometry = new THREE.ExtrudeGeometry(wellShape, {
      depth: 0.014,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.004,
      bevelThickness: 0.004,
    })
    wellGeometry.center()
    wellGeometry.rotateX(Math.PI / 2)
    const wellMesh = new THREE.Mesh(wellGeometry, keyboardWellMaterial)
    wellMesh.position.set(0, 0.042, -0.15)
    laptopGroup.add(wellMesh)

    // Keyboard Keys Grid
    const keyRows = 5
    const keyCols = 14
    const keyW = 0.125
    const keyH = 0.022
    const keyD = 0.125
    const gap = 0.024
    const keysGroup = new THREE.Group()

    for (let r = 0; r < keyRows; r++) {
      for (let c = 0; c < keyCols; c++) {
        const kGeo = new THREE.BoxGeometry(keyW, keyH, keyD)
        const kMesh = new THREE.Mesh(kGeo, keyMaterial)
        const kX = (c - (keyCols - 1) / 2) * (keyW + gap)
        const kZ = (r - (keyRows - 1) / 2) * (keyD + gap)
        kMesh.position.set(kX, 0.052, kZ - 0.15)
        keysGroup.add(kMesh)
      }
    }
    laptopGroup.add(keysGroup)

    // Trackpad with rounded corners
    const trackpadShape = createRoundedShape(0.74, 0.48, 0.04)
    const trackpadGeo = new THREE.ExtrudeGeometry(trackpadShape, {
      depth: 0.006,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.003,
      bevelThickness: 0.003,
    })
    trackpadGeo.center()
    trackpadGeo.rotateX(Math.PI / 2)
    const trackpadMesh = new THREE.Mesh(trackpadGeo, trackpadMaterial)
    trackpadMesh.position.set(0, 0.043, 0.5)
    laptopGroup.add(trackpadMesh)

    // B. Screen Lid (Top Half with Hinge) — Curvy Rounded Corners, 90 Degrees Upright!
    const lidGroup = new THREE.Group()
    lidGroup.position.set(0, 0.04, -0.81) // Hinge position at back edge

    const lidWidth = 2.45
    const lidHeight = 1.58
    const lidShape = createRoundedShape(lidWidth, lidHeight, 0.12)
    const lidGeometry = new THREE.ExtrudeGeometry(lidShape, {
      depth: 0.028,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: 0.014,
      bevelThickness: 0.014,
    })
    lidGeometry.center()
    const lidMesh = new THREE.Mesh(lidGeometry, bezelMaterial)
    lidMesh.position.set(0, lidHeight / 2, 0)
    lidGroup.add(lidMesh)

    // Screen display panel with rounded corners matching the bezel
    const screenPanelWidth = 2.28
    const screenPanelHeight = 1.42
    const screenPanelShape = createRoundedShape(screenPanelWidth, screenPanelHeight, 0.06)
    const screenGeometry = new THREE.ShapeGeometry(screenPanelShape)
    screenGeometry.center()
    const screenMesh = new THREE.Mesh(screenGeometry, screenMaterial)
    screenMesh.position.set(0, lidHeight / 2, 0.03)
    lidGroup.add(screenMesh)

    // Exactly 90-degree upright open angle (perpendicular to base deck)
    lidGroup.rotation.x = 0
    laptopGroup.add(lidGroup)

    // Centered upright placement in hero
    laptopGroup.position.set(0, -0.15, 0)
    laptopGroup.rotation.set(0.12, -0.22, 0.01)
    scene.add(laptopGroup)

    // 6. Photorealistic Soft Radial Gradient Ground Shadow (No hard polygonal edges!)
    const shadowCanvas = document.createElement('canvas')
    shadowCanvas.width = 256
    shadowCanvas.height = 256
    const sCtx2 = shadowCanvas.getContext('2d')
    if (sCtx2) {
      const grad = sCtx2.createRadialGradient(128, 128, 0, 128, 128, 128)
      grad.addColorStop(0, 'rgba(29, 29, 31, 0.18)')
      grad.addColorStop(0.4, 'rgba(29, 29, 31, 0.08)')
      grad.addColorStop(1, 'rgba(29, 29, 31, 0)')
      sCtx2.fillStyle = grad
      sCtx2.fillRect(0, 0, 256, 256)
    }
    const softShadowTexture = new THREE.CanvasTexture(shadowCanvas)
    const shadowGeo = new THREE.PlaneGeometry(3.6, 2.6)
    const shadowMat = new THREE.MeshBasicMaterial({
      map: softShadowTexture,
      transparent: true,
      depthWrite: false,
    })
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat)
    shadowMesh.rotation.x = -Math.PI / 2
    shadowMesh.position.set(0, -0.65, 0)
    scene.add(shadowMesh)

    setIsLoaded(true)

    // 7. Smooth Parallax Mouse Tracking
    let mouseX = 0
    let mouseY = 0
    let targetRotationX = 0.12
    let targetRotationY = -0.22

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
      targetRotationY = -0.22 + mouseX * 0.10
      targetRotationX = 0.12 - mouseY * 0.06
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)

    // 8. Calm & Efficient Animation Loop
    let isVisible = true
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
    })
    observer.observe(container)

    let animationFrameId: number
    const clock = new THREE.Clock()
    let lastBlinkTime = 0
    let cursorBlink = true

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      if (!isVisible || document.hidden) return

      const elapsedTime = clock.getElapsedTime()

      // Calm, gentle float
      laptopGroup.position.y = -0.15 + Math.sin(elapsedTime * 0.75) * 0.025
      laptopGroup.rotation.y += (targetRotationY - laptopGroup.rotation.y) * 0.035
      laptopGroup.rotation.x += (targetRotationX - laptopGroup.rotation.x) * 0.035
      laptopGroup.rotation.z = Math.sin(elapsedTime * 0.6) * 0.006

      // Shadow breathing
      shadowMesh.scale.setScalar(1 + Math.sin(elapsedTime * 0.75) * 0.03)

      // Blinking cursor
      if (elapsedTime - lastBlinkTime > 0.6) {
        cursorBlink = !cursorBlink
        drawScreen(cursorBlink)
        screenTexture.needsUpdate = true
        lastBlinkTime = elapsedTime
      }

      renderer.render(scene, camera)
    }

    animate()

    // 9. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      observer.disconnect()
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <div className={`relative w-full h-[400px] sm:h-[460px] md:h-[510px] flex items-center justify-center overflow-hidden ${className}`}>
      {/* Floating 3D Laptop Canvas Container (z-10) */}
      <div 
        ref={containerRef} 
        className="relative z-10 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Prominent Brand Title IN FRONT of the 3D Floating Laptop in Apple Electric Blue with crisp white contour outline (z-20) */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-20"
        aria-hidden="true"
      >
        <span 
          className="font-heading text-[11vw] sm:text-[12.5vw] md:text-[12.5vw] font-black tracking-tight text-[#007AFF] uppercase leading-none text-center select-none"
          style={{
            WebkitTextStroke: '2.5px #FFFFFF',
            paintOrder: 'stroke fill',
            filter: 'drop-shadow(0 0 16px rgba(255, 255, 255, 0.95)) drop-shadow(0 4px 20px rgba(0, 122, 255, 0.35)) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.12))',
          }}
        >
          HACKPIXEL
        </span>
      </div>

      {/* Loading Fallback */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="w-56 h-36 rounded-2xl border border-slate-300 bg-white/80 shadow-md animate-pulse flex items-center justify-center">
            <span className="text-xs font-mono text-slate-500">Loading 3D Hardware...</span>
          </div>
        </div>
      )}
    </div>
  )
}
