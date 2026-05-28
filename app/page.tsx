import Link from "next/link";
import { HeroCanvas } from "./components/hero-canvas";
import { AgentOrchestra } from "./components/agent-orchestra";
import { WorkflowDAG } from "./components/workflow-dag";

// What boots when you run the shell — the concrete payoff of one command.
const whatsLive = [
  { name: "Agents org", desc: "A team of agents with roles, hierarchy, and delegation — already wired." },
  { name: "Copilot", desc: "A chat surface in every app that can run tools and edit your code." },
  { name: "Inbox", desc: "Email / Slack / event triage queue agents work from." },
  { name: "Workflows", desc: "Visual DAG runner over the same tools your agents call." },
  { name: "Drive", desc: "Tenant-isolated file storage with per-agent ACLs." },
  { name: "Budgets", desc: "Spend caps per tenant, agent, and task — enforced at runtime." },
  { name: "CRM", desc: "A full example app — deals, contacts, schema, UI — shipped as a Module." },
  { name: "Modules screen", desc: "Drop in new apps as signed bundles, live, no restart." },
];

// The three primitives — every component is built from these.
const primitives = [
  {
    title: "Skills",
    tagline: "Behavior, in markdown.",
    description:
      "Plain .md files concatenated into the agent's system prompt on every wake. Teach it when to use a tool, the edge cases, your house style. No templating — just words.",
    accent: "var(--accent)",
    example: "skills/deals.md → injected under ## Skills",
  },
  {
    title: "Tools",
    tagline: "Capability, with types.",
    description:
      "Zod-typed callables dispatched at POST /api/tools/<module>.<name>. The same handler runs from agents, workflows, routines, or your own routes. Every call is audited.",
    accent: "var(--accent-2)",
    example: "crm.list_deals({ stage: \"blocked\" })",
  },
  {
    title: "Modules",
    tagline: "Everything, bundled.",
    description:
      "One manifest binds skills + tools + schema + workflows + routines + webhooks + OAuth + UI. Built-ins, third-parties, your own — all the same shape. app.module(x) wires the rest.",
    accent: "var(--accent-3)",
    example: "app.module(crmModule)",
  },
];

// How a goal becomes done — the execution loop, concretely.
const pipeline = [
  { step: "1", label: "Assign a goal", desc: "Create a task, assign it to an agent or a role. A comment on a task is a message; posting one wakes the agent." },
  { step: "2", label: "The agent wakes", desc: "It reads its skills, the task, recent comments, and relevant memory — assembled fresh by the context pipeline." },
  { step: "3", label: "It works in a CLI", desc: "The framework spawns Claude Code / Codex / Gemini / Ollama as a subprocess. Skills shape behavior; tools execute capability." },
  { step: "4", label: "Guardrails hold", desc: "Budget tracked per run. High-risk steps pause for human approval. Every tool call lands in the audit log." },
  { step: "5", label: "It reports back", desc: "The run's result auto-posts as a comment. Remaining work re-wakes the agent. Memory persists across runs." },
];

// What @boringos/core actually ships — honest, dev-framed, no vapor.
const batteries = [
  {
    title: "Budget enforcement",
    desc: "Spend caps by tenant, agent, or task. Hard stops or soft alerts. Cost — including Anthropic cache tokens — tracked per run, not estimated after.",
    accent: "var(--accent)",
  },
  {
    title: "Audit ledger",
    desc: "Every tool call writes a row to tool_calls with actor, inputs, and outcome. Run transitions, comments, approvals — all on one timeline you can replay.",
    accent: "var(--accent-2)",
  },
  {
    title: "Runtime router",
    desc: "Route any task to Claude Code, Codex, Gemini CLI, Ollama, a raw command, or a webhook. Skills and tools stay stable while you swap the backend.",
    accent: "var(--accent-3)",
  },
  {
    title: "Human approvals",
    desc: "wait-for-human blocks pause a run and create an Actions-queue card. Approve, and execution resumes with your input merged in. Low-risk paths stay autonomous.",
    accent: "var(--accent)",
  },
  {
    title: "Multi-tenant by default",
    desc: "Sessions, invitations, team management, device auth — every domain row carries a tenantId. Two tenants never see each other's data.",
    accent: "var(--accent-2)",
  },
  {
    title: "Signed module installs",
    desc: "Third-party apps ship as Ed25519-signed .hebbsmod bundles. The host verifies, content-addresses, migrates schema, and registers tools on a live process.",
    accent: "var(--accent-3)",
  },
];

// Any agentic CLI is a runtime.
const runtimes = [
  { id: "claude", spawns: "Claude Code CLI" },
  { id: "chatgpt", spawns: "OpenAI Codex CLI" },
  { id: "gemini", spawns: "Google Gemini CLI" },
  { id: "ollama", spawns: "Local Ollama model" },
  { id: "command", spawns: "Any shell command" },
  { id: "webhook", spawns: "HTTP POST to a URL" },
];

const builtInModules = [
  { id: "framework", desc: "Tasks, comments, agents, runs", kind: "core" },
  { id: "memory", desc: "Pluggable cognitive memory", kind: "core" },
  { id: "drive", desc: "File storage + ACL", kind: "core" },
  { id: "workflow", desc: "DAG runner over the tool registry", kind: "core" },
  { id: "inbox", desc: "Email/Slack/event triage queue", kind: "core" },
  { id: "triage", desc: "Routes new items to the right agent", kind: "capability" },
  { id: "copilot", desc: "Built-in chat surface for every app", kind: "module" },
  { id: "google", desc: "Gmail + Calendar via OAuth", kind: "connector" },
  { id: "slack", desc: "Channels, DMs, slash commands", kind: "connector" },
];

const moduleSteps = [
  { step: "01", title: "Author", desc: "Plain TypeScript. Implement the Module interface. Skills as .md, tools as Zod-typed handlers." },
  { step: "02", title: "Bundle", desc: "A .hebbsmod is a signed zip — manifest + ESM entry + skills + migrations + UI. ~100KB–2MB." },
  { step: "03", title: "Upload", desc: "Drag it onto the shell's Apps screen. Ed25519 signature verified, bytes content-addressed." },
  { step: "04", title: "Install", desc: "Tenants opt in. Schema applied, tools live at /api/tools/<id>.<name>, agents read the new skills next wake." },
];

const aclCards = [
  {
    title: "Tenant isolation, structural",
    desc: "Every path is prefixed with the tenant id at the storage layer. No code path reads or writes outside the tenant root. Path traversal is rejected before the storage call.",
    accent: "var(--accent-2)",
  },
  {
    title: "User space is genuinely private",
    desc: "users/<id>/ returns \"private — not accessible to agents\" on every agent attempt. Not a permission you forgot to set — the default, in the type system, with a literal error string you can grep.",
    accent: "var(--accent-3)",
  },
  {
    title: "Per-agent ACLs",
    desc: "Agents read each other's working drafts (transparency by default) but can only write to their own agents/<id>/ folder. Cross-agent writes are rejected before storage.",
    accent: "var(--accent)",
  },
  {
    title: "Every byte goes through Drive",
    desc: "Reads, writes, lists, deletes — all through DriveManager. That means tenant scoping, ACL check, audit row, event fan-out, memory-sync index, every time. No side door.",
    accent: "var(--accent-2)",
  },
];

const packages = [
  { pkg: "@boringos/core", desc: "Application host" },
  { pkg: "@boringos/agent", desc: "Execution engine + dispatcher" },
  { pkg: "@boringos/module-sdk", desc: "Module / Tool / Skill types" },
  { pkg: "@boringos/runtime", desc: "CLI runtime adapters" },
  { pkg: "@boringos/memory", desc: "Cognitive memory" },
  { pkg: "@boringos/drive", desc: "File storage + ACL" },
  { pkg: "@boringos/db", desc: "Postgres + Drizzle" },
  { pkg: "@boringos/pipeline", desc: "Job queue" },
  { pkg: "@boringos/ui", desc: "Typed client + React hooks" },
  { pkg: "@boringos/shell", desc: "Reference UI shell" },
  { pkg: "@boringos/connector-slack", desc: "Slack reference Module" },
  { pkg: "@boringos/connector-google", desc: "Gmail + Calendar Module" },
  { pkg: "@boringos/shared", desc: "Base types" },
  { pkg: "create-boringos", desc: "CLI scaffold" },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">

      {/* ───────────── Hero ───────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: "100vh", background: "#06060e" }}>
        <HeroCanvas />

        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(6,6,14,0) 0%, rgba(6,6,14,0.6) 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none" style={{ background: "linear-gradient(to top, #0a0a0f, transparent)" }} />

        {/* Nav */}
        <nav className="relative z-10 border-b border-[var(--border)] px-6 py-4 glass">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="BoringOS" width={28} height={28} className="rounded-md" />
              <span className="text-xl font-bold tracking-tight">BoringOS</span>
              <span className="hidden sm:inline text-[10px] uppercase tracking-widest text-[var(--muted)] border border-[var(--border)] rounded-full px-2 py-0.5 ml-1">
                by Hebbs
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[var(--muted)]">
              <a href="#run" className="hover:text-[var(--accent)] transition-colors hidden md:inline">Run it</a>
              <Link href="/docs" className="hover:text-[var(--accent)] transition-colors">Docs</Link>
              <a href="https://github.com/BoringOS-dev/boringos" className="hover:text-[var(--accent)] transition-colors">GitHub</a>
              <a href="https://www.npmjs.com/org/boringos" className="hover:text-[var(--accent)] transition-colors hidden md:inline">npm</a>
              <a href="#run" className="px-4 py-1.5 border border-[var(--accent)] text-[var(--accent)] rounded-full text-xs font-medium hover:bg-[var(--accent)] hover:text-[var(--background)] transition-all">
                Get Started
              </a>
            </div>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 px-6 pt-24 pb-20">
          <div className="max-w-4xl mx-auto text-center">

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
              Open source · AGPL-3.0 · runs on your laptop in ~60s
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              The open-source framework for
              <br />
              <span className="glow-text" style={{ color: "var(--accent)" }}>agents that do the work.</span>
            </h1>

            <p className="text-lg text-[var(--muted)] mb-4 max-w-2xl mx-auto leading-relaxed">
              BoringOS runs your agents as the CLI tools you already use — Claude Code, Codex, Gemini, Ollama —
              and wires them into tasks, workflows, memory, and a multi-tenant backend.
              Budgets, audit trails, and human approvals live in the execution path, not bolted on after.
            </p>
            <p className="text-sm text-[var(--muted)] mb-10 opacity-70">
              The open-source agent framework built by{" "}
              <a href="https://hebbs.ai" className="text-[var(--accent)] hover:underline">Hebbs</a>. One command boots the whole thing locally.
            </p>

            {/* PRIMARY CTA — run the shell */}
            <div id="run" className="max-w-3xl mx-auto mb-6 scroll-mt-24">
              <div className="text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2 text-left">
                Run the full stack locally — paste into your coding agent (Claude Code · Cursor · Codex · Gemini CLI), in an empty folder
              </div>
              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity" style={{ background: "var(--accent)" }} />
                <div className="relative bg-[var(--code-bg)] border-2 rounded-2xl p-5 flex items-center gap-4" style={{ borderColor: "var(--accent)", boxShadow: "0 0 40px var(--glow)" }}>
                  <div className="text-2xl shrink-0 opacity-60">›</div>
                  <div className="flex-1 text-left font-mono text-base md:text-lg" style={{ color: "var(--accent)" }}>
                    deploy boringos shell on my localhost
                  </div>
                  <button
                    type="button"
                    className="shrink-0 text-[10px] uppercase tracking-widest px-3 py-1.5 border border-[var(--border)] rounded-full text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all"
                    aria-label="Copy prompt"
                  >
                    copy
                  </button>
                </div>
              </div>
            </div>

            {/* Manual path — devs trust real commands */}
            <div className="max-w-3xl mx-auto mb-8 text-left">
              <div className="text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">
                Prefer real commands?
              </div>
              <div className="bg-[var(--code-bg)] border border-[var(--border)] rounded-xl px-5 py-4 font-mono text-xs md:text-sm overflow-x-auto">
                <span className="text-[var(--muted)]">$ </span>
                <span style={{ color: "var(--accent)" }}>git clone</span> https://github.com/BoringOS-dev/boringos &amp;&amp; <span style={{ color: "var(--accent)" }}>cd</span> boringos &amp;&amp; <span style={{ color: "var(--accent)" }}>pnpm</span> install &amp;&amp; <span style={{ color: "var(--accent)" }}>pnpm</span> dev
              </div>
              <p className="text-xs text-[var(--muted)] mt-2 opacity-70">
                Boots embedded Postgres and serves the shell at <span style={{ color: "var(--accent)" }}>localhost:3000</span>. No Docker, no external services.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/docs"
                className="px-8 py-3.5 bg-[var(--accent)] text-[var(--background)] rounded-lg font-semibold text-sm hover:shadow-[0_0_30px_var(--glow)] transition-all"
              >
                Read the docs
              </Link>
              <a
                href="https://github.com/BoringOS-dev/boringos"
                className="px-8 py-3.5 border border-[var(--border)] rounded-lg font-semibold text-sm hover:border-[var(--accent)] hover:shadow-[0_0_20px_var(--glow)] transition-all"
              >
                Star on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── What the shell is ───────────── */}
      <section className="relative z-10 px-6 py-24 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 border border-[var(--border)] rounded-full text-[10px] uppercase tracking-widest text-[var(--muted)] mb-4">
              What the shell is
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              One command boots a <span style={{ color: "var(--accent)" }}>full agentic OS.</span>
            </h2>
            <p className="text-[var(--muted)] max-w-2xl mx-auto">
              The <strong className="text-[var(--foreground)]">shell</strong> is the reference app that ships with the repo — a complete operating surface for your agents.
              You don&apos;t build any of it to start. Run the command above and this is live at localhost:3000.
            </p>
          </div>

          {/* Activation log */}
          <div className="relative max-w-3xl mx-auto mb-14">
            <div className="absolute -inset-2 rounded-2xl blur-2xl opacity-[0.12]" style={{ background: "var(--accent)" }} />
            <div className="relative bg-[var(--code-bg)] border-2 rounded-2xl overflow-hidden" style={{ borderColor: "var(--accent)" }}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                  <span className="ml-2 text-xs text-[var(--muted)] font-mono">your coding agent</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-[var(--muted)]">boot log</span>
              </div>
              <div className="px-6 py-5 font-mono text-[11px] md:text-xs leading-relaxed" style={{ color: "var(--accent)", opacity: 0.9 }}>
                ✓ Cloned github.com/BoringOS-dev/boringos<br />
                ✓ Installed packages · built workspace<br />
                ✓ Embedded Postgres started on :54321<br />
                ✓ Registered 9 built-in Modules<br />
                ✓ Shell live at <span className="underline">http://localhost:3000</span>
                <div className="mt-3 text-white font-semibold">
                  Open the shell. Sign up. Start talking to your agents.
                </div>
              </div>
            </div>
          </div>

          {/* What's live grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {whatsLive.map((w) => (
              <div key={w.name} className="border border-[var(--border)] rounded-xl p-5 bg-[var(--code-bg)] card-hover">
                <div className="w-2 h-2 rounded-full mb-3" style={{ background: "var(--accent)", boxShadow: "0 0 10px var(--accent)" }} />
                <h3 className="font-semibold mb-1">{w.name}</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── The three primitives ───────────── */}
      <section className="relative z-10 px-6 py-24 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 border border-[var(--border)] rounded-full text-[10px] uppercase tracking-widest text-[var(--muted)] mb-4">
              The three primitives
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Three concepts. <span style={{ color: "var(--accent)" }}>That&apos;s the whole model.</span>
            </h2>
            <p className="text-[var(--muted)] max-w-2xl mx-auto">
              Every connector, every app, every built-in capability is made of these. Learn them once, and you can read — or write — any part of the system.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {primitives.map((p) => (
              <div key={p.title} className="border border-[var(--border)] rounded-2xl p-7 card-hover bg-[var(--code-bg)] flex flex-col">
                <div className="w-3 h-3 rounded-full mb-5" style={{ backgroundColor: p.accent, boxShadow: `0 0 14px ${p.accent}` }} />
                <h3 className="text-2xl font-bold mb-1">{p.title}</h3>
                <p className="text-sm mb-4" style={{ color: p.accent }}>{p.tagline}</p>
                <p className="text-sm text-[var(--muted)] leading-relaxed mb-4 flex-1">{p.description}</p>
                <code className="text-xs bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 font-mono block overflow-x-auto" style={{ color: p.accent }}>
                  {p.example}
                </code>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center text-sm text-[var(--muted)]">
            Specs:{" "}
            <Link href="/docs" className="text-[var(--accent)] hover:underline">SKILLS.md</Link>
            {" · "}
            <Link href="/docs" className="text-[var(--accent)] hover:underline">TOOLS.md</Link>
            {" · "}
            <Link href="/docs" className="text-[var(--accent)] hover:underline">MODULES.md</Link>
          </div>
        </div>
      </section>

      {/* ───────────── How agents work — goal to done ───────────── */}
      <section className="relative z-10 px-6 py-24 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 border border-[var(--border)] rounded-full text-[10px] uppercase tracking-widest text-[var(--muted)] mb-4">
              How it runs
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              From goal to <span style={{ color: "var(--accent)" }}>done.</span>
            </h2>
            <p className="text-[var(--muted)] max-w-lg mx-auto">
              You set the goal. The agent figures out the rest. Every action is a Tool call. Every Tool call is audited.
            </p>
          </div>
          <div className="space-y-0">
            {pipeline.map((s) => (
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

      {/* ───────────── Agent Orchestra visual ───────────── */}
      <section className="relative z-10 px-6 py-24 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Agents that <span style={{ color: "var(--accent)" }}>delegate.</span>
          </h2>
          <p className="text-center text-[var(--muted)] mb-12 max-w-xl mx-auto">
            Agents have a <code className="text-xs bg-[var(--code-bg)] px-1.5 py-0.5 rounded">reportsTo</code> field. They break goals into subtasks, assign each to the right teammate, escalate when blocked, and hand off to humans cleanly.
          </p>
          <div className="relative bg-[var(--code-bg)] border border-[var(--border)] rounded-2xl overflow-hidden neon-border">
            <AgentOrchestra />
          </div>
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--code-bg)] card-hover">
              <div className="w-2 h-2 rounded-full mb-3" style={{ backgroundColor: "var(--accent)", boxShadow: "0 0 10px var(--accent)" }} />
              <h3 className="font-semibold mb-1">Hierarchy &amp; delegation</h3>
              <p className="text-sm text-[var(--muted)]">CEO sets the goal, CTO breaks it down, engineers execute, QA validates. A next_actor state machine routes work between agents and humans.</p>
            </div>
            <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--code-bg)] card-hover">
              <div className="w-2 h-2 rounded-full mb-3" style={{ backgroundColor: "var(--accent-2)", boxShadow: "0 0 10px var(--accent-2)" }} />
              <h3 className="font-semibold mb-1">Shared memory</h3>
              <p className="text-sm text-[var(--muted)]">Every run builds context. Pluggable provider — Hebbs out of the box, or your own.</p>
            </div>
            <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--code-bg)] card-hover">
              <div className="w-2 h-2 rounded-full mb-3" style={{ backgroundColor: "var(--accent-3)", boxShadow: "0 0 10px var(--accent-3)" }} />
              <h3 className="font-semibold mb-1">Budget-enforced</h3>
              <p className="text-sm text-[var(--muted)]">Cost tracked per run. Limits per agent, per task, per tenant. No runaway spend.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Workflows visual ───────────── */}
      <section className="relative z-10 px-6 py-24 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Workflows you can <span style={{ color: "var(--accent-2)" }}>see.</span>
          </h2>
          <p className="text-center text-[var(--muted)] mb-12 max-w-2xl mx-auto">
            A DAG that dispatches every node through the tool registry — the same handlers your agents call. Persisted runs, live SSE, replay, fork-from-here, budget gates, and pause-on-approval.
          </p>
          <div className="relative bg-[var(--code-bg)] border border-[var(--border)] rounded-2xl overflow-hidden neon-border">
            <WorkflowDAG />
          </div>
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--code-bg)] card-hover">
              <div className="w-2 h-2 rounded-full mb-3" style={{ backgroundColor: "var(--accent-2)", boxShadow: "0 0 10px var(--accent-2)" }} />
              <h3 className="font-semibold mb-1">Tool registry as the backend</h3>
              <p className="text-sm text-[var(--muted)]">Each block resolves to a Tool — same Zod validation, same audit log, whether the call comes from an agent, a workflow, or a routine.</p>
            </div>
            <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--code-bg)] card-hover">
              <div className="w-2 h-2 rounded-full mb-3" style={{ backgroundColor: "var(--accent)", boxShadow: "0 0 10px var(--accent)" }} />
              <h3 className="font-semibold mb-1">Live runs</h3>
              <p className="text-sm text-[var(--muted)]">Every block transition streams via SSE. Watch the DAG light up — no polling, no reconstruction.</p>
            </div>
            <div className="border border-[var(--border)] rounded-xl p-5 bg-[var(--code-bg)] card-hover">
              <div className="w-2 h-2 rounded-full mb-3" style={{ backgroundColor: "var(--accent-3)", boxShadow: "0 0 10px var(--accent-3)" }} />
              <h3 className="font-semibold mb-1">Replay &amp; fork</h3>
              <p className="text-sm text-[var(--muted)]">Re-execute past runs. Fork from any block. Compare two runs side by side.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Batteries in core ───────────── */}
      <section className="relative z-10 px-6 py-24 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 border border-[var(--border)] rounded-full text-[10px] uppercase tracking-widest text-[var(--muted)] mb-4">
              Batteries included
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              The controls are <span style={{ color: "var(--accent)" }}>first-class.</span>
            </h2>
            <p className="text-[var(--muted)] max-w-2xl mx-auto">
              Budgets, audit, runtime routing, and approvals aren&apos;t add-ons — they sit in the execution path. Here&apos;s what <code className="text-xs bg-[var(--code-bg)] px-1.5 py-0.5 rounded">@boringos/core</code> ships.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {batteries.map((f) => (
              <div key={f.title} className="border border-[var(--border)] rounded-2xl p-6 card-hover bg-[var(--code-bg)]">
                <div className="w-2 h-2 rounded-full mb-4" style={{ backgroundColor: f.accent, boxShadow: `0 0 10px ${f.accent}` }} />
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Runtime strip */}
          <div className="mt-12 border border-[var(--border)] rounded-2xl p-6 bg-[var(--code-bg)]">
            <div className="text-[10px] uppercase tracking-widest text-[var(--muted)] mb-4">Runtimes — any agentic CLI is one</div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {runtimes.map((r) => (
                <div key={r.id} className="text-center">
                  <div className="font-mono text-sm" style={{ color: "var(--accent)" }}>{r.id}</div>
                  <div className="text-[10px] text-[var(--muted)] mt-1 leading-tight">{r.spawns}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Safety / Drive ACL ───────────── */}
      <section className="relative z-10 px-6 py-24 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 border border-[var(--accent-2)] rounded-full text-[10px] uppercase tracking-widest mb-4" style={{ color: "var(--accent-2)" }}>
              Built-in isolation
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Autonomy without the <span style={{ color: "var(--accent-2)" }}>blast radius.</span>
            </h2>
            <p className="text-[var(--muted)] max-w-2xl mx-auto">
              Agents run with <code className="text-xs bg-[var(--code-bg)] px-1.5 py-0.5 rounded">--dangerously-skip-permissions</code> so they don&apos;t stop to ask. That&apos;s safe because every byte they read or write goes through Drive — the framework&apos;s proxy over the filesystem. Tenants can&apos;t see each other. Private files stay private.
            </p>
          </div>

          <div className="relative max-w-3xl mx-auto mb-12">
            <div className="absolute -inset-2 rounded-2xl blur-xl opacity-[0.06]" style={{ background: "var(--accent-2)" }} />
            <div className="relative bg-[var(--code-bg)] border border-[var(--border)] rounded-2xl overflow-hidden neon-border">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                <span className="ml-2 text-xs text-[var(--muted)]">drive namespace · tenant=&lt;tenantId&gt;</span>
              </div>
              <pre className="p-6 overflow-x-auto text-sm leading-relaxed font-mono">
                <code>
{`<tenantId>/                  `}<span style={{ color: "var(--accent-2)" }}>{`# isolation root — you cannot escape it`}</span>{`
├── shared/...               `}<span className="text-[var(--muted)]">{`# tenant-wide   · agents read+write`}</span>{`
├── users/<userId>/...       `}<span style={{ color: "var(--accent-3)" }}>{`# PRIVATE       · agents denied`}</span>{`
├── agents/<agentId>/...     `}<span className="text-[var(--muted)]">{`# agent home    · own=rw · others=read-only`}</span>{`
├── tasks/<taskId>/...       `}<span className="text-[var(--muted)]">{`# deliverables  · tenant-shared`}</span>{`
└── projects/<projectId>/... `}<span className="text-[var(--muted)]">{`# long-running  · tenant-shared`}</span>
                </code>
              </pre>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {aclCards.map((p) => (
              <div key={p.title} className="border border-[var(--border)] rounded-2xl p-6 bg-[var(--code-bg)] card-hover">
                <div className="w-2 h-2 rounded-full mb-3" style={{ backgroundColor: p.accent, boxShadow: `0 0 10px ${p.accent}` }} />
                <h3 className="font-semibold mb-2">{p.title}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center text-sm text-[var(--muted)] max-w-2xl mx-auto">
            The agent has full power inside its lane. The lane is the load-bearing part. Source: <code className="text-xs bg-[var(--code-bg)] px-1.5 py-0.5 rounded">@boringos/core/src/modules/drive-acl.ts</code>.
          </div>
        </div>
      </section>

      {/* ───────────── Built-in modules ───────────── */}
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

      {/* ───────────── Anyone can ship a Module ───────────── */}
      <section className="relative z-10 px-6 py-24 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 border border-[var(--accent-3)] rounded-full text-[10px] uppercase tracking-widest mb-4" style={{ color: "var(--accent-3)" }}>
              Open ecosystem
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Extend the shell — <span style={{ color: "var(--accent-3)" }}>without forking it.</span>
            </h2>
            <p className="text-[var(--muted)] max-w-2xl mx-auto">
              A Module is a TypeScript file with a manifest. Bundle it into a <code className="text-xs bg-[var(--code-bg)] px-1.5 py-0.5 rounded">.hebbsmod</code> archive, upload it, and hosts install it per-tenant — same flow as a Chrome extension, just for agents.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-16">
            {moduleSteps.map((s) => (
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
                      Real example · by Hebbs
                    </div>
                    <div className="text-xs text-[var(--muted)] font-mono">github.com/hebbs-ai/hebbs-crm</div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-[var(--accent-3)] transition-colors">
                    Hebbs CRM
                  </h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed mb-4">
                    A full CRM — deals, contacts, pipelines, custom entity schema, React UI, agent skills — shipped as a single Module by Hebbs, the company behind BoringOS. No standalone server. Installed into a running host via the framework&apos;s install pipeline. The canonical reference for a shell-hosted app living in a third-party repo.
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

      {/* ───────────── Copilot ───────────── */}
      <section className="relative z-10 px-6 py-24 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Every app ships with an <span style={{ color: "var(--accent)" }}>AI copilot.</span>
          </h2>
          <p className="text-center text-[var(--muted)] mb-16 max-w-lg mx-auto">
            The <code className="text-xs bg-[var(--code-bg)] px-1.5 py-0.5 rounded">copilot</code> Module is built in. A chat surface that can call any registered tool and edit your code. Zero config, auto-provisioned per tenant.
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
                  Calling <span className="font-mono text-xs" style={{ color: "var(--accent)" }}>crm.list_deals</span>…<br />
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
                  Edited <span className="font-mono text-xs" style={{ color: "var(--accent)" }}>app/page.tsx</span> — added priority distribution chart.<br />
                  <span className="text-xs">+14 lines. Refresh to see the change.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── npm packages ───────────── */}
      <section className="relative z-10 px-6 py-24 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            <span style={{ color: "var(--accent)" }}>14 packages</span> on npm.
          </h2>
          <p className="text-center text-[var(--muted)] mb-12 max-w-xl mx-auto">
            The framework underneath the shell. Modules sit on top; you usually only depend on <code className="text-xs bg-[var(--code-bg)] px-1.5 py-0.5 rounded">@boringos/core</code> and <code className="text-xs bg-[var(--code-bg)] px-1.5 py-0.5 rounded">@boringos/module-sdk</code>.
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm font-mono">
            {packages.map((p) => (
              <div key={p.pkg} className="flex items-center justify-between border border-[var(--border)] rounded-lg px-4 py-3 card-hover bg-[var(--code-bg)]">
                <span className="text-[var(--accent)]">{p.pkg}</span>
                <span className="text-[var(--muted)] text-xs">{p.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── Final CTA ───────────── */}
      <section className="relative z-10 px-6 py-28 border-t border-[var(--border)] text-center">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] bg-[var(--accent)] opacity-[0.04] blur-3xl rounded-full" />
        </div>
        <div className="relative">
          <h2 className="text-5xl font-bold mb-4">
            Stop reading.<br />
            <span style={{ color: "var(--accent)" }}>Run it.</span>
          </h2>
          <p className="text-[var(--muted)] mb-10 text-lg">One command. One minute. Your own agentic OS on localhost.</p>

          <div className="relative max-w-2xl mx-auto mb-8">
            <div className="absolute -inset-2 rounded-2xl blur-xl opacity-30" style={{ background: "var(--accent)" }} />
            <div className="relative bg-[var(--code-bg)] border-2 rounded-2xl px-6 py-5 flex items-center gap-4" style={{ borderColor: "var(--accent)" }}>
              <div className="text-2xl shrink-0 opacity-60">›</div>
              <div className="flex-1 text-left font-mono text-base md:text-lg" style={{ color: "var(--accent)" }}>
                deploy boringos shell on my localhost
              </div>
              <span className="text-[10px] uppercase tracking-widest text-[var(--muted)] shrink-0 hidden md:block">paste in your coding agent</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="https://github.com/BoringOS-dev/boringos"
              className="px-8 py-4 bg-[var(--accent)] text-[var(--background)] rounded-lg font-semibold hover:shadow-[0_0_40px_var(--glow)] transition-all"
            >
              Star on GitHub
            </a>
            <Link
              href="/docs"
              className="px-8 py-4 border border-[var(--border)] rounded-lg font-semibold hover:border-[var(--accent)] hover:shadow-[0_0_20px_var(--glow)] transition-all"
            >
              Read the docs
            </Link>
          </div>

          <div className="mt-10 text-xs text-[var(--muted)] opacity-60">
            Building a fully custom agentic product instead?{" "}
            <code className="bg-[var(--code-bg)] border border-[var(--border)] px-1.5 py-0.5 rounded font-mono">npx create-boringos my-app</code>
          </div>
        </div>
      </section>

      {/* ───────────── Footer ───────────── */}
      <footer className="relative z-10 border-t border-[var(--border)] px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-[var(--muted)] flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="" width={18} height={18} className="rounded-sm" />
            <span>BoringOS — AGPL-3.0 · built by <a href="https://hebbs.ai" className="hover:text-[var(--accent)] transition-colors">Hebbs</a></span>
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
