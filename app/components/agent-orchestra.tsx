"use client";

import { useEffect, useRef } from "react";

/**
 * Agent Orchestra — hierarchical org-chart visualization of AI agents.
 *
 * CEO at top delegates to CTO, CTO delegates to Engineers + QA.
 * Animated particles flow down (delegation) and up (completion).
 * Status messages cycle on each node. Progress events appear as
 * floating toast-like messages that rise and fade.
 *
 * Pure canvas — no dependencies.
 */

// ── Agent hierarchy definition ──

interface AgentDef {
  id: string;
  label: string;
  role: string;
  color: number[];
  parentId: string | null;
  statuses: string[];
}

const AGENTS: AgentDef[] = [
  {
    id: "ceo",
    label: "CEO",
    role: "Strategy",
    color: [0, 255, 136],
    parentId: null,
    statuses: ["Setting Q3 goals", "Reviewing pipeline", "Delegating to CTO", "Approving budget", "Analyzing metrics"],
  },
  {
    id: "cto",
    label: "CTO",
    role: "Technical Lead",
    color: [0, 204, 255],
    parentId: "ceo",
    statuses: ["Breaking down MVP", "Assigning sprints", "Reviewing architecture", "Prioritizing backlog", "Unblocking engineers"],
  },
  {
    id: "eng-fe",
    label: "Frontend",
    role: "Engineer",
    color: [140, 90, 255],
    parentId: "cto",
    statuses: ["Building dashboard", "Writing React code", "Fixing layout bug", "Adding animations", "Deploying to staging"],
  },
  {
    id: "eng-be",
    label: "Backend",
    role: "Engineer",
    color: [255, 140, 0],
    parentId: "cto",
    statuses: ["Writing API routes", "Optimizing queries", "Adding auth layer", "Database migration", "Load testing"],
  },
  {
    id: "qa",
    label: "QA",
    role: "Quality",
    color: [255, 60, 100],
    parentId: "cto",
    statuses: ["Running test suite", "Filing bug report", "E2E testing", "Validating deploy", "Writing test plan"],
  },
  {
    id: "copilot",
    label: "Copilot",
    role: "AI Assistant",
    color: [0, 255, 200],
    parentId: "ceo",
    statuses: ["Answering query", "Editing codebase", "Generating report", "Searching memory", "Building connector"],
  },
];

// ── Event messages that float up ──

const EVENT_MESSAGES = [
  { text: "Task delegated: Build auth module", color: [0, 255, 136], icon: "→" },
  { text: "PR merged: Dashboard v2", color: [140, 90, 255], icon: "✓" },
  { text: "3 subtasks created by CTO", color: [0, 204, 255], icon: "→" },
  { text: "Test suite passed: 47/47", color: [255, 60, 100], icon: "✓" },
  { text: "Deploy to staging complete", color: [0, 255, 136], icon: "✓" },
  { text: "Bug escalated to CTO", color: [255, 140, 0], icon: "↑" },
  { text: "Memory: deal pattern detected", color: [0, 255, 200], icon: "◆" },
  { text: "Budget check: $0.12 used", color: [0, 204, 255], icon: "●" },
  { text: "Copilot: code review complete", color: [0, 255, 200], icon: "✓" },
  { text: "QA approved release candidate", color: [255, 60, 100], icon: "✓" },
  { text: "CEO reviewed weekly metrics", color: [0, 255, 136], icon: "●" },
  { text: "Engineer requested code review", color: [140, 90, 255], icon: "↑" },
];

export function AgentOrchestra() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    let time = 0;
    let animId: number;

    // ── Runtime state ──

    interface NodeState {
      def: AgentDef;
      x: number;
      y: number;
      radius: number;
      statusIdx: number;
      statusTimer: number;
      pulsePhase: number;
    }

    interface Particle {
      fromId: string;
      toId: string;
      progress: number;
      speed: number;
      color: number[];
      size: number;
      direction: "down" | "up"; // down = delegation, up = completion
    }

    interface FloatingEvent {
      text: string;
      color: number[];
      icon: string;
      x: number;
      y: number;
      startY: number;
      alpha: number;
      age: number;
      maxAge: number;
    }

    // Counter at the bottom
    interface Counter {
      completed: number;
      delegated: number;
      active: number;
    }

    let nodes: NodeState[] = [];
    let nodeMap = new Map<string, NodeState>();
    let particles: Particle[] = [];
    let events: FloatingEvent[] = [];
    let counter: Counter = { completed: 0, delegated: 0, active: AGENTS.length };

    function layoutNodes() {
      // Tree layout:
      // Row 0: CEO (center)
      // Row 1: CTO, Copilot
      // Row 2: Frontend, Backend, QA

      const rowGap = Math.min(130, H * 0.28);
      const topPad = 60;

      const rows: string[][] = [
        ["ceo"],
        ["cto", "copilot"],
        ["eng-fe", "eng-be", "qa"],
      ];

      nodes = [];
      nodeMap.clear();

      for (let r = 0; r < rows.length; r++) {
        const ids = rows[r];
        const count = ids.length;
        const rowWidth = (count - 1) * Math.min(180, W * 0.25);
        const startX = (W - rowWidth) / 2;

        for (let i = 0; i < count; i++) {
          const def = AGENTS.find((a) => a.id === ids[i])!;
          const x = count === 1 ? W / 2 : startX + i * (rowWidth / (count - 1));
          const y = topPad + r * rowGap;

          const size = r === 0 ? 32 : r === 1 ? 26 : 22;

          const node: NodeState = {
            def,
            x,
            y,
            radius: size,
            statusIdx: 0,
            statusTimer: 1 + Math.random() * 2,
            pulsePhase: Math.random() * Math.PI * 2,
          };
          nodes.push(node);
          nodeMap.set(def.id, node);
        }
      }
    }

    function spawnParticle() {
      // Pick a parent-child pair
      const childAgents = AGENTS.filter((a) => a.parentId);
      const child = childAgents[Math.floor(Math.random() * childAgents.length)];
      const goingDown = Math.random() < 0.6; // 60% delegation, 40% completion/escalation

      particles.push({
        fromId: goingDown ? child.parentId! : child.id,
        toId: goingDown ? child.id : child.parentId!,
        progress: 0,
        speed: 0.4 + Math.random() * 0.3,
        color: goingDown
          ? (nodeMap.get(child.parentId!)?.def.color ?? [255, 255, 255])
          : child.color,
        size: 2.5 + Math.random() * 1.5,
        direction: goingDown ? "down" : "up",
      });

      // Update counters
      if (goingDown) counter.delegated++;
      else counter.completed++;
    }

    function spawnEvent() {
      const msg = EVENT_MESSAGES[Math.floor(Math.random() * EVENT_MESSAGES.length)];
      // Spawn near a random node
      const node = nodes[Math.floor(Math.random() * nodes.length)];
      events.push({
        text: msg.text,
        color: msg.color,
        icon: msg.icon,
        x: node.x + (Math.random() - 0.5) * 40,
        y: node.y + node.radius + 20,
        startY: node.y + node.radius + 20,
        alpha: 1,
        age: 0,
        maxAge: 3.5,
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
      layoutNodes();
    }

    function drawEdge(from: NodeState, to: NodeState) {
      // Draw a slightly curved line from parent to child
      const midY = (from.y + to.y) / 2;

      ctx!.beginPath();
      ctx!.moveTo(from.x, from.y + from.radius);
      ctx!.bezierCurveTo(
        from.x, midY,
        to.x, midY,
        to.x, to.y - to.radius
      );
      ctx!.strokeStyle = "rgba(255,255,255,0.06)";
      ctx!.lineWidth = 1.5;
      ctx!.stroke();
    }

    function drawNode(node: NodeState) {
      const pulse = 1 + 0.04 * Math.sin(time * 2.5 + node.pulsePhase);
      const r = node.radius * pulse;
      const c = node.def.color;

      // Outer glow
      const og = ctx!.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 2.8);
      og.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},0.1)`);
      og.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
      ctx!.beginPath();
      ctx!.arc(node.x, node.y, r * 2.8, 0, Math.PI * 2);
      ctx!.fillStyle = og;
      ctx!.fill();

      // Body fill
      const bg = ctx!.createRadialGradient(node.x, node.y, 0, node.x, node.y, r);
      bg.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},0.18)`);
      bg.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0.04)`);
      ctx!.beginPath();
      ctx!.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx!.fillStyle = bg;
      ctx!.fill();

      // Ring
      ctx!.beginPath();
      ctx!.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx!.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},0.5)`;
      ctx!.lineWidth = 1.5;
      ctx!.stroke();

      // Label
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      ctx!.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.95)`;
      ctx!.font = `bold ${node.radius > 28 ? 12 : 10}px system-ui, sans-serif`;
      ctx!.fillText(node.def.label, node.x, node.y - 3);
      ctx!.font = `${node.radius > 28 ? 9 : 8}px system-ui, sans-serif`;
      ctx!.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.45)`;
      ctx!.fillText(node.def.role, node.x, node.y + 9);

      // Status below node
      const status = node.def.statuses[node.statusIdx];
      ctx!.font = "9px system-ui, sans-serif";
      ctx!.fillStyle = "rgba(255,255,255,0.28)";
      ctx!.fillText(status, node.x, node.y + r + 16);
    }

    function getPointOnEdge(from: NodeState, to: NodeState, t: number): { x: number; y: number } {
      const fy = from.y + from.radius;
      const ty = to.y - to.radius;
      const midY = (fy + ty) / 2;

      // Cubic bezier
      const u = 1 - t;
      const x = u * u * u * from.x + 3 * u * u * t * from.x + 3 * u * t * t * to.x + t * t * t * to.x;
      const y = u * u * u * fy + 3 * u * u * t * midY + 3 * u * t * t * midY + t * t * t * ty;
      return { x, y };
    }

    function draw() {
      time += 0.016;
      ctx!.clearRect(0, 0, W, H);

      // Spawn particles
      if (Math.random() < 0.04) spawnParticle();

      // Spawn floating events
      if (Math.random() < 0.012) spawnEvent();

      // Update node statuses
      for (const node of nodes) {
        node.statusTimer -= 0.016;
        if (node.statusTimer <= 0) {
          node.statusIdx = (node.statusIdx + 1) % node.def.statuses.length;
          node.statusTimer = 2.5 + Math.random() * 2;
        }
      }

      // ── Draw edges ──
      for (const node of nodes) {
        if (!node.def.parentId) continue;
        const parent = nodeMap.get(node.def.parentId);
        if (parent) drawEdge(parent, node);
      }

      // ── Draw particles on edges ──
      particles = particles.filter((p) => p.progress < 1);
      for (const p of particles) {
        p.progress += p.speed * 0.016;

        let from: NodeState, to: NodeState;
        if (p.direction === "down") {
          from = nodeMap.get(p.fromId)!;
          to = nodeMap.get(p.toId)!;
        } else {
          from = nodeMap.get(p.fromId)!;
          to = nodeMap.get(p.toId)!;
          // For "up" particles, reverse the visual path
        }

        if (!from || !to) continue;

        const t = p.direction === "down" ? p.progress : p.progress;
        const actualFrom = p.direction === "down" ? nodeMap.get(p.fromId)! : nodeMap.get(p.fromId)!;
        const actualTo = p.direction === "down" ? nodeMap.get(p.toId)! : nodeMap.get(p.toId)!;
        const pt = getPointOnEdge(
          p.direction === "down" ? actualFrom : actualTo,
          p.direction === "down" ? actualTo : actualFrom,
          p.direction === "down" ? t : 1 - t
        );

        const alpha = Math.sin(p.progress * Math.PI);

        // Glow
        const pg = ctx!.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, p.size * 5);
        pg.addColorStop(0, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${alpha * 0.3})`);
        pg.addColorStop(1, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0)`);
        ctx!.beginPath();
        ctx!.arc(pt.x, pt.y, p.size * 5, 0, Math.PI * 2);
        ctx!.fillStyle = pg;
        ctx!.fill();

        // Core dot
        ctx!.beginPath();
        ctx!.arc(pt.x, pt.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${alpha})`;
        ctx!.fill();

        // Direction indicator — small arrow-like trail
        if (p.direction === "down") {
          const t2 = Math.max(0, p.progress - 0.05);
          const pt2 = getPointOnEdge(actualFrom, actualTo, t2);
          ctx!.beginPath();
          ctx!.arc(pt2.x, pt2.y, p.size * 0.6, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${alpha * 0.4})`;
          ctx!.fill();
        }
      }

      // ── Draw nodes (on top of edges + particles) ──
      for (const node of nodes) {
        drawNode(node);
      }

      // ── Draw floating events (right side) ──
      events = events.filter((e) => e.age < e.maxAge);
      for (const ev of events) {
        ev.age += 0.016;
        const lifeRatio = ev.age / ev.maxAge;

        // Rise from spawn point
        ev.y = ev.startY + 10 - lifeRatio * 50;

        // Fade: fully visible for first 60%, then fade out
        ev.alpha = lifeRatio < 0.6 ? 1 : 1 - (lifeRatio - 0.6) / 0.4;

        // Background pill
        const textWidth = ctx!.measureText(ev.text).width;
        const pillW = textWidth + 36;
        const pillH = 24;
        const pillX = ev.x - pillW / 2;

        ctx!.globalAlpha = ev.alpha * 0.7;
        ctx!.fillStyle = `rgba(17,17,24,0.85)`;
        ctx!.beginPath();
        ctx!.roundRect(pillX, ev.y - pillH / 2, pillW, pillH, 12);
        ctx!.fill();

        // Border
        ctx!.strokeStyle = `rgba(${ev.color[0]},${ev.color[1]},${ev.color[2]},0.25)`;
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.roundRect(pillX, ev.y - pillH / 2, pillW, pillH, 12);
        ctx!.stroke();

        // Icon
        ctx!.fillStyle = `rgba(${ev.color[0]},${ev.color[1]},${ev.color[2]},0.8)`;
        ctx!.font = "10px system-ui, sans-serif";
        ctx!.textAlign = "left";
        ctx!.textBaseline = "middle";
        ctx!.fillText(ev.icon, pillX + 10, ev.y);

        // Text
        ctx!.fillStyle = `rgba(255,255,255,0.6)`;
        ctx!.font = "9px system-ui, sans-serif";
        ctx!.fillText(ev.text, pillX + 24, ev.y);

        ctx!.globalAlpha = 1;
      }

      // ── Bottom counter bar ──
      const barY = H - 32;
      ctx!.fillStyle = "rgba(255,255,255,0.2)";
      ctx!.font = "10px system-ui, sans-serif";
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      const counterText = `${counter.active} agents active  ·  ${counter.delegated} delegated  ·  ${counter.completed} completed`;
      ctx!.fillText(counterText, W / 2, barY);

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
    </div>
  );
}
