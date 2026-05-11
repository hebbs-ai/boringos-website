import Link from "next/link";
import { HeroCanvas } from "./components/hero-canvas";
import { AgentOrchestra } from "./components/agent-orchestra";
import { WorkflowDAG } from "./components/workflow-dag";

const codeExample = `// One primitive: the Module.
// Skills + Tools, bundled. Registered in one call.

import { BoringOS } from "@boringos/core";
import { z } from "@boringos/module-sdk";
import type { Module } from "@boringos/module-sdk";

const crm: Module = {
  id: "crm",
  name: "Tiny CRM",
  version: "0.1.0",
  description: "Deals + contacts the agent can reason about",

  skills: [{
    id: "crm-intro",
    source: "module",
    body: "Use crm.list_deals before crm.move_stage. " +
          "Always confirm the stage with the user.",
  }],

  tools: [{
    name: "list_deals",
    description: "List all deals for the tenant",
    inputs: z.object({ status: z.string().optional() }),
    async handler({ status }, ctx) {
      const rows = await ctx.db.query.deals.findMany({
        where: { tenantId: ctx.tenantId, status },
      });
      return { ok: true, result: { deals: rows } };
    },
  }],
};

const app = new BoringOS({});
app.module(crm);
await app.listen(3000);

// The agent's prompt now includes crm's Skills.
// POST /api/tools/crm.list_deals is live. That's it.`;

const primitives = [
  {
    title: "Skills",
    tagline: "Behavior, in markdown.",
    description: "Plain .md files that get concatenated into the agent's system prompt on every wake. Teach the agent when to use a tool, edge cases, your house style. No templating — just words.",
    accent: "var(--accent)",
    detail: "Module / persona / agent-instructions / tenant-override sources, prioritised + deduped.",
  },
  {
    title: "Tools",
    tagline: "Capability, with types.",
    description: "Zod-typed callables, dispatched at POST /api/tools/<module>.<name>. Same handler runs from agents, workflows, routines, or your own routes. Every call is audited to tool_calls.",
    accent: "var(--accent-2)",
    detail: "Idempotency + cost hints + permission scopes built in.",
  },
  {
    title: "Modules",
    tagline: "Everything, bundled.",
    description: "One manifest binds skills + tools + schema + workflows + agents + routines + webhooks + OAuth + UI. Built-ins, third-parties, your own — all the same shape. app.module(x) wires the rest.",
    accent: "var(--accent-3)",
    detail: "Three kinds: connector, module, hybrid — UI grouping hint, identical dispatch.",
  },
];

const builtInModules = [
  { id: "framework", desc: "Tasks, comments, agents, runs", kind: "core" },
  { id: "memory", desc: "Pluggable cognitive memory", kind: "core" },
  { id: "drive", desc: "File storage + ACL", kind: "core" },
  { id: "workflow", desc: "DAG runner over the tool registry", kind: "core" },
  { id: "inbox", desc: "Email/Slack/event triage queue", kind: "core" },
  { id: "triage", desc: "Capability — routes new items to agents", kind: "capability" },
  { id: "copilot", desc: "Built-in chat surface for every app", kind: "module" },
  { id: "google", desc: "Gmail + Calendar via OAuth", kind: "connector" },
  { id: "slack", desc: "Channels, DMs, slash commands", kind: "connector" },
];

const features = [
  {
    title: "Agent Execution",
    description: "6 CLI runtimes (Claude, Codex, Gemini, Ollama, raw command, webhook). 15 personas. Org hierarchy with delegation, escalation, next-actor handoff state machine.",
    accent: "var(--accent)",
  },
  {
    title: "Workflows",
    description: "DAG engine that dispatches every node through the tool registry. Persisted runs, live SSE, replay, fork-from-here, pause-on-human-approval, smart routines that only wake agents when there's real work.",
    accent: "var(--accent-2)",
  },
  {
    title: "Module Ecosystem",
    description: ".hebbsmod packages — one zip, signed, content-addressed. Upload from the shell, install per-tenant, hot-register without restart. The same shape Slack + Google + CRM use.",
    accent: "var(--accent-3)",
  },
  {
    title: "Memory",
    description: "Agents remember. Agents recall. Agents learn across runs. Pluggable provider — hebbs.ai out of the box, or bring your own cognitive engine.",
    accent: "var(--accent)",
  },
  {
    title: "Admin API",
    description: "REST for everything — agents, tasks, runs, approvals, budgets, routines, plugins, modules. JWT + session auth. SSE realtime bus. Anthropic cache tokens tracked end-to-end.",
    accent: "var(--accent-2)",
  },
  {
    title: "Headless UI",
    description: "Typed API client + React hooks for everything. useAgents, useTasks, useRuns. No opinions on your markup. Build any dashboard, or use the shipped shell.",
    accent: "var(--accent-3)",
  },
  {
    title: "Built-in Copilot",
    description: "Shipped as the copilot Module. Chat with the system, query data, edit your code from the chat surface. Zero config — included with every BoringOS host.",
    accent: "var(--accent)",
  },
  {
    title: "Data Sync",
    description: "Forward-sync ticker pulls Gmail into the inbox every 30s. for-each + create-inbox-item pattern. Dedup built in. Agents process from the queue.",
    accent: "var(--accent-2)",
  },
];

const stats = [
  { value: "14", label: "npm packages" },
  { value: "9", label: "built-in modules" },
  { value: "15", label: "agent personas" },
  { value: "3", label: "module kinds" },
  { value: "0", label: "config required" },
  { value: "< 1min", label: "to first agent" },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">

      {/* Hero section with living canvas background */}
      <section className="relative overflow-hidden" style={{ minHeight: "100vh", background: "#06060e" }}>
        <HeroCanvas />

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(6,6,14,0) 0%, rgba(6,6,14,0.6) 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none" style={{ background: "linear-gradient(to top, #0a0a0f, transparent)" }} />

      {/* Nav — inside hero section, floats on canvas */}
      <nav className="relative z-10 border-b border-[var(--border)] px-6 py-4 glass">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="BoringOS" width={28} height={28} className="rounded-md" />
            <span className="text-xl font-bold tracking-tight">BoringOS</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[var(--muted)]">
            <Link href="/docs" className="hover:text-[var(--accent)] transition-colors">Docs</Link>
            <a href="https://github.com/BoringOS-dev/boringos" className="hover:text-[var(--accent)] transition-colors">GitHub</a>
            <a href="https://www.npmjs.com/org/boringos" className="hover:text-[var(--accent)] transition-colors">npm</a>
            <a href="/docs" className="px-4 py-1.5 border border-[var(--accent)] text-[var(--accent)] rounded-full text-xs font-medium hover:bg-[var(--accent)] hover:text-[var(--background)] transition-all">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 px-6 pt-24 pb-20">
        <div className="max-w-5xl mx-auto text-center">

          {/* Pac-Man dots animation */}
          <div className="flex items-center justify-center gap-2 mb-8 overflow-hidden h-4">
            <div className="flex gap-3 pac-dots">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-[var(--accent)] opacity-30" />
              ))}
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={`d${i}`} className="w-2 h-2 rounded-full bg-[var(--accent)] opacity-30" />
              ))}
            </div>
          </div>

          <div className="inline-block px-4 py-1.5 border border-[var(--border)] rounded-full text-xs text-[var(--muted)] mb-8">
            Skills · Tools · Modules — one shape for everything an agent can see and do
          </div>

          <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            We handle the
            <br />
            <span className="glow-text" style={{ color: "var(--accent)" }}>boring stuff.</span>
            <br />
            You change the world.
          </h1>

          <p className="text-lg text-[var(--muted)] mb-12 max-w-2xl mx-auto leading-relaxed">
            The open-source framework for agentic platforms. Skills teach. Tools do. Modules bundle.
            <br />
            <span style={{ color: "var(--accent)" }}>Anyone can ship one. Install with a click.</span>
          </p>

          <div className="flex items-center justify-center gap-4 mb-20">
            <Link
              href="/docs"
              className="px-8 py-3.5 bg-[var(--accent)] text-[var(--background)] rounded-lg font-semibold text-sm hover:shadow-[0_0_30px_var(--glow)] transition-all"
            >
              Get Started
            </Link>
            <div className="px-5 py-3.5 bg-[var(--code-bg)] border border-[var(--border)] rounded-lg font-mono text-sm neon-border">
              <span className="text-[var(--muted)]">$</span> npx create-boringos my-app
            </div>
          </div>

          {/* Code block with glow */}
          <div className="text-left max-w-3xl mx-auto relative">
            <div className="absolute -inset-4 bg-[var(--accent)] opacity-[0.03] rounded-2xl blur-xl" />
            <div className="relative bg-[var(--code-bg)] border border-[var(--border)] rounded-2xl overflow-hidden neon-border">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                <span className="ml-2 text-xs text-[var(--muted)]">crm-module.ts</span>
              </div>
              <pre className="p-6 overflow-x-auto text-sm leading-relaxed">
                <code className="text-[var(--code-text)]">{codeExample}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
      {/* End hero section */}
      </section>

      {/* Stats bar */}
      <section className="relative z-10 border-y border-[var(--border)] py-8">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-3 md:grid-cols-6 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold" style={{ color: "var(--accent)" }}>{s.value}</div>
              <div className="text-xs text-[var(--muted)] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* THE PRIMITIVES — Skills / Tools / Modules */}
      <section className="relative z-10 px-6 py-24 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 border border-[var(--border)] rounded-full text-[10px] uppercase tracking-widest text-[var(--muted)] mb-4">
              The three primitives
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              One shape. <span style={{ color: "var(--accent)" }}>For everything.</span>
            </h2>
            <p className="text-[var(--muted)] max-w-2xl mx-auto">
              Every connector, every business app, every internal capability — same manifest, same install pipeline, same HTTP surface. Read it once, write your own.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {primitives.map((p) => (
              <div
                key={p.title}
                className="border border-[var(--border)] rounded-2xl p-7 card-hover bg-[var(--code-bg)] flex flex-col"
              >
                <div className="w-3 h-3 rounded-full mb-5" style={{ backgroundColor: p.accent, boxShadow: `0 0 14px ${p.accent}` }} />
                <h3 className="text-2xl font-bold mb-1">{p.title}</h3>
                <p className="text-sm mb-4" style={{ color: p.accent }}>{p.tagline}</p>
                <p className="text-sm text-[var(--muted)] leading-relaxed mb-4 flex-1">{p.description}</p>
                <p className="text-xs text-[var(--muted)] border-t border-[var(--border)] pt-3 italic">
                  {p.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center text-sm text-[var(--muted)]">
            Spec: <Link href="/docs" className="text-[var(--accent)] hover:underline">SKILLS.md</Link>
            {" · "}
            <Link href="/docs" className="text-[var(--accent)] hover:underline">TOOLS.md</Link>
            {" · "}
            <Link href="/docs" className="text-[var(--accent)] hover:underline">MODULES.md</Link>
          </div>
        </div>
      </section>

      {/* ANYONE CAN BUILD A MODULE */}
      <section className="relative z-10 px-6 py-24 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 border border-[var(--accent-3)] rounded-full text-[10px] uppercase tracking-widest mb-4" style={{ color: "var(--accent-3)" }}>
              Open ecosystem
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Anyone can <span style={{ color: "var(--accent-3)" }}>ship a Module.</span>
            </h2>
            <p className="text-[var(--muted)] max-w-2xl mx-auto">
              A Module is a TypeScript file with a manifest. Bundle it into a <code className="text-xs bg-[var(--code-bg)] px-1.5 py-0.5 rounded">.hebbsmod</code> archive. Upload it. Hosts install it per-tenant. Same flow as a Chrome extension or WordPress plugin — just for agents.
            </p>
          </div>

          {/* .hebbsmod flow */}
          <div className="grid md:grid-cols-4 gap-4 mb-16">
            {[
              { step: "01", title: "Author", desc: "Plain TypeScript. Implement the Module interface. Skills as .md, tools as Zod-typed handlers." },
              { step: "02", title: "Bundle", desc: ".hebbsmod = signed zip with manifest + ESM entry + skills + migrations + UI. ~100KB–2MB." },
              { step: "03", title: "Upload", desc: "Drag it into the shell. Ed25519 signature verified. Bytes content-addressed. Listed for tenants to install." },
              { step: "04", title: "Install", desc: "Tenants opt in. Schema applied. Lifecycle hooks fire. Tools live at /api/tools/<id>.<name>. Agent reads new Skills next wake." },
            ].map((s) => (
              <div key={s.step} className="border border-[var(--border)] rounded-xl p-5 bg-[var(--code-bg)] card-hover">
                <div className="text-xs font-mono mb-2" style={{ color: "var(--accent-3)" }}>{s.step}</div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Hebbs CRM reference card */}
          <div className="relative">
            <div className="absolute -inset-2 rounded-2xl blur-xl opacity-[0.06]" style={{ background: "var(--accent-3)" }} />
            <a
              href="https://github.com/hebbs-ai/hebbs-crm"
              className="relative block border border-[var(--border)] rounded-2xl p-8 bg-[var(--code-bg)] hover:border-[var(--accent-3)] transition-all neon-border group"
            >
              <div className="flex items-start justify-between flex-wrap gap-6">
                <div className="flex-1 min-w-[280px]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest border" style={{ borderColor: "var(--accent-3)", color: "var(--accent-3)" }}>
                      Real example
                    </div>
                    <div className="text-xs text-[var(--muted)] font-mono">github.com/hebbs-ai/hebbs-crm</div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-[var(--accent-3)] transition-colors">
                    Hebbs CRM
                  </h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed mb-4">
                    A full CRM — deals, contacts, pipelines, custom entity schema, React UI, agent skills — shipped as a single Module. No standalone server. Installed into a running BoringOS host via the framework&apos;s install pipeline. The canonical reference for &quot;shell-hosted app, third-party repo.&quot;
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["hybrid kind", "owns schema", "ships React UI", "exposes tools", "third-party repo"].map((t) => (
                      <span key={t} className="text-[10px] px-2 py-1 rounded-full border border-[var(--border)] text-[var(--muted)]">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[var(--muted)] mb-1">Read the code</div>
                  <div className="text-2xl" style={{ color: "var(--accent-3)" }}>→</div>
                </div>
              </div>
            </a>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-10">
            <Link href="/docs" className="border border-[var(--border)] rounded-xl p-6 bg-[var(--code-bg)] card-hover block">
              <h4 className="font-semibold mb-1">BUILD-A-MODULE.md</h4>
              <p className="text-xs text-[var(--muted)]">Quickstart — minimal manifest, factory pattern, registering tools, loading skills from disk.</p>
            </Link>
            <Link href="/docs" className="border border-[var(--border)] rounded-xl p-6 bg-[var(--code-bg)] card-hover block">
              <h4 className="font-semibold mb-1">@boringos/module-sdk</h4>
              <p className="text-xs text-[var(--muted)]">The type surface. Module, Tool, Skill, ModuleFactory, ToolContext — plus a re-export of Zod so you don&apos;t add the dep.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Built-in Modules grid */}
      <section className="relative z-10 px-6 py-24 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span style={{ color: "var(--accent)" }}>9 Modules</span> shipped in the box.
            </h2>
            <p className="text-[var(--muted)] max-w-xl mx-auto">
              Everything you&apos;d otherwise wire up yourself — already a Module, already installed. Same shape as the one you&apos;ll write next.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {builtInModules.map((m) => (
              <div key={m.id} className="border border-[var(--border)] rounded-xl p-5 bg-[var(--code-bg)] card-hover">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm" style={{ color: "var(--accent)" }}>{m.id}</span>
                  <span className="text-[10px] uppercase tracking-widest text-[var(--muted)] border border-[var(--border)] px-2 py-0.5 rounded-full">
                    {m.kind}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)] leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Orchestra — the sexy visual */}
      <section className="relative z-10 px-6 py-24 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Your AI team, <span style={{ color: "var(--accent)" }}>orchestrated.</span>
          </h2>
          <p className="text-center text-[var(--muted)] mb-12 max-w-xl mx-auto">
            Agents delegate, escalate, hand off to humans. They reason in skills, act through tools, and remember across runs.
          </p>
          <div className="relative bg-[var(--code-bg)] border border-[var(--border)] rounded-2xl overflow-hidden neon-border">
            <AgentOrchestra />
          </div>
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--code-bg)] card-hover">
              <div className="w-2 h-2 rounded-full mb-3" style={{ backgroundColor: "var(--accent)", boxShadow: "0 0 10px var(--accent)" }} />
              <h3 className="font-semibold mb-1">Autonomous delegation</h3>
              <p className="text-sm text-[var(--muted)]">CEO sets the goal. CTO breaks it down. Engineers execute. QA validates. next_actor state machine routes work between agents and humans.</p>
            </div>
            <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--code-bg)] card-hover">
              <div className="w-2 h-2 rounded-full mb-3" style={{ backgroundColor: "var(--accent-2)", boxShadow: "0 0 10px var(--accent-2)" }} />
              <h3 className="font-semibold mb-1">Shared memory</h3>
              <p className="text-sm text-[var(--muted)]">Every agent remembers. Every run builds context. Pluggable provider — Hebbs out of the box, or your own.</p>
            </div>
            <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--code-bg)] card-hover">
              <div className="w-2 h-2 rounded-full mb-3" style={{ backgroundColor: "var(--accent-3)", boxShadow: "0 0 10px var(--accent-3)" }} />
              <h3 className="font-semibold mb-1">Budget-enforced</h3>
              <p className="text-sm text-[var(--muted)]">Cost tracked per run, including Anthropic cache tokens. Limits per agent, per task, per tenant. No runaway spend.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflows — visual DAG */}
      <section className="relative z-10 px-6 py-24 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Workflows you can <span style={{ color: "var(--accent-2)" }}>see</span>.
          </h2>
          <p className="text-center text-[var(--muted)] mb-12 max-w-2xl mx-auto">
            DAG that dispatches every node through the tool registry — same handlers your agents call. Persisted runs, live SSE, replay, fork-from-here, pause-on-approval. Smart routines target a workflow instead of an agent, so expensive agents only wake when there&apos;s real work.
          </p>
          <div className="relative bg-[var(--code-bg)] border border-[var(--border)] rounded-2xl overflow-hidden neon-border">
            <WorkflowDAG />
          </div>
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--code-bg)] card-hover">
              <div className="w-2 h-2 rounded-full mb-3" style={{ backgroundColor: "var(--accent-2)", boxShadow: "0 0 10px var(--accent-2)" }} />
              <h3 className="font-semibold mb-1">Tool registry as the backend</h3>
              <p className="text-sm text-[var(--muted)]">Each block resolves to a Tool. Same Zod validation, same audit log, same handler whether the call comes from an agent, a workflow, or a routine.</p>
            </div>
            <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--code-bg)] card-hover">
              <div className="w-2 h-2 rounded-full mb-3" style={{ backgroundColor: "var(--accent)", boxShadow: "0 0 10px var(--accent)" }} />
              <h3 className="font-semibold mb-1">Live runs</h3>
              <p className="text-sm text-[var(--muted)]">Every block transition streams via SSE. Watch the DAG light up — no polling, no reconstruction.</p>
            </div>
            <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--code-bg)] card-hover">
              <div className="w-2 h-2 rounded-full mb-3" style={{ backgroundColor: "var(--accent-3)", boxShadow: "0 0 10px var(--accent-3)" }} />
              <h3 className="font-semibold mb-1">Replay &amp; fork</h3>
              <p className="text-sm text-[var(--muted)]">Re-execute past runs. Fork from any block. Compare two runs side-by-side.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 py-24 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Everything you need.<br />
            <span className="text-[var(--muted)]">Nothing you don&apos;t.</span>
          </h2>
          <p className="text-center text-[var(--muted)] mb-16 max-w-lg mx-auto">
            The host (@boringos/core) ships an admin API, auth, SSE bus, budget enforcement, routine scheduler, install pipeline, copilot — all driven by Modules.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="border border-[var(--border)] rounded-2xl p-6 card-hover bg-[var(--code-bg)]"
              >
                <div className="w-2 h-2 rounded-full mb-4" style={{ backgroundColor: f.accent, boxShadow: `0 0 10px ${f.accent}` }} />
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — Pac-Man style pipeline */}
      <section className="relative z-10 px-6 py-24 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            From goal to <span style={{ color: "var(--accent)" }}>done</span>
          </h2>
          <p className="text-center text-[var(--muted)] mb-16 max-w-lg mx-auto">
            You set the goal. The AI team figures out the rest. Every action is a Tool call. Every Tool call is audited.
          </p>
          <div className="space-y-0">
            {[
              { step: "1", label: "Install the Modules you need", desc: "Built-ins are already there. Click-install third-party .hebbsmod packages. Each one adds skills the agent reads and tools the agent can call." },
              { step: "2", label: "Assign a goal", desc: "Create a task. Assign to the CEO, CTO, or any role. Defaults route through Chief of Staff." },
              { step: "3", label: "Delegation", desc: "The agent reads its skills, picks tools, breaks the goal into subtasks, assigns each to the right teammate. Workflow runs orchestrate where needed." },
              { step: "4", label: "Autonomous work", desc: "Each agent spawns a CLI (Claude / Codex / Gemini / Ollama). Skills shape behavior, tools execute capability. Budget enforced. Memory shared." },
              { step: "5", label: "Handoff & completion", desc: "next_actor flips between agent and human cleanly. Approvals route through the dashboard. Done tasks auto-post results as comments. Memory persists." },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-6 py-6">
                <div className="shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
                  {s.step}
                </div>
                <div className="flex-1 border-b border-[var(--border)] pb-6">
                  <h3 className="font-semibold text-lg mb-1">{s.label}</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Zero config */}
      <section className="relative z-10 px-6 py-24 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Zero config. <span style={{ color: "var(--accent)" }}>Seriously.</span>
          </h2>
          <p className="text-[var(--muted)] mb-12">One line boots the entire platform. Embedded Postgres included. Built-in Modules auto-register.</p>

          <div className="inline-block text-left">
            <div className="bg-[var(--code-bg)] border border-[var(--border)] rounded-2xl p-6 neon-border font-mono text-sm">
              <div className="text-[var(--muted)]">$ npx create-boringos my-startup</div>
              <div className="text-[var(--muted)]">$ npm run dev</div>
              <div className="mt-3 text-[var(--accent)]">
                ✓ Embedded Postgres started<br/>
                ✓ Registered 9 built-in modules<br/>
                ✓ Server running at http://localhost:3000<br/>
              </div>
              <div className="mt-3 text-[var(--muted)]">$ curl -X POST /api/admin/modules/install \</div>
              <div className="text-[var(--muted)]">{"  "}-F file=@hebbs-crm-0.3.0.hebbsmod</div>
              <div className="mt-3 text-[var(--accent)]">
                ✓ Verified signature (Ed25519)<br/>
                ✓ Applied schema (3 tables)<br/>
                ✓ Registered 7 tools<br/>
                ✓ Loaded 4 skills into agent prompt<br/>
                <br/>
                <span className="text-white font-semibold">Your agents now know CRM. Open the shell.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* npm packages — the lower-level lego */}
      <section className="relative z-10 px-6 py-24 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            <span style={{ color: "var(--accent)" }}>14 packages</span> on npm.
          </h2>
          <p className="text-center text-[var(--muted)] mb-12 max-w-xl mx-auto">
            The framework underneath. Modules sit on top of these; you usually only depend on @boringos/core and @boringos/module-sdk.
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm font-mono">
            {[
              { pkg: "@boringos/core", desc: "Application host" },
              { pkg: "@boringos/agent", desc: "Execution engine + dispatcher" },
              { pkg: "@boringos/module-sdk", desc: "Module / Tool / Skill types" },
              { pkg: "@boringos/runtime", desc: "6 CLI adapters" },
              { pkg: "@boringos/memory", desc: "Cognitive memory" },
              { pkg: "@boringos/drive", desc: "File storage" },
              { pkg: "@boringos/db", desc: "Postgres + Drizzle" },
              { pkg: "@boringos/pipeline", desc: "Job queue" },
              { pkg: "@boringos/ui", desc: "Typed client + React hooks" },
              { pkg: "@boringos/shell", desc: "Reference UI shell" },
              { pkg: "@boringos/connector-slack", desc: "Slack reference Module" },
              { pkg: "@boringos/connector-google", desc: "Gmail + Calendar Module" },
              { pkg: "@boringos/shared", desc: "Base types" },
              { pkg: "create-boringos", desc: "CLI scaffold" },
            ].map((p) => (
              <div key={p.pkg} className="flex items-center justify-between border border-[var(--border)] rounded-lg px-4 py-3 card-hover bg-[var(--code-bg)]">
                <span className="text-[var(--accent)]">{p.pkg}</span>
                <span className="text-[var(--muted)] text-xs">{p.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Copilot */}
      <section className="relative z-10 px-6 py-24 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Every app ships with an <span style={{ color: "var(--accent)" }}>AI copilot</span>
          </h2>
          <p className="text-center text-[var(--muted)] mb-16 max-w-lg mx-auto">
            The <code className="text-xs bg-[var(--code-bg)] px-1.5 py-0.5 rounded">copilot</code> Module is built in. Chat surface, session naming, can call any registered tool, can edit your code. Zero config.
          </p>

          <div className="bg-[var(--code-bg)] border border-[var(--border)] rounded-2xl overflow-hidden neon-border">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
              <div className="w-3 h-3 rounded-full bg-[var(--accent)]" />
              <span className="ml-2 text-xs text-[var(--muted)]">Copilot</span>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-end">
                <div className="bg-[var(--accent)] text-[var(--background)] rounded-xl px-4 py-2 max-w-[70%]">
                  Show me all blocked deals
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--accent)] opacity-20 shrink-0 flex items-center justify-center text-[10px]" style={{ color: "var(--accent)" }}>AI</div>
                <div className="border border-[var(--border)] rounded-xl px-4 py-2 max-w-[70%] text-[var(--muted)]">
                  Calling <span className="font-mono text-xs" style={{ color: "var(--accent)" }}>crm.list_deals</span>…<br/>
                  Found 2 blocked: <span style={{ color: "var(--accent)" }}>Acme</span> (waiting on legal), <span style={{ color: "var(--accent)" }}>Globex</span> (procurement hold).
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-[var(--accent)] text-[var(--background)] rounded-xl px-4 py-2 max-w-[70%]">
                  Add a priority chart to the dashboard
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--accent)] opacity-20 shrink-0 flex items-center justify-center text-[10px]" style={{ color: "var(--accent)" }}>AI</div>
                <div className="border border-[var(--border)] rounded-xl px-4 py-2 max-w-[70%] text-[var(--muted)]">
                  Edited <span className="font-mono text-xs" style={{ color: "var(--accent)" }}>app/page.tsx</span> — added priority distribution chart.<br/>
                  <span className="text-xs">+14 lines. Refresh to see the change.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--code-bg)] text-center">
              <div className="text-xs text-[var(--muted)]">Calls any Tool any Module registered — yours or built-in</div>
            </div>
            <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--code-bg)] text-center">
              <div className="text-xs text-[var(--muted)]">Edits your code, adds features, fixes bugs — from chat</div>
            </div>
            <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--code-bg)] text-center">
              <div className="text-xs text-[var(--muted)]">Sessions auto-named, runs auto-resume, costs tracked</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-28 border-t border-[var(--border)] text-center">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] bg-[var(--accent)] opacity-[0.04] blob blur-3xl" />
        </div>
        <div className="relative">
          <h2 className="text-5xl font-bold mb-4">
            The boring parts are handled.<br />
            <span style={{ color: "var(--accent)" }}>Go ship a Module.</span>
          </h2>
          <p className="text-[var(--muted)] mb-10 text-lg">From zero to first agent in under a minute. From first Module to install in an hour.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/docs"
              className="px-8 py-4 bg-[var(--accent)] text-[var(--background)] rounded-lg font-semibold hover:shadow-[0_0_40px_var(--glow)] transition-all"
            >
              Read the docs
            </Link>
            <a
              href="https://github.com/BoringOS-dev/boringos"
              className="px-8 py-4 border border-[var(--border)] rounded-lg font-semibold hover:border-[var(--accent)] hover:shadow-[0_0_20px_var(--glow)] transition-all"
            >
              View on GitHub
            </a>
            <a
              href="https://github.com/hebbs-ai/hebbs-crm"
              className="px-8 py-4 border border-[var(--border)] rounded-lg font-semibold hover:border-[var(--accent-3)] transition-all"
            >
              Read a real Module
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--border)] px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="" width={18} height={18} className="rounded-sm" />
            <span>BoringOS — MIT License</span>
          </div>
          <div className="flex gap-6">
            <a href="https://github.com/BoringOS-dev/boringos" className="hover:text-[var(--accent)] transition-colors">GitHub</a>
            <a href="https://www.npmjs.com/org/boringos" className="hover:text-[var(--accent)] transition-colors">npm</a>
            <Link href="/docs" className="hover:text-[var(--accent)] transition-colors">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
