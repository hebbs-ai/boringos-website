"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const mdComponents: Components = {
  h2: ({ children }) => (
    <h3 className="text-lg font-semibold mt-8 mb-3">{children}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="text-base font-semibold mt-6 mb-2">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="text-[var(--muted)] leading-relaxed my-3">{children}</p>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className="text-sm" {...props}>{children}</code>
      );
    }
    return (
      <code className="text-xs bg-[var(--code-bg)] text-[var(--code-text)] px-1.5 py-0.5 rounded" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="bg-[var(--code-bg)] text-[var(--code-text)] rounded-xl p-5 overflow-x-auto text-sm leading-relaxed my-4">
      {children}
    </pre>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-1 my-3 text-[var(--muted)]">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1 my-3 text-[var(--muted)]">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-sm leading-relaxed">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-[var(--foreground)]">{children}</strong>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="text-sm w-full border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b-2 border-[var(--border)]">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="text-left py-2 pr-4 font-semibold text-[var(--foreground)]">{children}</th>
  ),
  td: ({ children }) => (
    <td className="py-2 pr-4 text-[var(--muted)] border-b border-[var(--border)]">{children}</td>
  ),
  a: ({ href, children }) => (
    <a href={href} className="text-[var(--accent)] underline hover:no-underline">{children}</a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-[var(--accent)] pl-4 my-4 text-[var(--muted)] italic">{children}</blockquote>
  ),
  hr: () => <hr className="border-[var(--border)] my-8" />,
};

const sections = [
  {
    id: "getting-started",
    title: "Getting Started",
    content: `## Quick Start

\`\`\`bash
npx create-boringos my-app
cd my-app
npm run dev
\`\`\`

Server starts on **http://localhost:3000** with embedded Postgres. No external dependencies needed.

## Or install manually

\`\`\`bash
npm install @boringos/core
\`\`\`

Create \`index.ts\`:

\`\`\`typescript
import { BoringOS } from "@boringos/core";

const app = new BoringOS({});
const server = await app.listen(3000);
console.log("Running at", server.url);
\`\`\`

Run it:

\`\`\`bash
npx tsx index.ts
\`\`\`

That's it. Embedded Postgres boots, schema created, 6 runtimes registered, admin API + callback API + SSE events — all ready.

## Build Guideline

Read the full **[BUILD_GUIDELINE.md](https://github.com/BoringOS-dev/boringos/blob/main/BUILD_GUIDELINE.md)** for how to structure a BoringOS app — agent definitions, custom context providers, block handlers, seed data, and frontend setup.

**Using an AI coding agent?** Point it at these two files and let it build:

1. **[CLAUDE.md](https://github.com/BoringOS-dev/boringos/blob/main/CLAUDE.md)** — framework overview, all packages, every API endpoint
2. **[BUILD_GUIDELINE.md](https://github.com/BoringOS-dev/boringos/blob/main/BUILD_GUIDELINE.md)** — app structure, how to define agents, workflows, connectors, custom schema

Your AI agent reads the specs, understands the framework, and builds your app. That's the BoringOS way.`,
  },
  {
    id: "core-concepts",
    title: "Core Concepts",
    content: `## Agents

AI agents run as **CLI subprocesses** — Claude Code, Codex, Gemini CLI, Ollama, or any command. The framework never calls LLM APIs directly. CLIs are the agents, BoringOS is the orchestrator.

Each agent has a **role** (engineer, researcher, PM, etc.) that determines its persona — how it thinks, writes, and approaches work.

**Templates:** Create agents from built-in templates with one call:
\`\`\`typescript
await createAgentFromTemplate(db, "engineer", { tenantId, name: "Code Bot" });
\`\`\`

**Teams:** Create full teams with hierarchy pre-wired:
\`\`\`typescript
await createTeam(db, "engineering", { tenantId });
// → CTO + 2 Engineers + QA, all with reportsTo set
\`\`\`

5 built-in teams: engineering, executive, content, sales, support.

**Hierarchy:** Agents have a \`reportsTo\` field. The framework injects org context ("You report to: CTO. Your reports: Engineer 1, Engineer 2."), handles delegation (match task to best report by role), and escalation (blocked → auto-create task for boss).

## Tasks

Work items assigned to agents. Tasks have:
- **Status flow:** backlog → todo → in_progress → in_review → blocked → done/cancelled
- **Auto-identifiers:** \`BOS-001\` (tenant-level) or \`ALPHA-001\` (project-level)
- **Comments:** threaded conversation between humans and agents
- **Work products:** deliverables (PR, deploy, doc, test, file)
- **Labels, attachments, read states, checkout locks**

## Runtimes

The execution backend that spawns a CLI subprocess. 6 built-in:

| Runtime | What it spawns |
|---|---|
| \`claude\` | Claude Code CLI |
| \`chatgpt\` | OpenAI Codex CLI |
| \`gemini\` | Google Gemini CLI |
| \`ollama\` | Local Ollama model |
| \`command\` | Any shell command |
| \`webhook\` | HTTP POST to URL |

## Context Pipeline

Before each run, 12 composable providers build the agent's instructions:

**System instructions** (authoritative, via temp file):
1. Header — agent identity
2. Persona — SOUL.md + AGENTS.md + HEARTBEAT.md
3. Tenant guidelines — company-wide rules
4. Drive skill — file organization rules
5. Memory skill — how to remember/recall
6. Agent instructions — per-agent custom instructions
7. Execution protocol — callback API curl examples

**Context markdown** (task-specific, via stdin):
1. Session handoff or first-run orientation
2. Task details — title, description, identifier
3. Recent comments
4. Memory context — relevant memories
5. Approval details

Add your own: \`app.contextProvider(myProvider)\`

## Memory

Pluggable cognitive memory. Every component ships \`skillMarkdown()\` that teaches agents how to use it — this is the **Code + Knowledge** pattern.

- \`nullMemory\` — default, no-op
- \`createHebbsMemory()\` — hebbs.ai client with remember, recall, prime, forget

## Workflows

DAG-based execution engine:

\`\`\`
Trigger → Fetch Emails → Condition (any new?)
                          ├─ true  → Wake Agent → Process
                          └─ false → Skip (save cost)
\`\`\`

**6 built-in handlers:**
- \`trigger\` — entry point
- \`condition\` — true/false branching
- \`delay\` — wait N milliseconds
- \`transform\` — map/reshape data
- \`wake-agent\` — wake an agent from within a workflow (enables "smart routines")
- \`connector-action\` — call any connector action (e.g., \`list_emails\`, \`list_events\`) with auto credential lookup

Add custom handlers with \`app.blockHandler()\`.

**Workflow-triggered routines:** Instead of waking an expensive agent on every cron tick, target a workflow that runs cheap checks first and only wakes the agent when needed.

## Connectors

External service integrations with a clean SDK:
- **OAuth** handled by the framework
- **Events** typed and routed via EventBus
- **Actions** invocable by agents via callback API
- **Skill files** teach agents how to use each connector
- **Test harness** for testing without real credentials`,
  },
  {
    id: "builder-api",
    title: "Builder API",
    content: `The \`BoringOS\` class uses a builder pattern — chain methods to configure, then \`.listen()\` to start:

\`\`\`typescript
import { BoringOS, createHebbsMemory } from "@boringos/core";
import { slack } from "@boringos/connector-slack";
import { google } from "@boringos/connector-google";
import { createBullMQQueue } from "@boringos/pipeline";

const app = new BoringOS({
  database: { url: "postgres://..." },      // or omit for embedded
  drive: { root: "./data/drive" },           // or omit for default
  auth: { secret: "...", adminKey: "..." },  // JWT + API key auth
});

// Memory — cognitive recall for agents
app.memory(createHebbsMemory({
  endpoint: "https://api.hebbs.ai",
  apiKey: "...",
}));

// Connectors — external service integrations
app.connector(slack({ signingSecret: "..." }));
app.connector(google({ clientId: "...", clientSecret: "..." }));

// Queue — BullMQ for production (in-process by default)
app.queue(createBullMQQueue({ redis: "redis://..." }));

// Plugins — extensible jobs + webhooks
app.plugin(githubPlugin);

// Custom context provider
app.contextProvider({
  name: "company-knowledge",
  phase: "system",
  priority: 25,
  async provide(event) {
    return "## Company Knowledge\\n\\nOur coding standards...";
  },
});

// Custom schema — your own tables alongside framework tables
app.schema(\`
  CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    name TEXT NOT NULL,
    email TEXT
  )
\`);

// Event-to-inbox routing
app.routeToInbox({
  filter: (e) => e.type === "email_received",
  transform: (e) => ({
    source: "gmail",
    subject: e.data.subject,
    from: e.data.from,
  }),
});

// Lifecycle hooks
app.beforeStart(async (ctx) => { /* runs before server starts */ });
app.afterStart(async (ctx) => { /* runs after server starts */ });

// Custom Hono routes
app.route("/api/crm", crmRoutes);

// Start
const server = await app.listen(3000);
\`\`\`

## All builder methods

| Method | Description |
|---|---|
| \`.memory(provider)\` | Set memory provider |
| \`.connector(definition)\` | Register connector |
| \`.runtime(module)\` | Register additional runtime |
| \`.queue(adapter)\` | Set job queue (default: in-process) |
| \`.plugin(definition)\` | Register plugin |
| \`.contextProvider(provider)\` | Add custom context provider |
| \`.blockHandler(handler)\` | Add workflow block handler |
| \`.persona(role, bundle)\` | Register custom persona |
| \`.schema(ddl)\` | Add custom database tables |
| \`.routeToInbox(config)\` | Route events to inbox |
| \`.route(path, app)\` | Mount custom Hono routes |
| \`.beforeStart(fn)\` | Pre-boot lifecycle hook |
| \`.afterStart(fn)\` | Post-boot lifecycle hook |
| \`.beforeShutdown(fn)\` | Shutdown lifecycle hook |
| \`.listen(port?)\` | Boot and start HTTP server |`,
  },
  {
    id: "packages",
    title: "Packages",
    content: `All packages are independently installable from npm. Use what you need.

| Package | Description |
|---|---|
| \`@boringos/core\` | Application host — BoringOS class, builder API, HTTP server |
| \`@boringos/agent\` | Execution engine — context pipeline, wakeups, personas, budget |
| \`@boringos/runtime\` | 6 runtime modules + registry + subprocess spawning |
| \`@boringos/memory\` | MemoryProvider interface + hebbs.ai provider + null provider |
| \`@boringos/drive\` | StorageBackend + DriveManager with file indexing + memory sync |
| \`@boringos/db\` | Drizzle schema + embedded Postgres + migration manager |
| \`@boringos/workflow\` | DAG workflow engine + 6 block handlers (incl. wake-agent, connector-action) |
| \`@boringos/pipeline\` | QueueAdapter — in-process (default) or BullMQ |
| \`@boringos/connector\` | Connector SDK — OAuth, events, actions, test harness |
| \`@boringos/connector-slack\` | Slack — messages, threads, reactions |
| \`@boringos/connector-google\` | Google Workspace — Gmail + Calendar |
| \`@boringos/ui\` | Typed API client + headless React hooks |
| \`@boringos/shared\` | Base types, constants, Hook utility |
| \`create-boringos\` | CLI generator — scaffold new projects |

## Install

\`\`\`bash
# Just the core
npm install @boringos/core

# Full stack
npm install @boringos/core @boringos/memory @boringos/connector-slack @boringos/connector-google @boringos/pipeline @boringos/ui

# Or scaffold a complete project
npx create-boringos my-app --full
\`\`\``,
  },
  {
    id: "admin-api",
    title: "Admin API",
    content: `All endpoints at \`/api/admin/*\`. Authenticated via \`X-API-Key\` header or session token (\`Authorization: Bearer\`). Requires \`X-Tenant-Id\` header when using API key auth.

## Agents

| Method | Endpoint | Description |
|---|---|---|
| GET | \`/agents\` | List agents |
| POST | \`/agents\` | Create agent |
| GET | \`/agents/:id\` | Get agent |
| PATCH | \`/agents/:id\` | Update agent |
| POST | \`/agents/:id/wake\` | Wake agent |
| GET | \`/agents/:id/runs\` | Agent run history |

## Tasks

| Method | Endpoint | Description |
|---|---|---|
| GET | \`/tasks\` | List tasks (filter by status, assignee) |
| POST | \`/tasks\` | Create task (auto-generates identifier) |
| GET | \`/tasks/:id\` | Get task + comments + work products |
| PATCH | \`/tasks/:id\` | Update task |
| DELETE | \`/tasks/:id\` | Delete task |
| POST | \`/tasks/:id/comments\` | Post comment |
| POST | \`/tasks/:id/assign\` | Assign to agent + optionally wake |

## Runs

| Method | Endpoint | Description |
|---|---|---|
| GET | \`/runs\` | List runs (filter by agent, status) |
| GET | \`/runs/:id\` | Get run detail |
| POST | \`/runs/:id/cancel\` | Cancel run |

## Runtimes

| Method | Endpoint | Description |
|---|---|---|
| GET | \`/runtimes\` | List runtimes |
| POST | \`/runtimes\` | Create runtime |
| PATCH | \`/runtimes/:id\` | Update runtime |
| DELETE | \`/runtimes/:id\` | Delete runtime |
| POST | \`/runtimes/:id/default\` | Set as default |

## Approvals

| Method | Endpoint | Description |
|---|---|---|
| GET | \`/approvals\` | List pending approvals |
| GET | \`/approvals/:id\` | Get approval |
| POST | \`/approvals/:id/approve\` | Approve (with optional note) |
| POST | \`/approvals/:id/reject\` | Reject (with reason) |

## Other endpoints

- **Projects:** \`GET/POST /projects\`, \`GET/PATCH /projects/:id\`
- **Goals:** \`GET/POST /goals\`, \`PATCH /goals/:id\`
- **Labels:** \`GET/POST /labels\`, \`POST/DELETE /tasks/:id/labels/:labelId\`
- **Budgets:** \`GET/POST /budgets\`, \`DELETE /budgets/:id\`, \`GET /budgets/incidents\`
- **Routines:** \`GET/POST /routines\` (supports \`assigneeAgentId\` OR \`workflowId\`), \`PATCH/DELETE /routines/:id\`, \`POST /routines/:id/trigger\`
- **Evals:** \`GET/POST /evals\`, \`POST /evals/:id/run\`, \`GET /evals/:id/runs\`
- **Inbox:** \`GET /inbox\`, \`GET /inbox/:id\`, \`POST /inbox/:id/archive\`, \`POST /inbox/:id/create-task\`
- **Drive:** \`GET /drive/list\`, \`GET/PATCH /drive/skill\`, \`GET /drive/skill/revisions\`
- **Plugins:** \`GET /plugins\`, \`GET /plugins/:name/jobs\`, \`POST /plugins/:name/jobs/:job/trigger\`
- **Search:** \`GET /search?q=query\`
- **Activity:** \`GET /activity\`
- **Onboarding:** \`GET /onboarding\`, \`POST /onboarding/complete-step\`
- **Entities:** \`POST /entities/link\`, \`GET /entities/:type/:id/refs\`
- **Costs:** \`GET /costs\`

## SSE Events

\`\`\`
GET /api/events?apiKey=...&tenantId=...
\`\`\`

Event types: \`run:started\`, \`run:completed\`, \`run:failed\`, \`task:created\`, \`task:updated\`, \`task:comment_added\`, \`agent:created\`, \`approval:decided\``,
  },
  {
    id: "auth",
    title: "Authentication",
    content: `## User auth

**Signup:**
\`\`\`bash
curl -X POST /api/auth/signup \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Alice", "email": "alice@acme.com", "password": "...", "tenantId": "..."}'
\`\`\`

Returns \`{ userId, token }\`. The token is a session token valid for 30 days.

**Login:**
\`\`\`bash
curl -X POST /api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "alice@acme.com", "password": "..."}'
\`\`\`

Returns \`{ userId, token, name, email }\`.

**Current user:**
\`\`\`bash
curl /api/auth/me -H "Authorization: Bearer <token>"
\`\`\`

## Admin API auth

The admin API accepts both methods:

1. **API key** — \`X-API-Key: your-admin-key\` + \`X-Tenant-Id: tenant-uuid\`
2. **Session token** — \`Authorization: Bearer <token>\` (tenant resolved from session)

## Agent callback auth

Agent subprocesses receive a **signed JWT** (4-hour expiry, HMAC-SHA256) via the \`BORINGOS_CALLBACK_TOKEN\` env var. The callback API verifies the signature and extracts agent/tenant claims.

## Device auth (CLI login)

For CLI tools (like a future \`boringos\` CLI):

1. CLI calls \`POST /api/auth/device/code\` → gets \`deviceCode\` + \`userCode\`
2. User opens verification URL in browser, approves with the \`userCode\`
3. CLI polls \`POST /api/auth/device/poll\` with \`deviceCode\` → gets session token

Challenges expire after 15 minutes.`,
  },
  {
    id: "ui-hooks",
    title: "UI Hooks",
    content: `\`@boringos/ui\` provides a typed API client + headless React hooks. No markup, no styles — just data and mutations.

## Setup

\`\`\`typescript
import { BoringOSProvider, createBoringOSClient } from "@boringos/ui";

const client = createBoringOSClient({
  url: "http://localhost:3000",
  apiKey: "your-admin-key",
  tenantId: "your-tenant-id",
});

function App() {
  return (
    <BoringOSProvider client={client}>
      <YourDashboard />
    </BoringOSProvider>
  );
}
\`\`\`

## Available hooks

| Hook | Returns | Mutations |
|---|---|---|
| \`useAgents()\` | agents list | \`createAgent\`, \`wakeAgent\` |
| \`useTasks(filters?)\` | tasks list | \`createTask\` |
| \`useTask(taskId)\` | task + comments | \`updateTask\`, \`postComment\`, \`assignTask\`, \`addWorkProduct\` |
| \`useRuns(filters?)\` | runs list (polls 5s) | \`cancelRun\` |
| \`useRuntimes()\` | runtimes list | \`createRuntime\`, \`setDefault\` |
| \`useApprovals(status?)\` | approvals list | \`approve\`, \`reject\` |
| \`useConnectors()\` | connectors list | \`invokeAction\` |
| \`useProjects()\` | projects list | — |
| \`useGoals()\` | goals list | — |
| \`useOnboarding()\` | onboarding state | — |
| \`useEvals()\` | evals list | — |
| \`useInbox(status?)\` | inbox items | — |
| \`useEntityRefs(type, id)\` | linked entities | — |
| \`useSearch(query)\` | search results | — |
| \`useHealth()\` | server status (polls 30s) | — |

## Example

\`\`\`tsx
import { useAgents, useTask } from "@boringos/ui";

function AgentList() {
  const { agents, isLoading, createAgent } = useAgents();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {agents.map(agent => (
        <div key={agent.id}>{agent.name} — {agent.role}</div>
      ))}
      <button onClick={() => createAgent({ name: "New Bot", role: "engineer" })}>
        Add Agent
      </button>
    </div>
  );
}

function TaskDetail({ taskId }: { taskId: string }) {
  const { task, comments, updateTask, postComment } = useTask(taskId);

  return (
    <div>
      <h2>{task?.title}</h2>
      <select
        value={task?.status}
        onChange={(e) => updateTask({ status: e.target.value })}
      >
        <option value="todo">Todo</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>
      {comments.map(c => <p key={c.id}>{c.body}</p>)}
    </div>
  );
}
\`\`\`

## Realtime

Subscribe to SSE events:

\`\`\`typescript
const unsubscribe = client.subscribe((event) => {
  console.log(event.type, event.data);
  // "run:started", "task:created", "approval:decided", etc.
});

// Later:
unsubscribe();
\`\`\``,
  },
];

export default function DocsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <nav className="border-b border-[var(--border)] px-6 py-4 sticky top-0 bg-[var(--background)] z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight">BoringOS</Link>
          <div className="flex items-center gap-6 text-sm text-[var(--muted)]">
            <span className="text-[var(--foreground)] font-medium">Docs</span>
            <a href="https://github.com/BoringOS-dev/boringos" className="hover:text-[var(--foreground)] transition-colors">GitHub</a>
            <a href="https://www.npmjs.com/org/boringos" className="hover:text-[var(--foreground)] transition-colors">npm</a>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 max-w-6xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 border-r border-[var(--border)] py-8 pr-6 hidden md:block">
          <nav className="sticky top-20 space-y-1">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors py-1.5 px-2 rounded hover:bg-[var(--border)]"
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 py-8 px-8 max-w-3xl min-w-0">
          <h1 className="text-4xl font-bold mb-2">Documentation</h1>
          <p className="text-[var(--muted)] mb-10">Everything you need to build with BoringOS.</p>

          {sections.map((s) => (
            <section key={s.id} id={s.id} className="mb-20 scroll-mt-20">
              <h2 className="text-2xl font-bold mb-6 pb-3 border-b border-[var(--border)]">{s.title}</h2>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                {s.content}
              </ReactMarkdown>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
