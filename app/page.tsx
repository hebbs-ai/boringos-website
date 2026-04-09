import Link from "next/link";

const codeExample = `import { BoringOS, createHebbsMemory } from "@boringos/core";
import { slack } from "@boringos/connector-slack";
import { google } from "@boringos/connector-google";

const app = new BoringOS({});

app.memory(createHebbsMemory({ endpoint: "...", apiKey: "..." }));
app.connector(slack({ signingSecret: "..." }));
app.connector(google({ clientId: "...", clientSecret: "..." }));

const server = await app.listen(3000);
// Embedded Postgres boots, schema created, 6 runtimes registered
// Agent callback API, admin API, SSE events — all ready`;

const features = [
  {
    title: "Agent Execution",
    description: "Wake → queue → build context → spawn CLI → stream output → persist state. 6 runtime adapters. 12 persona bundles. Session continuity.",
    icon: "⚡",
  },
  {
    title: "Workflows",
    description: "DAG-based workflow engine with condition branching, delays, and transforms. Trigger from events, cron, or API.",
    icon: "🔀",
  },
  {
    title: "Connectors",
    description: "SDK for any external service. OAuth handled. Events typed. Slack and Google Workspace ship as reference implementations.",
    icon: "🔌",
  },
  {
    title: "Memory",
    description: "Pluggable cognitive memory. Agents remember, recall, and learn across runs. Hebbs provider or bring your own.",
    icon: "🧠",
  },
  {
    title: "Admin API",
    description: "Full REST API for managing agents, tasks, runs, runtimes, approvals, budgets, routines. JWT + session auth.",
    icon: "🔑",
  },
  {
    title: "Headless UI",
    description: "Typed API client + React hooks. useAgents, useTasks, useRuns, useApprovals — build any dashboard.",
    icon: "🎨",
  },
];

const builtIn = [
  "Embedded PostgreSQL — zero-config database",
  "6 runtime adapters — Claude, ChatGPT, Gemini, Ollama, command, webhook",
  "12 persona bundles — CEO, CTO, engineer, researcher, PM, QA, DevOps, designer, PA, content creator, finance",
  "12 context providers — persona, task, memory, session, protocol, drive skill, tenant guidelines",
  "Workflow engine — DAG execution with branching",
  "Connector SDK — OAuth, events, actions, test harness",
  "Budget enforcement — hard-stop + warning thresholds",
  "Routine scheduler — cron-based recurring agent tasks",
  "Plugin system — extensible jobs + webhooks, built-in GitHub plugin",
  "SSE realtime events — run status, task updates, approvals",
  "User auth — signup, login, session tokens",
  "Activity logging — audit trail for all mutations",
  "Cross-entity search — find anything across the platform",
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <nav className="border-b border-[var(--border)] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xl font-semibold tracking-tight">BoringOS</span>
          <div className="flex items-center gap-6 text-sm text-[var(--muted)]">
            <Link href="/docs" className="hover:text-[var(--foreground)] transition-colors">Docs</Link>
            <a href="https://github.com/BoringOS-dev/boringos" className="hover:text-[var(--foreground)] transition-colors">GitHub</a>
            <a href="https://www.npmjs.com/org/boringos" className="hover:text-[var(--foreground)] transition-colors">npm</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold tracking-tight leading-tight mb-6">
            The boring way to build<br />agentic platforms.
          </h1>
          <p className="text-xl text-[var(--muted)] mb-10 max-w-2xl mx-auto">
            Agent execution, workflows, connectors, memory, drive storage, budget enforcement,
            admin API — all handled. You build the product.
          </p>
          <div className="flex items-center justify-center gap-4 mb-16">
            <Link
              href="/docs"
              className="px-6 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
            <code className="px-4 py-3 bg-[var(--code-bg)] text-[var(--code-text)] rounded-lg text-sm font-mono">
              npx create-boringos my-app
            </code>
          </div>

          {/* Code example */}
          <div className="text-left max-w-3xl mx-auto">
            <pre className="bg-[var(--code-bg)] text-[var(--code-text)] rounded-xl p-6 overflow-x-auto text-sm leading-relaxed">
              <code>{codeExample}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Everything you need. Nothing you don&apos;t.</h2>
          <p className="text-center text-[var(--muted)] mb-12 max-w-xl mx-auto">
            14 packages that compose into any agentic product — CRM, support desk, devops automation, personal assistant.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="border border-[var(--border)] rounded-xl p-6">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built-in */}
      <section className="px-6 py-20 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Ships zero-config</h2>
          <p className="text-center text-[var(--muted)] mb-12">
            <code className="text-sm bg-[var(--code-bg)] text-[var(--code-text)] px-2 py-1 rounded">new BoringOS({"{}"}).listen(3000)</code> gives you all of this:
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {builtIn.map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm">
                <span className="text-[var(--success)] mt-0.5">✓</span>
                <span className="text-[var(--muted)]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="px-6 py-20 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">14 packages. Use what you need.</h2>
          <div className="bg-[var(--code-bg)] rounded-xl p-6 text-sm font-mono text-[var(--code-text)] leading-loose">
            <div><span className="text-[var(--muted)]"># Core</span></div>
            <div>npm install @boringos/core</div>
            <div className="mt-4"><span className="text-[var(--muted)]"># Add memory</span></div>
            <div>npm install @boringos/memory</div>
            <div className="mt-4"><span className="text-[var(--muted)]"># Add connectors</span></div>
            <div>npm install @boringos/connector-slack @boringos/connector-google</div>
            <div className="mt-4"><span className="text-[var(--muted)]"># Add production queue</span></div>
            <div>npm install @boringos/pipeline</div>
            <div className="mt-4"><span className="text-[var(--muted)]"># Add headless UI</span></div>
            <div>npm install @boringos/ui</div>
            <div className="mt-4"><span className="text-[var(--muted)]"># Or scaffold everything</span></div>
            <div>npx create-boringos my-app --full</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 border-t border-[var(--border)] text-center">
        <h2 className="text-3xl font-bold mb-4">Start building.</h2>
        <p className="text-[var(--muted)] mb-8">
          From zero to running agent platform in under a minute.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/docs"
            className="px-6 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Read the docs
          </Link>
          <a
            href="https://github.com/BoringOS-dev/boringos"
            className="px-6 py-3 border border-[var(--border)] rounded-lg font-medium text-sm hover:bg-[var(--border)] transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-6 py-8 mt-auto">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-[var(--muted)]">
          <span>BoringOS — MIT License</span>
          <div className="flex gap-6">
            <a href="https://github.com/BoringOS-dev/boringos" className="hover:text-[var(--foreground)]">GitHub</a>
            <a href="https://www.npmjs.com/org/boringos" className="hover:text-[var(--foreground)]">npm</a>
            <Link href="/docs" className="hover:text-[var(--foreground)]">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
