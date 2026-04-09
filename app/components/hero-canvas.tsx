"use client";

import { useEffect, useRef } from "react";

/**
 * BoringOS Hero — Pixelated arcade field.
 * Pac-Man agents traverse pipeline paths, eating task dots.
 * Mouse reveals hidden color underneath the dark pixel grid.
 */
export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    const mouse = { x: -9999, y: -9999 };
    let time = 0;

    const PX = 10; // pixel size
    let cols = 0, rows = 0;

    // Color layers: each pixel has a dark base + hidden bright color
    let grid: Array<{
      baseR: number; baseG: number; baseB: number;
      brightR: number; brightG: number; brightB: number;
      reveal: number; // 0 = dark, 1 = fully revealed
    }> = [];

    // Pac-Man agents
    interface PacAgent {
      x: number; y: number;
      dx: number; dy: number;
      color: number[];
      mouthAngle: number;
      speed: number;
      trail: Array<{ x: number; y: number; age: number }>;
    }

    // Dots (tasks) that agents eat
    interface Dot {
      col: number; row: number;
      eaten: boolean;
      respawnAt: number;
      color: number[];
    }

    let agents: PacAgent[] = [];
    let dots: Dot[] = [];

    const DARK_COLORS = [
      [18, 18, 28], [22, 22, 35], [28, 28, 42],
      [15, 15, 25], [25, 25, 38], [20, 20, 32],
      [30, 30, 45], [16, 16, 26], [24, 24, 36],
    ];

    const BRIGHT_COLORS = [
      [0, 255, 136],   // green
      [0, 204, 255],   // cyan
      [255, 140, 0],   // orange
      [140, 90, 255],  // purple
      [255, 60, 100],  // pink
      [0, 255, 200],   // teal
    ];

    const PAC_COLORS = [
      [255, 255, 0],   // classic yellow
      [0, 255, 136],   // green (BoringOS accent)
      [0, 204, 255],   // cyan
      [255, 140, 0],   // orange
    ];

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const r = canvas!.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas!.width = W * dpr; canvas!.height = H * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(W / PX);
      rows = Math.ceil(H / PX);

      // Initialize pixel grid
      grid = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const dark = DARK_COLORS[Math.floor(Math.random() * DARK_COLORS.length)];
          const bright = BRIGHT_COLORS[Math.floor(Math.random() * BRIGHT_COLORS.length)];
          grid.push({
            baseR: dark[0], baseG: dark[1], baseB: dark[2],
            brightR: bright[0], brightG: bright[1], brightB: bright[2],
            reveal: 0,
          });
        }
      }

      // Create Pac-Man agents
      agents = [];
      for (let i = 0; i < 4; i++) {
        agents.push({
          x: Math.random() * W,
          y: Math.random() * H,
          dx: (Math.random() < 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.6),
          dy: (Math.random() < 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.6),
          color: PAC_COLORS[i],
          mouthAngle: 0,
          speed: 1 + Math.random() * 0.5,
          trail: [],
        });
      }

      // Scatter dots
      dots = [];
      for (let i = 0; i < 40; i++) {
        const c = Math.floor(Math.random() * cols);
        const r = Math.floor(Math.random() * rows);
        dots.push({
          col: c, row: r,
          eaten: false,
          respawnAt: 0,
          color: BRIGHT_COLORS[Math.floor(Math.random() * BRIGHT_COLORS.length)],
        });
      }
    }

    function draw() {
      time += 0.016;

      // Clear canvas fully each frame
      ctx!.fillStyle = "#06060e";
      ctx!.fillRect(0, 0, W, H);

      // --- Draw pixel grid ---
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col;
          const p = grid[idx];
          const px = col * PX;
          const py = row * PX;

          // Mouse reveal
          const dx = px + PX / 2 - mouse.x;
          const dy = py + PX / 2 - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const revealRadius = 120;

          let targetReveal = 0;
          if (dist < revealRadius) {
            targetReveal = (1 - dist / revealRadius);
            targetReveal = targetReveal * targetReveal; // quadratic falloff
          }

          // Natural decay — pixels fade back to dark
          p.reveal *= 0.995; // ~3 seconds to fully fade

          // Mouse reveal boosts
          if (targetReveal > p.reveal) {
            p.reveal += (targetReveal - p.reveal) * 0.12;
          }

          // Mix colors
          const rev = p.reveal;
          const r = p.baseR + (p.brightR - p.baseR) * rev;
          const g = p.baseG + (p.brightG - p.baseG) * rev;
          const b = p.baseB + (p.brightB - p.baseB) * rev;

          ctx!.fillStyle = `rgb(${r|0},${g|0},${b|0})`;
          ctx!.fillRect(px, py, PX - 1, PX - 1);
        }
      }

      // --- Draw dots (tasks) ---
      for (const dot of dots) {
        if (dot.eaten) {
          if (time > dot.respawnAt) {
            dot.eaten = false;
            dot.col = Math.floor(Math.random() * cols);
            dot.row = Math.floor(Math.random() * rows);
          }
          continue;
        }
        const dx = dot.col * PX + PX / 2;
        const dy = dot.row * PX + PX / 2;
        const pulse = 0.6 + 0.4 * Math.sin(time * 3 + dot.col + dot.row);

        ctx!.beginPath();
        ctx!.arc(dx, dy, 3, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${dot.color[0]},${dot.color[1]},${dot.color[2]},${pulse * 0.7})`;
        ctx!.fill();

        // Small glow
        ctx!.beginPath();
        ctx!.arc(dx, dy, 8, 0, Math.PI * 2);
        const g = ctx!.createRadialGradient(dx, dy, 0, dx, dy, 8);
        g.addColorStop(0, `rgba(${dot.color[0]},${dot.color[1]},${dot.color[2]},${pulse * 0.15})`);
        g.addColorStop(1, `rgba(${dot.color[0]},${dot.color[1]},${dot.color[2]},0)`);
        ctx!.fillStyle = g;
        ctx!.fill();
      }

      // --- Update + draw Pac-Man agents ---
      for (const agent of agents) {
        // Move
        agent.x += agent.dx * agent.speed;
        agent.y += agent.dy * agent.speed;

        // Bounce off edges
        if (agent.x < 0 || agent.x > W) agent.dx *= -1;
        if (agent.y < 0 || agent.y > H) agent.dy *= -1;
        agent.x = Math.max(0, Math.min(W, agent.x));
        agent.y = Math.max(0, Math.min(H, agent.y));

        // Occasionally change direction
        if (Math.random() < 0.005) {
          agent.dx = (Math.random() < 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.6);
          agent.dy = (Math.random() < 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.6);
        }

        // Trail — fades over 20 seconds
        agent.trail.push({ x: agent.x, y: agent.y, age: 0 });
        agent.trail = agent.trail.filter(t => t.age < 20);
        for (const t of agent.trail) t.age += 0.016;

        // Eat nearby dots
        for (const dot of dots) {
          if (dot.eaten) continue;
          const ddx = agent.x - (dot.col * PX + PX / 2);
          const ddy = agent.y - (dot.row * PX + PX / 2);
          if (Math.sqrt(ddx * ddx + ddy * ddy) < 15) {
            dot.eaten = true;
            dot.respawnAt = time + 3 + Math.random() * 5;
          }
        }

        // Draw trail — same color as Pac-Man, fades over 20s
        for (const t of agent.trail) {
          const alpha = Math.max(0, (1 - t.age / 20) * 0.25);
          if (alpha <= 0.005) continue;
          const size = PX * Math.max(0.3, 1 - t.age / 20);
          const tc = Math.floor(t.x / PX) * PX;
          const tr = Math.floor(t.y / PX) * PX;
          ctx!.fillStyle = `rgba(${agent.color[0]},${agent.color[1]},${agent.color[2]},${alpha})`;
          ctx!.fillRect(tc, tr, size, size);
        }

        // Draw Pac-Man
        const mouth = Math.abs(Math.sin(time * 8)) * 0.8; // chomp
        const angle = Math.atan2(agent.dy, agent.dx);
        const radius = 8;

        // Glow
        const pg = ctx!.createRadialGradient(agent.x, agent.y, 0, agent.x, agent.y, radius * 3);
        pg.addColorStop(0, `rgba(${agent.color[0]},${agent.color[1]},${agent.color[2]},0.2)`);
        pg.addColorStop(1, `rgba(${agent.color[0]},${agent.color[1]},${agent.color[2]},0)`);
        ctx!.beginPath();
        ctx!.arc(agent.x, agent.y, radius * 3, 0, Math.PI * 2);
        ctx!.fillStyle = pg;
        ctx!.fill();

        // Body
        ctx!.beginPath();
        ctx!.arc(
          agent.x, agent.y, radius,
          angle + mouth * 0.5,
          angle + Math.PI * 2 - mouth * 0.5,
        );
        ctx!.lineTo(agent.x, agent.y);
        ctx!.closePath();
        ctx!.fillStyle = `rgb(${agent.color[0]},${agent.color[1]},${agent.color[2]})`;
        ctx!.fill();

        // Eye
        const eyeX = agent.x + Math.cos(angle + 0.5) * radius * 0.45;
        const eyeY = agent.y + Math.sin(angle + 0.5) * radius * 0.45;
        ctx!.beginPath();
        ctx!.arc(eyeX, eyeY, 1.5, 0, Math.PI * 2);
        ctx!.fillStyle = "#0a0a0f";
        ctx!.fill();
      }

      requestAnimationFrame(draw);
    }

    canvas.addEventListener("mousemove", (e) => {
      const r = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
    canvas.addEventListener("mouseleave", () => {
      mouse.x = -9999; mouse.y = -9999;
    });

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
