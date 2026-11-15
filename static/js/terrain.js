/**
 * Hackpixel - Floating Isometric Topographic Terrain
 * File: static/js/terrain.js
 * 
 * Features:
 * - Pure Canvas 2D implementation (no external 3D libraries).
 * - Pre-calculated harmonic elevation heightmap with terraced contour levels.
 * - Isometric projection with vertical extrusion (floating slab).
 * - Procedural pixel trees and architectural structures drawn in code.
 * - Gentle bobbing float and slow orbital drift.
 * - Auto-pauses on visibilitychange and IntersectionObserver off-screen.
 * - Strictly respects prefers-reduced-motion (renders a single static frame).
 */

(function () {
  "use strict";

  const canvas = document.getElementById("heroTerrainCanvas");
  if (!canvas || !canvas.getContext) {
    return; // Graceful degradation if canvas unsupported
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Configuration constants
  const GRID_SIZE = 21;          // 21x21 grid
  const HALF_GRID = Math.floor(GRID_SIZE / 2);
  const BASE_SCALE_X = 14;       // Isometric horizontal spacing
  const BASE_SCALE_Y = 7.5;      // Isometric vertical foreshortening
  const ELEVATION_SCALE = 8.5;   // Height extrusion multiplier
  const SLAB_DEPTH = 36;         // Bottom extrusion thickness (pixels)

  // Colors (Aligned with baby-blue tokens)
  const COLOR_LINE_BRIGHT = "rgba(137, 207, 240, 0.85)";  // #89cff0
  const COLOR_LINE_MUTED  = "rgba(137, 207, 240, 0.32)";
  const COLOR_LINE_DEEP   = "rgba(100, 150, 190, 0.18)";
  const COLOR_SLAB_FILL   = "#0b1017";
  const COLOR_SLAB_SIDE   = "#070b10";
  const COLOR_SLAB_BORDER = "rgba(137, 207, 240, 0.4)";
  const COLOR_TREE_FOLIAGE= "#89cff0";
  const COLOR_TREE_TRUNK  = "#4a6b82";
  const COLOR_HOUSE_WALL  = "#d0ecfa";
  const COLOR_HOUSE_ROOF  = "rgba(137, 207, 240, 0.9)";

  // 1. Precompute static heightmap (computed ONCE, never per-frame)
  const heightMap = [];
  for (let gx = -HALF_GRID; gx <= HALF_GRID; gx++) {
    const row = [];
    for (let gy = -HALF_GRID; gy <= HALF_GRID; gy++) {
      // Natural terrain harmonics: ridged hills + central canyon valley
      const d = Math.sqrt(gx * gx + gy * gy);
      const edgeWeight = Math.max(0, 1 - Math.pow(d / (HALF_GRID + 0.8), 2.5));
      
      const canyon = Math.sin(gx * 0.45) * 1.6 - Math.abs(gx * 0.4);
      const hills = Math.sin(gx * 0.38 + 0.6) * Math.cos(gy * 0.38) * 3.2
                  + Math.sin((gx + gy) * 0.28) * 1.8
                  + Math.cos((gx - gy) * 0.3) * 1.4;

      let rawZ = (hills + canyon) * edgeWeight;
      // Step terrace quantization (contour look)
      const terracedZ = Math.round(rawZ * 1.6) / 1.6;
      row.push(terracedZ);
    }
    heightMap.push(row);
  }

  // 2. Scatter procedural pixel landmarks at fixed plateau coordinates
  const landmarks = [
    // Trees on upper terraces
    { type: "tree", gx: -5, gy: -5, height: 12 },
    { type: "tree", gx: -4, gy: -6, height: 10 },
    { type: "tree", gx: -6, gy: -3, height: 14 },
    { type: "tree", gx: 4, gy: -5, height: 11 },
    { type: "tree", gx: 5, gy: -4, height: 13 },
    { type: "tree", gx: 6, gy: 3, height: 12 },
    { type: "tree", gx: 5, gy: 5, height: 10 },
    { type: "tree", gx: -4, gy: 5, height: 11 },
    // Tiny outpost structures
    { type: "house", gx: -3, gy: -4, size: 7 },
    { type: "house", gx: 4, gy: -3, size: 8 },
    { type: "house", gx: -2, gy: 4, size: 6 }
  ];

  // Animation & Motion State
  let animationFrameId = null;
  let isRunning = false;
  let isVisible = true;
  let isTabActive = true;
  let lastTime = 0;

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let prefersReducedMotion = reducedMotionQuery.matches;

  // Listen for reduced motion system changes
  if (reducedMotionQuery.addEventListener) {
    reducedMotionQuery.addEventListener("change", (e) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        stopAnimation();
        drawFrame(0);
      } else {
        startAnimation();
      }
    });
  }

  // Projection math: World (gx, gy, z) -> Rotated Screen (u, v)
  function project(gx, gy, z, angle, bob, originX, originY) {
    // Rotation around Z axis
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const rx = gx * cosA - gy * sinA;
    const ry = gx * sinA + gy * cosA;

    // Isometric 2:1 dimetric projection
    const u = originX + (rx - ry) * BASE_SCALE_X;
    const v = originY + (rx + ry) * BASE_SCALE_Y - z * ELEVATION_SCALE + bob;
    return { u, v };
  }

  // Draw one complete scene frame
  function drawFrame(time) {
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const originX = width / 2;
    const originY = height / 2 + 10;

    // Subtle bobbing & drift angles
    const bob = prefersReducedMotion ? 0 : Math.sin(time * 0.0016) * 6;
    const baseAngle = Math.PI / 4; // 45 degrees
    const driftAngle = prefersReducedMotion ? baseAngle : baseAngle + Math.sin(time * 0.0005) * 0.16;

    // Project all grid vertices for the current angle & bob
    const projected = [];
    for (let ix = 0; ix < GRID_SIZE; ix++) {
      const pRow = [];
      const gx = ix - HALF_GRID;
      for (let iy = 0; iy < GRID_SIZE; iy++) {
        const gy = iy - HALF_GRID;
        const z = heightMap[ix][iy];
        pRow.push(project(gx, gy, z, driftAngle, bob, originX, originY));
      }
      projected.push(pRow);
    }

    // A. Draw Bottom Slab Sides (Volumetric extrusion)
    ctx.fillStyle = COLOR_SLAB_FILL;
    ctx.strokeStyle = COLOR_SLAB_BORDER;
    ctx.lineWidth = 1.2;

    // Perimeter boundary edges
    const perimeterIndices = [];
    for (let iy = 0; iy < GRID_SIZE; iy++) perimeterIndices.push([0, iy]);
    for (let ix = 1; ix < GRID_SIZE; ix++) perimeterIndices.push([ix, GRID_SIZE - 1]);
    for (let iy = GRID_SIZE - 2; iy >= 0; iy--) perimeterIndices.push([GRID_SIZE - 1, iy]);
    for (let ix = GRID_SIZE - 2; ix > 0; ix--) perimeterIndices.push([ix, 0]);

    // Draw bottom base polygon
    ctx.beginPath();
    for (let i = 0; i < perimeterIndices.length; i++) {
      const [ix, iy] = perimeterIndices[i];
      const p = projected[ix][iy];
      const bx = p.u;
      const by = p.v + SLAB_DEPTH;
      if (i === 0) ctx.moveTo(bx, by);
      else ctx.lineTo(bx, by);
    }
    ctx.closePath();
    ctx.fillStyle = COLOR_SLAB_SIDE;
    ctx.fill();
    ctx.stroke();

    // Connect top perimeter to bottom slab perimeter
    for (let i = 0; i < perimeterIndices.length; i += 2) {
      const [ix, iy] = perimeterIndices[i];
      const topP = projected[ix][iy];
      ctx.beginPath();
      ctx.moveTo(topP.u, topP.v);
      ctx.lineTo(topP.u, topP.v + SLAB_DEPTH);
      ctx.strokeStyle = "rgba(137, 207, 240, 0.2)";
      ctx.stroke();
    }

    // B. Draw Topographic Contour Grid Lines
    // 1. Along Y axes
    for (let ix = 0; ix < GRID_SIZE; ix++) {
      ctx.beginPath();
      for (let iy = 0; iy < GRID_SIZE; iy++) {
        const p = projected[ix][iy];
        if (iy === 0) ctx.moveTo(p.u, p.v);
        else ctx.lineTo(p.u, p.v);
      }
      const isMajor = ix % 4 === 0;
      ctx.strokeStyle = isMajor ? COLOR_LINE_BRIGHT : COLOR_LINE_MUTED;
      ctx.lineWidth = isMajor ? 1.4 : 0.8;
      ctx.stroke();
    }

    // 2. Along X axes
    for (let iy = 0; iy < GRID_SIZE; iy++) {
      ctx.beginPath();
      for (let ix = 0; ix < GRID_SIZE; ix++) {
        const p = projected[ix][iy];
        if (ix === 0) ctx.moveTo(p.u, p.v);
        else ctx.lineTo(p.u, p.v);
      }
      const isMajor = iy % 4 === 0;
      ctx.strokeStyle = isMajor ? COLOR_LINE_BRIGHT : COLOR_LINE_DEEP;
      ctx.lineWidth = isMajor ? 1.4 : 0.8;
      ctx.stroke();
    }

    // C. Draw Procedural Pixel Trees & Outposts
    landmarks.forEach((item) => {
      const ix = item.gx + HALF_GRID;
      const iy = item.gy + HALF_GRID;
      if (ix >= 0 && ix < GRID_SIZE && iy >= 0 && iy < GRID_SIZE) {
        const p = projected[ix][iy];
        
        if (item.type === "tree") {
          // Pixel Pine Tree: 1px trunk + tiered triangular pixel canopy
          const th = item.height;
          // Trunk
          ctx.beginPath();
          ctx.moveTo(p.u, p.v);
          ctx.lineTo(p.u, p.v - th * 0.4);
          ctx.strokeStyle = COLOR_TREE_TRUNK;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Canopy tiers
          ctx.fillStyle = COLOR_TREE_FOLIAGE;
          ctx.beginPath();
          ctx.moveTo(p.u, p.v - th);
          ctx.lineTo(p.u - 4, p.v - th * 0.35);
          ctx.lineTo(p.u + 4, p.v - th * 0.35);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(p.u, p.v - th * 0.75);
          ctx.lineTo(p.u - 6, p.v - th * 0.2);
          ctx.lineTo(p.u + 6, p.v - th * 0.2);
          ctx.closePath();
          ctx.fill();
        } else if (item.type === "house") {
          // Pixel House: tiny wireframe isometric cuboid
          const s = item.size;
          const hx = p.u;
          const hy = p.v;

          ctx.fillStyle = COLOR_HOUSE_WALL;
          ctx.fillRect(hx - s / 2, hy - s, s, s);

          // Roof triangle
          ctx.fillStyle = COLOR_HOUSE_ROOF;
          ctx.beginPath();
          ctx.moveTo(hx - s / 2 - 1, hy - s);
          ctx.lineTo(hx, hy - s - 4);
          ctx.lineTo(hx + s / 2 + 1, hy - s);
          ctx.closePath();
          ctx.fill();

          // Door
          ctx.fillStyle = COLOR_SLAB_SIDE;
          ctx.fillRect(hx - 1, hy - 3, 2, 3);
        }
      }
    });
  }

  // Animation Loop Controller
  function tick(timestamp) {
    if (!isRunning) return;

    if (isVisible && isTabActive && !prefersReducedMotion) {
      drawFrame(timestamp);
      animationFrameId = requestAnimationFrame(tick);
    }
  }

  function startAnimation() {
    if (prefersReducedMotion) {
      drawFrame(0);
      return;
    }
    if (!isRunning && isVisible && isTabActive) {
      isRunning = true;
      animationFrameId = requestAnimationFrame(tick);
    }
  }

  function stopAnimation() {
    isRunning = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  // IntersectionObserver to pause off-screen
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            startAnimation();
          } else {
            stopAnimation();
          }
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);
  }

  // Page Visibility API to pause background tabs
  document.addEventListener("visibilitychange", () => {
    isTabActive = !document.hidden;
    if (isTabActive && isVisible) {
      startAnimation();
    } else {
      stopAnimation();
    }
  });

  // Initial render
  if (prefersReducedMotion) {
    drawFrame(0);
  } else {
    startAnimation();
  }

  // Expose for debugging / tests
  window.HackpixelTerrain = {
    drawFrame,
    startAnimation,
    stopAnimation,
    isAnimating: () => isRunning
  };
})();
