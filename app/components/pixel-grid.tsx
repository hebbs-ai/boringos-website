"use client";

import { useEffect, useRef } from "react";

const PALETTE: Record<string, number[]> = {
  green:  [0, 255, 136],
  cyan:   [0, 204, 255],
  orange: [255, 107, 0],
  purple: [138, 100, 255],
  teal:   [0, 255, 200],
  dim:    [100, 100, 130],
};
const COLOR_KEYS = Object.keys(PALETTE);

interface Node {
  x: number; y: number;
  ox: number; oy: number;
  vx: number; vy: number;
  radius: number;
  color: string;
  importance: number;
  phase: number;
  freq: number;
}

export function PixelGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    let nodes: Node[] = [];
    let pulses: Array<{ from: number; to: number; t: number; color: string }> = [];
    let time = 0;
    let lastPulse = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      canvas!.style.width = W + "px";
      canvas!.style.height = H + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      initNodes();
    }

    function initNodes() {
      const count = Math.min(80, Math.floor((W * H) / 15000));
      nodes = [];
      for (let i = 0; i < count; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        const colorKey = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
        nodes.push({
          x, y, ox: x, oy: y,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: 2 + Math.random() * 3,
          color: colorKey,
          importance: 0.3 + Math.random() * 0.7,
          phase: Math.random() * Math.PI * 2,
          freq: 0.8 + Math.random() * 0.8,
        });
      }
    }

    function draw() {
      time += 0.016;
      ctx!.clearRect(0, 0, W, H);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Spawn pulses
      if (time - lastPulse > 1.2 && nodes.length > 1) {
        const a = Math.floor(Math.random() * nodes.length);
        let b = Math.floor(Math.random() * nodes.length);
        if (b === a) b = (b + 1) % nodes.length;
        const dx = nodes[a].x - nodes[b].x;
        const dy = nodes[a].y - nodes[b].y;
        if (Math.sqrt(dx * dx + dy * dy) < 200) {
          pulses.push({ from: a, to: b, t: 0, color: nodes[a].color });
          lastPulse = time;
        }
      }

      // Draw connections
      ctx!.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            const alpha = (1 - dist / 160) * 0.12;
            const c = PALETTE[nodes[i].color];
            ctx!.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
            ctx!.beginPath();
            ctx!.moveTo(nodes[i].x, nodes[i].y);
            ctx!.lineTo(nodes[j].x, nodes[j].y);
            ctx!.stroke();
          }
        }
      }

      // Draw + update pulses
      pulses = pulses.filter(p => p.t < 1);
      for (const p of pulses) {
        p.t += 0.02;
        const a = nodes[p.from];
        const b = nodes[p.to];
        const px = a.x + (b.x - a.x) * p.t;
        const py = a.y + (b.y - a.y) * p.t;
        const c = PALETTE[p.color];
        const alpha = Math.sin(p.t * Math.PI) * 0.8;
        ctx!.beginPath();
        ctx!.arc(px, py, 2, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
        ctx!.fill();
      }

      // Update + draw nodes
      for (const n of nodes) {
        // Drift
        n.x += n.vx;
        n.y += n.vy;

        // Pull back to origin (rubber band)
        n.vx += (n.ox - n.x) * 0.0008;
        n.vy += (n.oy - n.y) * 0.0008;

        // Mouse repulsion — liquid push
        const mdx = n.x - mx;
        const mdy = n.y - my;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 180 && mdist > 0) {
          const force = (180 - mdist) / 180 * 0.6;
          n.vx += (mdx / mdist) * force;
          n.vy += (mdy / mdist) * force;
        }

        // Damping
        n.vx *= 0.97;
        n.vy *= 0.97;

        // Wrap edges
        if (n.x < -20) n.x = W + 20;
        if (n.x > W + 20) n.x = -20;
        if (n.y < -20) n.y = H + 20;
        if (n.y > H + 20) n.y = -20;

        // Breathing
        const breathe = Math.sin(time * n.freq + n.phase);
        const baseAlpha = (0.4 + 0.3 * breathe) * n.importance;

        // Mouse proximity glow boost
        let glowBoost = 0;
        if (mdist < 200) {
          glowBoost = (1 - mdist / 200) * 0.6;
        }

        const c = PALETTE[n.color];
        const r = n.radius * (1 + breathe * 0.15);

        // Outer glow
        const glowR = r * (4 + glowBoost * 6);
        const grad = ctx!.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
        grad.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${(baseAlpha + glowBoost) * 0.25})`);
        grad.addColorStop(0.4, `rgba(${c[0]},${c[1]},${c[2]},${(baseAlpha + glowBoost) * 0.06})`);
        grad.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        ctx!.fillStyle = grad;
        ctx!.fill();

        // Core
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${baseAlpha + glowBoost})`;
        ctx!.fill();

        // Center bright spot
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, r * 0.4, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255,255,255,${(baseAlpha + glowBoost) * 0.6})`;
        ctx!.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    }

    function onMouseMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }

    function onMouseLeave() {
      mouseRef.current = { x: -9999, y: -9999 };
    }

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    resize();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
