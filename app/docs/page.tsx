import Link from "next/link";

const sections = [
  {
    title: "Getting Started",
    content: `## Quick Start

\`\`\`bash
npx create-boringos my-app
cd my-app
npm run dev
\`\`\`

Server starts on http://localhost:3000 with embedded Postgres. No external dependencies.

## Or from scratch

\`\`\`bash
npm install @boringos/core
\`\`\`

\`\`\`typescript
import { BoringOS } from "@boringos/core";

const app = new BoringOS({});
const server = await app.listen(3000);
\`\`\`

That's it. Embedded Postgres boots, schema created, 6 runtimes registered, admin API ready.`,
  },
  {
    title: "Core Concepts",
    content: `## Agents
AI agents run as CLI subprocesses (Claude Code, Codex, Gemini CLI, Ollama, or any command). The framework never calls LLM APIs directly — CLIs are the agents, BoringOS is the orchestrator.

## Tasks
Work items assigned to agents. Tasks have status, priority, comments, work products, labels, and auto-generated identifiers (ALPHA-001).

## Runtimes
The execution backend — spawns a CLI subprocess and streams output. 6 built-in: claude, chatgpt, gemini, ollama, command, webhook.

## Context Pipeline
12 composable providers build system instructions + task context for each agent run. Add your own with \`app.contextProvider(myProvider)\`.

## Memory
Pluggable cognitive memory. Agents remember findings, recall past work, and learn across runs. Every component ships \`skillMarkdown()\` that teaches agents how to use it.

## Workflows
DAG-based execution engine. Trigger → condition → agent task → approval → complete. Block handlers for branching, delays, and transforms.

## Connectors
External service integrations. OAuth handled. Events typed. Actions invocable by agents. SDK makes building new connectors straightforward.`,
  },
  {
    title: "Builder API",
    content: `\`\`\`typescript
import { BoringOS, createHebbsMemory } from "@boringos/core";
import { slack } from "@boringos/connector-slack";
import { google } from "@boringos/connector-google";
import { createBullMQQueue } from "@boringos/pipeline";

const app = new BoringOS({
  database: { url: "postgres://..." },    // or omit for embedded
  drive: { root: "./data/drive" },         // or omit for default
  auth: { secret: "...", adminKey: "..." },
});

// Memory
app.memory(createHebbsMemory({ endpoint: "...", apiKey: "..." }));

// Connectors
app.connector(slack({ signingSecret: "..." }));
app.connector(google({ clientId: "...", clientSecret: "..." }));

// Production queue (optional — in-process by default)
app.queue(createBullMQQueue({ redis: "redis://..." }));

// Custom context provider
app.contextProvider({
  name: "company-knowledge",
  phase: "system",
  priority: 25,
  async provide(event) {
    return "## Company Knowledge\\n\\nOur coding standards...";
  },
});

// Custom schema (your own tables)
app.schema(\`
  CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    name TEXT NOT NULL,
    email TEXT
  )
\`);

// Lifecycle hooks
app.beforeStart(async (ctx) => { console.log("Booting..."); });
app.afterStart(async (ctx) => { console.log("Ready!"); });

// Start
const server = await app.listen(3000);
\`\`\``,
  },
  {
    title: "Packages",
    content: `| Package | Description |
|---|---|
| \`@boringos/core\` | Application host — BoringOS class, builder API, HTTP server |
| \`@boringos/agent\` | Execution engine — context pipeline, wakeups, personas, budget |
| \`@boringos/runtime\` | 6 runtime modules + registry + subprocess spawning |
| \`@boringos/memory\` | MemoryProvider interface + Hebbs + null provider |
| \`@boringos/drive\` | StorageBackend + DriveManager with file indexing + memory sync |
| \`@boringos/db\` | Drizzle schema + embedded Postgres + migrations |
| \`@boringos/workflow\` | DAG workflow engine + block handlers |
| \`@boringos/pipeline\` | QueueAdapter — in-process or BullMQ |
| \`@boringos/connector\` | Connector SDK — OAuth, events, actions, test harness |
| \`@boringos/connector-slack\` | Slack — messages, threads, reactions |
| \`@boringos/connector-google\` | Google Workspace — Gmail + Calendar |
| \`@boringos/ui\` | Typed API client + headless React hooks |
| \`create-boringos\` | CLI generator — scaffold new projects |
| \`@boringos/shared\` | Base types, constants, utilities |`,
  },
  {
    title: "Admin API",
    content: `All endpoints at \`/api/admin/*\`, authenticated via \`X-API-Key\` header or session token.

**Agents:** \`GET/POST /agents\`, \`GET/PATCH /agents/:id\`, \`POST /agents/:id/wake\`

**Tasks:** \`GET/POST /tasks\`, \`GET/PATCH/DELETE /tasks/:id\`, \`POST /tasks/:id/comments\`, \`POST /tasks/:id/assign\`

**Runs:** \`GET /runs\`, \`GET /runs/:id\`, \`POST /runs/:id/cancel\`

**Runtimes:** \`GET/POST /runtimes\`, \`PATCH/DELETE /runtimes/:id\`, \`POST /runtimes/:id/default\`

**Approvals:** \`GET /approvals\`, \`POST /approvals/:id/approve\`, \`POST /approvals/:id/reject\`

**Workflows:** via workflow engine API

**Projects:** \`GET/POST /projects\`, \`GET/PATCH /projects/:id\`

**Goals:** \`GET/POST /goals\`, \`PATCH /goals/:id\`

**Budgets:** \`GET/POST /budgets\`, \`DELETE /budgets/:id\`, \`GET /budgets/incidents\`

**Routines:** \`GET/POST /routines\`, \`PATCH/DELETE /routines/:id\`, \`POST /routines/:id/trigger\`

**Plugins:** \`GET /plugins\`, \`GET /plugins/:name/jobs\`, \`POST /plugins/:name/jobs/:job/trigger\`

**Search:** \`GET /search?q=query\`

**SSE Events:** \`GET /api/events?apiKey=...&tenantId=...\``,
  },
  {
    title: "Auth",
    content: `**Signup:** \`POST /api/auth/signup\` — \`{ name, email, password, tenantId? }\`

**Login:** \`POST /api/auth/login\` — \`{ email, password }\` → returns session token

**Current user:** \`GET /api/auth/me\` — Bearer token in Authorization header

**Device auth (CLI):** \`POST /api/auth/device/code\` → \`POST /api/auth/device/poll\`

The admin API accepts both API key (\`X-API-Key\`) and session token (\`Authorization: Bearer\`).`,
  },
];

export default function DocsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <nav className="border-b border-[var(--border)] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight">BoringOS</Link>
          <div className="flex items-center gap-6 text-sm text-[var(--muted)]">
            <span className="text-[var(--foreground)]">Docs</span>
            <a href="https://github.com/BoringOS-dev/boringos" className="hover:text-[var(--foreground)] transition-colors">GitHub</a>
            <a href="https://www.npmjs.com/org/boringos" className="hover:text-[var(--foreground)] transition-colors">npm</a>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 max-w-6xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 border-r border-[var(--border)] py-8 pr-6 hidden md:block">
          <nav className="sticky top-8 space-y-2">
            {sections.map((s) => (
              <a
                key={s.title}
                href={`#${s.title.toLowerCase().replace(/\s+/g, "-")}`}
                className="block text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors py-1"
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 py-8 px-8 max-w-3xl">
          <h1 className="text-4xl font-bold mb-8">Documentation</h1>

          {sections.map((s) => (
            <section key={s.title} id={s.title.toLowerCase().replace(/\s+/g, "-")} className="mb-16">
              <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-[var(--border)]">{s.title}</h2>
              <div className="prose prose-sm max-w-none">
                {s.content.split("\n\n").map((block, i) => {
                  if (block.startsWith("```")) {
                    const lines = block.split("\n");
                    const lang = lines[0].replace("```", "");
                    const code = lines.slice(1, -1).join("\n");
                    return (
                      <pre key={i} className="bg-[var(--code-bg)] text-[var(--code-text)] rounded-xl p-4 overflow-x-auto text-sm leading-relaxed my-4">
                        <code>{code}</code>
                      </pre>
                    );
                  }
                  if (block.startsWith("##")) {
                    return <h3 key={i} className="text-lg font-semibold mt-8 mb-3">{block.replace(/^#+\s/, "")}</h3>;
                  }
                  if (block.startsWith("|")) {
                    const rows = block.split("\n").filter(r => !r.startsWith("|--"));
                    const headers = rows[0].split("|").filter(Boolean).map(h => h.trim());
                    const data = rows.slice(1).map(r => r.split("|").filter(Boolean).map(c => c.trim()));
                    return (
                      <div key={i} className="overflow-x-auto my-4">
                        <table className="text-sm w-full">
                          <thead>
                            <tr className="border-b border-[var(--border)]">
                              {headers.map(h => <th key={h} className="text-left py-2 pr-4 font-semibold">{h}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {data.map((row, ri) => (
                              <tr key={ri} className="border-b border-[var(--border)]">
                                {row.map((cell, ci) => (
                                  <td key={ci} className="py-2 pr-4 text-[var(--muted)]">
                                    <code className="text-xs bg-[var(--code-bg)] text-[var(--code-text)] px-1 py-0.5 rounded">{cell.replace(/`/g, "")}</code>
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }
                  return <p key={i} className="text-[var(--muted)] leading-relaxed my-3">{block}</p>;
                })}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
