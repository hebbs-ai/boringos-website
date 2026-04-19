"use client";

/**
 * Compact, presentation-only DAG visual for the homepage.
 *
 * Renders a representative 6-block workflow (the kind every CRM/SaaS
 * actually builds) using @xyflow/react + dagre auto-layout. Static —
 * no editing, no live updates. Pulses one block at a time so the visual
 * feels alive.
 *
 * Color palette intentionally aligns with the website's CSS variables
 * (--accent / --accent-2 / --accent-3) so it sits naturally in the page.
 */
import { useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import "@xyflow/react/dist/style.css";

type BlockKind = "trigger" | "agent" | "connector" | "flow" | "human" | "db";

interface BlockData extends Record<string, unknown> {
  label: string;
  type: string;
  kind: BlockKind;
  active: boolean;
}

const KIND_COLORS: Record<BlockKind, { bg: string; border: string; text: string; tag: string }> = {
  trigger:   { bg: "rgba(124, 58, 237, 0.12)",  border: "rgba(167, 139, 250, 0.5)",  text: "#c4b5fd", tag: "TRIGGER" },
  connector: { bg: "rgba(16, 185, 129, 0.12)",  border: "rgba(52, 211, 153, 0.5)",   text: "#6ee7b7", tag: "CONNECTOR" },
  agent:     { bg: "rgba(99, 102, 241, 0.12)",  border: "rgba(129, 140, 248, 0.5)",  text: "#a5b4fc", tag: "AGENT" },
  flow:      { bg: "rgba(245, 158, 11, 0.12)",  border: "rgba(251, 191, 36, 0.5)",   text: "#fcd34d", tag: "FLOW" },
  human:     { bg: "rgba(239, 68, 68, 0.12)",   border: "rgba(248, 113, 113, 0.5)",  text: "#fca5a5", tag: "HUMAN" },
  db:        { bg: "rgba(59, 130, 246, 0.12)",  border: "rgba(96, 165, 250, 0.5)",   text: "#93c5fd", tag: "DB" },
};

function BlockNode({ data }: NodeProps) {
  const d = data as BlockData;
  const c = KIND_COLORS[d.kind];
  const ringWidth = d.active ? 2 : 1;
  return (
    <div
      style={{
        background: c.bg,
        border: `${ringWidth}px solid ${d.active ? c.text : c.border}`,
        borderRadius: 12,
        padding: "10px 14px",
        minWidth: 170,
        transition: "all 200ms ease",
        boxShadow: d.active ? `0 0 24px ${c.text}40` : "none",
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: c.border, border: "none", width: 6, height: 6 }} />
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, color: c.text, opacity: 0.85 }}>
        {c.tag}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#e5e7eb", marginTop: 2 }}>
        {d.label}
      </div>
      <div style={{ fontSize: 10, color: "#9ca3af", fontFamily: "monospace", marginTop: 1 }}>
        {d.type}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: c.border, border: "none", width: 6, height: 6 }} />
    </div>
  );
}

const NODE_TYPES = { block: BlockNode };

// Representative workflow: a real CRM/SaaS triage flow.
// Trigger → fetch emails → for each → score with agent → branch on score
//                                                      ├─ wait for human (high)
//                                                      └─ create task (low)
const BLOCKS: Array<{ id: string; label: string; type: string; kind: BlockKind }> = [
  { id: "trigger",  label: "New email arrives",   type: "trigger",          kind: "trigger" },
  { id: "fetch",    label: "Fetch from Gmail",     type: "connector-action", kind: "connector" },
  { id: "loop",     label: "For each message",     type: "for-each",         kind: "flow" },
  { id: "score",    label: "Score with agent",     type: "wake-agent",       kind: "agent" },
  { id: "branch",   label: "If score > 0.8",       type: "condition",        kind: "flow" },
  { id: "approve",  label: "Wait for human",       type: "wait-for-human",   kind: "human" },
  { id: "task",     label: "Create task",          type: "create-task",      kind: "db" },
];

const EDGES: Array<{ source: string; target: string; sourceHandle?: string }> = [
  { source: "trigger", target: "fetch" },
  { source: "fetch",   target: "loop" },
  { source: "loop",    target: "score" },
  { source: "score",   target: "branch" },
  { source: "branch",  target: "approve", sourceHandle: "true" },
  { source: "branch",  target: "task",    sourceHandle: "false" },
];

function layout(): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "LR", nodesep: 30, ranksep: 60, marginx: 16, marginy: 16 });
  g.setDefaultEdgeLabel(() => ({}));

  const W = 200, H = 70;
  for (const b of BLOCKS) g.setNode(b.id, { width: W, height: H });
  for (const e of EDGES) g.setEdge(e.source, e.target);
  dagre.layout(g);

  const nodes: Node[] = BLOCKS.map((b) => {
    const pos = g.node(b.id);
    return {
      id: b.id,
      type: "block",
      position: { x: pos.x - W / 2, y: pos.y - H / 2 },
      data: { label: b.label, type: b.type, kind: b.kind, active: false } as BlockData,
      draggable: false,
      selectable: false,
    };
  });

  const edges: Edge[] = EDGES.map((e, i) => ({
    id: `e-${i}`,
    source: e.source,
    target: e.target,
    type: "smoothstep",
    animated: true,
    style: { stroke: "rgba(156, 163, 175, 0.4)", strokeWidth: 1.5 },
  }));

  return { nodes, edges };
}

export function WorkflowDAG() {
  const { nodes: initialNodes, edges } = useMemo(() => layout(), []);
  const [activeIdx, setActiveIdx] = useState(0);

  // Cycle through blocks every 1.4s — gives the visual a heartbeat without
  // distracting from the rest of the page.
  useEffect(() => {
    const id = setInterval(() => setActiveIdx((i) => (i + 1) % BLOCKS.length), 1400);
    return () => clearInterval(id);
  }, []);

  const nodes = useMemo<Node[]>(
    () =>
      initialNodes.map((n, i) => ({
        ...n,
        data: { ...(n.data as BlockData), active: i === activeIdx },
      })),
    [initialNodes, activeIdx],
  );

  return (
    <div
      style={{
        height: 360,
        borderRadius: 16,
        background: "linear-gradient(180deg, rgba(10, 10, 15, 0.6) 0%, rgba(6, 6, 14, 0.4) 100%)",
        border: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        panOnDrag={false}
        panOnScroll={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} size={1} color="rgba(255,255,255,0.04)" />
      </ReactFlow>
    </div>
  );
}
