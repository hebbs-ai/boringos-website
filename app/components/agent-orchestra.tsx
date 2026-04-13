"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Agent Orchestra — animated visualization of AI agents collaborating.
 *
 * Shows a central "brain" node with orbiting agent nodes connected by
 * animated data streams. Agents pulse, delegate tasks (particles flow
 * between them), and status labels cycle through real actions.
 *
 * Pure canvas — no dependencies.
 */

interface AgentNode {
  id: string;
  label: string;
  role: string;
  color: number[];
  angle: number;       // orbital angle (radians)
  orbitRadius: number;
  orbitSpeed: number;
  x: number;
  y: number;
  radius: number;
  pulsePhase: number;
  status: string;
  statusIdx: number;
  statusTimer: number;
  statuses: string[];
}

interface Particle {
  fromId: string;
  toId: string;
  progress: number;   // 0..1
  speed: number;
  color: number[];
  size: number;
}

interface TaskDot {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
  alpha: number;
  color: number[];
  label: string;
}

const AGENT_DEFS: Omit<AgentNode, "x" | "y" | "pulsePhase" | "statusTimer" | "statusIdx" | "status">[] = [
  {
    id: "ceo",
    label: "CEO",
    role: "Strategic Planning",
    color: [0, 255, 136],
    angle: -Math.PI / 2,
    orbitRadius: 180,
    orbitSpeed: 0.08,
    radius: 28,
    statuses: ["Planning Q3 strategy", "Reviewing KPIs", "Delegating to CTO", "Analyzing market data", "Setting priorities"],
  },
  {
    id: "cto",
    label: "CTO",
    role: "Technical Lead",
    color: [0, 204, 255],
    angle: Math.PI / 6,
    orbitRadius: 180,
    orbitSpeed: 0.1,
    radius: 26,
    statuses: ["Breaking down tasks", "Assigning engineers", "Reviewing PRs", "Architecting system", "Running tests"],
  },
  {
    id: "eng1",
    label: "Engineer",
    role: "Frontend",
    color: [140, 90, 255],
    angle: Math.PI * 0.6,
    orbitRadius: 160,
    orbitSpeed: 0.14,
    radius: 20,
    statuses: ["Writing React code", "Building dashboard", "Fixing UI bug", "Deploying changes", "Updating tests"],
  },
  {
    id: "eng2",
    label: "Engineer",
    role: "Backend",
    color: [255, 140, 0],
    angle: Math.PI * 1.1,
    orbitRadius: 165,
    orbitSpeed: 0.12,
    radius: 20,
    statuses: ["Writing API routes", "Optimizing queries", "Adding auth", "Database migration", "Code review"],
  },
  {
    id: "qa",
    label: "QA",
    role: "Quality",
    color: [255, 60, 100],
    angle: Math.PI * 1.6,
    orbitRadius: 155,
    orbitSpeed: 0.11,
    radius: 18,
    statuses: ["Running test suite", "Filing bug report", "Validating fix", "E2E testing", "Performance audit"],
  },
  {
    id: "copilot",
    label: "Copilot",
    role: "AI Assistant",
    color: [0, 255, 200],
    angle: Math.PI * 2.1,
    orbitRadius: 170,
    orbitSpeed: 0.09,
    radius: 22,
    statuses: ["Answering query", "Editing codebase", "Generating report", "Searching memory", "Building feature"],
  },
];

// Active task counter statuses
const TASK_COUNTS = [
  "12 tasks in flight",
  "3 delegated this minute",
  "47 completed today",
  "8 agents active",
  "2 awaiting review",
];

export function AgentOrchestra() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTask, setActiveTask] = useState(0);

  // Cycle task counter
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTask((prev) => (prev + 1) % TASK_COUNTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    let centerX = 0, centerY = 0;
    let time = 0;
    let animId: number;

    // Initialize agents
    const agents: AgentNode[] = AGENT_DEFS.map((def) => ({
      ...def,
      x: 0,
      y: 0,
      pulsePhase: Math.random() * Math.PI * 2,
      statusIdx: 0,
      statusTimer: Math.random() * 3,
      status: def.statuses[0],
    }));

    // Particles (data streams between agents)
    let particles: Particle[] = [];

    function spawnParticle() {
      const from = agents[Math.floor(Math.random() * agents.length)];
      let to = agents[Math.floor(Math.random() * agents.length)];
      if (from.id === to.id) to = agents[(agents.indexOf(from) + 1) % agents.length];

      particles.push({
        fromId: from.id,
        toId: to.id,
        progress: 0,
        speed: 0.3 + Math.random() * 0.4,
        color: from.color,
        size: 2 + Math.random() * 2,
      });
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = container!.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      canvas!.style.width = W + "px";
      canvas!.style.height = H + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      centerX = W / 2;
      centerY = H / 2;
    }

    function drawConnection(ax: number, ay: number, bx: number, by: number, alpha: number, color: number[]) {
      ctx!.beginPath();
      ctx!.moveTo(ax, ay);
      ctx!.lineTo(bx, by);
      ctx!.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${alpha})`;
      ctx!.lineWidth = 1;
      ctx!.stroke();
    }

    function draw() {
      time += 0.016;

      ctx!.clearRect(0, 0, W, H);

      // Spawn particles periodically
      if (Math.random() < 0.06) spawnParticle();

      // --- Update agent positions ---
      for (const agent of agents) {
        agent.angle += agent.orbitSpeed * 0.016;
        agent.x = centerX + Math.cos(agent.angle) * agent.orbitRadius;
        agent.y = centerY + Math.sin(agent.angle) * agent.orbitRadius * 0.6; // elliptical

        // Cycle status
        agent.statusTimer -= 0.016;
        if (agent.statusTimer <= 0) {
          agent.statusIdx = (agent.statusIdx + 1) % agent.statuses.length;
          agent.status = agent.statuses[agent.statusIdx];
          agent.statusTimer = 2.5 + Math.random() * 2;
        }
      }

      // --- Draw orbit ring (subtle) ---
      ctx!.beginPath();
      ctx!.ellipse(centerX, centerY, 180, 180 * 0.6, 0, 0, Math.PI * 2);
      ctx!.strokeStyle = "rgba(255,255,255,0.03)";
      ctx!.lineWidth = 1;
      ctx!.stroke();

      // --- Draw connections from center to agents ---
      for (const agent of agents) {
        const pulse = 0.04 + 0.02 * Math.sin(time * 2 + agent.pulsePhase);
        drawConnection(centerX, centerY, agent.x, agent.y, pulse, agent.color);
      }

      // --- Draw inter-agent connections (faint) ---
      for (let i = 0; i < agents.length; i++) {
        const next = agents[(i + 1) % agents.length];
        drawConnection(agents[i].x, agents[i].y, next.x, next.y, 0.015, [255, 255, 255]);
      }

      // --- Center node (brain) ---
      const centerPulse = 1 + 0.1 * Math.sin(time * 1.5);
      const centerRadius = 36 * centerPulse;

      // Outer glow
      const cg = ctx!.createRadialGradient(centerX, centerY, 0, centerX, centerY, centerRadius * 3);
      cg.addColorStop(0, "rgba(0,255,136,0.12)");
      cg.addColorStop(0.5, "rgba(0,255,136,0.03)");
      cg.addColorStop(1, "rgba(0,255,136,0)");
      ctx!.beginPath();
      ctx!.arc(centerX, centerY, centerRadius * 3, 0, Math.PI * 2);
      ctx!.fillStyle = cg;
      ctx!.fill();

      // Inner circle
      const ci = ctx!.createRadialGradient(centerX, centerY, 0, centerX, centerY, centerRadius);
      ci.addColorStop(0, "rgba(0,255,136,0.25)");
      ci.addColorStop(0.7, "rgba(0,255,136,0.08)");
      ci.addColorStop(1, "rgba(0,255,136,0.02)");
      ctx!.beginPath();
      ctx!.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
      ctx!.fillStyle = ci;
      ctx!.fill();

      // Ring
      ctx!.beginPath();
      ctx!.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
      ctx!.strokeStyle = "rgba(0,255,136,0.3)";
      ctx!.lineWidth = 1.5;
      ctx!.stroke();

      // Center label
      ctx!.fillStyle = "rgba(0,255,136,0.9)";
      ctx!.font = "bold 11px system-ui, sans-serif";
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      ctx!.fillText("BoringOS", centerX, centerY - 4);
      ctx!.font = "9px system-ui, sans-serif";
      ctx!.fillStyle = "rgba(0,255,136,0.5)";
      ctx!.fillText("orchestrating", centerX, centerY + 9);

      // --- Draw particles ---
      particles = particles.filter((p) => p.progress < 1);
      for (const p of particles) {
        p.progress += p.speed * 0.016;
        const from = agents.find((a) => a.id === p.fromId)!;
        const to = agents.find((a) => a.id === p.toId)!;

        // Bezier through center for visual interest
        const t = p.progress;
        const cx1 = centerX + (from.x - centerX) * 0.3;
        const cy1 = centerY + (from.y - centerY) * 0.3;
        const x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * cx1 + t * t * to.x;
        const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * cy1 + t * t * to.y;

        const alpha = Math.sin(t * Math.PI); // fade in and out

        // Glow
        const pg = ctx!.createRadialGradient(x, y, 0, x, y, p.size * 4);
        pg.addColorStop(0, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${alpha * 0.3})`);
        pg.addColorStop(1, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0)`);
        ctx!.beginPath();
        ctx!.arc(x, y, p.size * 4, 0, Math.PI * 2);
        ctx!.fillStyle = pg;
        ctx!.fill();

        // Core
        ctx!.beginPath();
        ctx!.arc(x, y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${alpha * 0.9})`;
        ctx!.fill();
      }

      // --- Draw agent nodes ---
      for (const agent of agents) {
        const pulse = 1 + 0.06 * Math.sin(time * 3 + agent.pulsePhase);
        const r = agent.radius * pulse;

        // Glow
        const ag = ctx!.createRadialGradient(agent.x, agent.y, 0, agent.x, agent.y, r * 2.5);
        ag.addColorStop(0, `rgba(${agent.color[0]},${agent.color[1]},${agent.color[2]},0.15)`);
        ag.addColorStop(1, `rgba(${agent.color[0]},${agent.color[1]},${agent.color[2]},0)`);
        ctx!.beginPath();
        ctx!.arc(agent.x, agent.y, r * 2.5, 0, Math.PI * 2);
        ctx!.fillStyle = ag;
        ctx!.fill();

        // Node body
        const bg = ctx!.createRadialGradient(agent.x, agent.y, 0, agent.x, agent.y, r);
        bg.addColorStop(0, `rgba(${agent.color[0]},${agent.color[1]},${agent.color[2]},0.15)`);
        bg.addColorStop(1, `rgba(${agent.color[0]},${agent.color[1]},${agent.color[2]},0.04)`);
        ctx!.beginPath();
        ctx!.arc(agent.x, agent.y, r, 0, Math.PI * 2);
        ctx!.fillStyle = bg;
        ctx!.fill();

        // Ring
        ctx!.beginPath();
        ctx!.arc(agent.x, agent.y, r, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(${agent.color[0]},${agent.color[1]},${agent.color[2]},0.4)`;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();

        // Label
        ctx!.fillStyle = `rgba(${agent.color[0]},${agent.color[1]},${agent.color[2]},0.9)`;
        ctx!.font = "bold 10px system-ui, sans-serif";
        ctx!.textAlign = "center";
        ctx!.textBaseline = "middle";
        ctx!.fillText(agent.label, agent.x, agent.y - 2);
        ctx!.font = "8px system-ui, sans-serif";
        ctx!.fillStyle = `rgba(${agent.color[0]},${agent.color[1]},${agent.color[2]},0.45)`;
        ctx!.fillText(agent.role, agent.x, agent.y + 9);

        // Status below node
        ctx!.font = "9px system-ui, sans-serif";
        ctx!.fillStyle = `rgba(255,255,255,0.3)`;
        ctx!.fillText(agent.status, agent.x, agent.y + r + 14);
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: 480 }}>
      <canvas ref={canvasRef} className="absolute inset-0" />
      {/* Floating counter overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <div
          className="px-4 py-2 rounded-full border text-xs font-mono transition-all duration-500"
          style={{
            borderColor: "var(--border)",
            background: "rgba(17,17,24,0.8)",
            backdropFilter: "blur(8px)",
            color: "var(--accent)",
          }}
        >
          {TASK_COUNTS[activeTask]}
        </div>
      </div>
    </div>
  );
}
