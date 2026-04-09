import Link from "next/link";
import { HeroCanvas } from "./components/hero-canvas";

const codeExample = `// Create an AI workforce in 5 lines

const app = new BoringOS({});
await app.listen(3000);

// Spin up a full engineering team — CEO delegates to CTO,
// CTO assigns to engineers, QA validates. All autonomous.
await createTeam(db, "engineering", { tenantId });

// Give them a goal
await createTask(db, {
  title: "Build the MVP",
  description: "Ship user auth, dashboard, and billing by Friday.",
  assigneeAgentId: ctoId,  // CTO breaks it down, delegates to engineers
});

// CEO wakes up. Reads the task. Delegates to CTO.
// CTO creates subtasks. Assigns to engineers.
// Engineers write code. QA reviews. Tasks complete.
// You watch from the dashboard.`;

const features = [
  {
    title: "Agent Execution",
    description: "6 runtimes. 12 personas. 5 team templates. Org hierarchy with delegation and escalation. Create a full engineering team in one call.",
    accent: "var(--accent)",
  },
  {
    title: "Workflows",
    description: "DAG engine with 6 block types. Wake agents, call connectors, branch on conditions. Smart routines that check before spawning.",
    accent: "var(--accent-2)",
  },
  {
    title: "Connectors",
    description: "OAuth handled. Events typed. SDK for building your own. Slack + Google ship as reference. Community builds the rest.",
    accent: "var(--accent-3)",
  },
  {
    title: "Memory",
    description: "Agents remember. Agents recall. Agents learn across runs. Pluggable — Hebbs, or bring your own cognitive engine.",
    accent: "var(--accent)",
  },
  {
    title: "Admin API",
    description: "Full REST for everything. Agents, tasks, runs, approvals, budgets, routines, plugins. JWT + session auth. SSE realtime.",
    accent: "var(--accent-2)",
  },
  {
    title: "Headless UI",
    description: "React hooks for everything. useAgents, useTasks, useRuns. No opinions on your markup. Build any dashboard.",
    accent: "var(--accent-3)",
  },
];

const stats = [
  { value: "14", label: "npm packages" },
  { value: "122", label: "tests passing" },
  { value: "6", label: "runtime adapters" },
  { value: "12", label: "agent personas" },
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
            14 packages on npm — create an AI team in one API call
          </div>

          <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            We handle the
            <br />
            <span className="glow-text" style={{ color: "var(--accent)" }}>boring stuff.</span>
            <br />
            You change the world.
          </h1>

          <p className="text-lg text-[var(--muted)] mb-12 max-w-2xl mx-auto leading-relaxed">
            Agent execution, workflows, connectors, memory, auth, budgets — all taken care of.
            <br />
            <span style={{ color: "var(--accent)" }}>Focus on the exciting problems only you can solve.</span>
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
                <span className="ml-2 text-xs text-[var(--muted)]">index.ts</span>
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

      {/* Features */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Everything you need.<br />
            <span className="text-[var(--muted)]">Nothing you don&apos;t.</span>
          </h2>
          <p className="text-center text-[var(--muted)] mb-16 max-w-lg mx-auto">
            14 packages that compose into any agentic product — CRM, support desk, devops, personal assistant.
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
            You set the goal. The AI team figures out the rest.
          </p>
          <div className="space-y-0">
            {[
              { step: "1", label: "Create team", desc: "One API call creates your AI workforce — CEO, CTO, engineers, QA — with hierarchy and personas pre-configured." },
              { step: "2", label: "Assign a goal", desc: "\"Build the MVP by Friday.\" Assign to the CEO or CTO. They understand what to do." },
              { step: "3", label: "Delegation", desc: "CTO reads the goal, breaks it into subtasks, assigns each to the right engineer based on skills. QA gets the test plan." },
              { step: "4", label: "Autonomous work", desc: "Each agent spawns a CLI (Claude, Codex, Gemini), writes code, runs tests, posts updates. Budget enforced. Memory shared." },
              { step: "5", label: "Escalation & completion", desc: "Stuck? Agent escalates to its boss. Need approval? Humans approve via dashboard. Done? Tasks close, memory persists, next goal begins." },
            ].map((s, i) => (
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
          <p className="text-[var(--muted)] mb-12">One line boots the entire platform. Embedded Postgres included.</p>

          <div className="inline-block text-left">
            <div className="bg-[var(--code-bg)] border border-[var(--border)] rounded-2xl p-6 neon-border font-mono text-sm">
              <div className="text-[var(--muted)]">$ npx create-boringos my-startup</div>
              <div className="text-[var(--muted)]">$ npm run dev</div>
              <div className="mt-3 text-[var(--accent)]">
                ✓ Server running at http://localhost:3000<br/>
              </div>
              <div className="mt-3 text-[var(--muted)]">$ curl -X POST /api/admin/teams/from-template \</div>
              <div className="text-[var(--muted)]">{"  "}-d {`'{"template": "engineering"}'`}</div>
              <div className="mt-3 text-[var(--accent)]">
                ✓ Created CTO (reports to: none)<br/>
                ✓ Created Senior Engineer (reports to: CTO)<br/>
                ✓ Created Engineer (reports to: CTO)<br/>
                ✓ Created QA Engineer (reports to: CTO)<br/>
              </div>
              <div className="mt-3 text-[var(--muted)]">$ curl -X POST /api/admin/agents/cto-id/wake \</div>
              <div className="text-[var(--muted)]">{"  "}-d {`'{"taskId": "build-mvp"}'`}</div>
              <div className="mt-3 text-[var(--accent)]">
                ✓ CTO woken — reading task...<br/>
                ✓ CTO delegated "Auth module" → Senior Engineer<br/>
                ✓ CTO delegated "Dashboard" → Engineer<br/>
                ✓ CTO delegated "Test plan" → QA Engineer<br/>
                <br/>
                <span className="text-white font-semibold">Your AI team is working. Check the dashboard.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Install */}
      <section className="relative z-10 px-6 py-24 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            <span style={{ color: "var(--accent)" }}>14 packages.</span> Use what you need.
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm font-mono">
            {[
              { pkg: "@boringos/core", desc: "Application host" },
              { pkg: "@boringos/agent", desc: "Execution engine" },
              { pkg: "@boringos/runtime", desc: "6 CLI adapters" },
              { pkg: "@boringos/memory", desc: "Cognitive memory" },
              { pkg: "@boringos/workflow", desc: "DAG engine" },
              { pkg: "@boringos/connector", desc: "Connector SDK" },
              { pkg: "@boringos/drive", desc: "File storage" },
              { pkg: "@boringos/db", desc: "Postgres + Drizzle" },
              { pkg: "@boringos/pipeline", desc: "Job queue" },
              { pkg: "@boringos/ui", desc: "React hooks" },
              { pkg: "@boringos/connector-slack", desc: "Slack" },
              { pkg: "@boringos/connector-google", desc: "Gmail + Calendar" },
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

      {/* CTA */}
      <section className="relative z-10 px-6 py-28 border-t border-[var(--border)] text-center">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] bg-[var(--accent)] opacity-[0.04] blob blur-3xl" />
        </div>
        <div className="relative">
          <h2 className="text-5xl font-bold mb-4">
            The boring parts are handled.<br />
            <span style={{ color: "var(--accent)" }}>Go build something exciting.</span>
          </h2>
          <p className="text-[var(--muted)] mb-10 text-lg">From zero to running agent platform in under a minute.</p>
          <div className="flex items-center justify-center gap-4">
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
