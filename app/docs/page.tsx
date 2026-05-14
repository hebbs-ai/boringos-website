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

DAG-based execution engine. The framework ships the engine, persistence, lifecycle event stream, replay, pause/resume, and cross-workflow composition. Your app builds the visual editor, canvas, and run-diff UI on top — see the BoringOS CRM for a reference implementation (\`packages/web/src/components/WorkflowCanvas.tsx\`, \`BlockPalette\`, \`BlockConfigForm\`, \`RunDiffView\`).

\`\`\`
Trigger → Fetch Emails → Condition (any new?)
                          ├─ true  → Wake Agent → Process
                          └─ false → Skip (save cost)
\`\`\`

**14 built-in handlers:**

*Triggers / control flow:*
- \`trigger\` — entry point. Set \`config.eventType: "<event.type>"\` to subscribe to connector events; the framework auto-executes any active workflow whose trigger matches an incoming event.
- \`condition\` — true/false branching with \`equals\`/\`not_equals\`/\`contains\`/\`truthy\` operators.
- \`for-each\` — iterate over arrays from upstream blocks.
- \`delay\` — wait N milliseconds.
- \`transform\` — map/reshape data via template strings.

*Connectors:*
- \`connector-action\` — call any connector action (e.g., \`list_emails\`, \`list_events\`) with auto credential lookup.
- \`create-inbox-item\` — store data in inbox (single or batch, supports \`assigneeUserId\`). Emits \`inbox.item_created\`.
- \`emit-event\` — emit connector events so \`routeToInbox()\` and listeners can catch them.

*Database (tenant-isolated):*
- \`query-database\` — read rows from a tenant-scoped table.
- \`update-row\` — update rows in a tenant-scoped table (requires a where clause). WHERE supports equality, IN, NULL, and operator objects: \`{ col: { op: "like" | "ilike" | "ne", value } }\`.
- \`create-task\` — create a framework task with assignee, priority, originKind, proposedParams. Set \`dedup: true\` (with originKind+originId) to skip insert when an open task with the same origin already exists — useful for event-driven workflows that fire repeatedly.

*Agents & humans:*
- \`wake-agent\` — wake an agent from within a workflow (enables "smart routines"). Accepts \`agentId\` *or* \`agentRole\` — the role form resolves at runtime to the first matching agent in the tenant, so workflows seeded by a framework app stay portable across tenants.
- \`wait-for-human\` — pause the workflow and create an Actions-queue card. The run resumes when a user approves the card; the workflow continues with the user's input merged into the paused block's output.

*Composition:*
- \`invoke-workflow\` — run another workflow as a sub-routine. The child's block outputs are merged into this block's output so downstream blocks can reference them. Self-recursion is rejected.

Add custom handlers with \`app.blockHandler()\`.

## Run lifecycle

Every \`engine.execute(workflowId, trigger?, opts?)\` call persists a \`workflow_run\` row plus one \`workflow_block_run\` per block. Pass \`opts.background = true\` so HTTP callers can return the runId immediately and the DAG walks asynchronously — the SSE stream below picks up live transitions.

The engine emits 9 lifecycle events per run: \`run_started\`, \`run_completed\`, \`run_failed\`, \`run_paused\`, plus \`block_started\` / \`block_completed\` / \`block_failed\` / \`block_waiting\` / \`block_skipped\`. They flow into the RealtimeBus as \`workflow:*\` events and out to the UI through the per-run SSE endpoint.

## Pause / resume

Any \`wait-for-human\` block transitions the run to \`waiting_for_human\` and pins it to an Actions-queue task. When the user approves, call \`engine.resume(runId, { userInput })\` (or the \`POST /workflow-runs/:id/resume\` endpoint). The engine reloads the persisted execution state, finalizes the paused block with the merged output, and continues the DAG walk from there.

## Workflow-triggered routines

Instead of waking an expensive agent on every cron tick, target a workflow that runs cheap checks first and only wakes the agent when needed.

## Syncing External Data (Pattern A)

The recommended pattern for syncing emails, Slack messages, calendar events, etc.:

\`\`\`
Routine (every 15min) → Workflow:
  1. connector-action(list_emails)    → fetch from Gmail (auto-enriched)
  2. for-each({{fetch.messages}})      → iterate results
  3. create-inbox-item(source:"gmail") → store in inbox with subject, from, snippet
  4. condition(count > 0?)             → any new?
  5. wake-agent(triage-agent)          → process from inbox
\`\`\`

Emails are **stored in inbox before the agent runs**. Users see them in the dashboard immediately. Agent works from inbox, not Gmail directly. If agent fails, data is still saved.

**Gmail auto-enrichment:** The \`list_emails\` action automatically fetches subject, from, snippet, and date for each message — not just IDs. No extra \`read_email\` step needed for basic sync.

Works for any connector: Slack (\`list_messages\`), Calendar (\`list_events\`), GitHub (\`list_issues\`).

## Connectors

External service integrations with a clean SDK:
- **OAuth** handled by the framework
- **Events** typed and routed via EventBus
- **Actions** invocable by agents via callback API
- **Skill files** teach agents how to use each connector
- **Test harness** for testing without real credentials

## Event-Driven Architecture

BoringOS is event-driven, not just routine-driven. Connectors emit events, workflow handlers emit events, and app routes can emit events. Agents wake reactively.

**Subscribe** with \`app.onEvent(type, handler)\`:

\`\`\`typescript
app.onEvent("inbox.item_created", async (event) => {
  // event: { connectorKind, type, tenantId, data, timestamp }
  // Wake an agent to process the new inbox item
  await agentEngine.wake({ agentId, tenantId: event.tenantId,
    reason: "connector_event", payload: event.data });
});
\`\`\`

**Emit** from routes via \`AppContext.eventBus\`:

\`\`\`typescript
ctx.eventBus.emit({
  connectorKind: "app", type: "entity.created",
  tenantId, data: { entityType: "contact", entityId: id },
  timestamp: new Date(),
});
\`\`\`

**Built-in events:** \`inbox.item_created\` (from \`create-inbox-item\` handler, data: \`{ itemId, source }\`)

**The reactive pattern:**
\`\`\`
Ingest workflow -> create-inbox-item -> inbox.item_created event
                                              |
                               app.onEvent("inbox.item_created", ...)
                                              |
                                    Wake triage / enrichment agent
\`\`\`

Events fire immediately when data arrives — zero latency, zero wasted agent runs. Multiple subscribers can react to the same event.

**Declarative subscription via workflows:** any active workflow whose entry trigger has \`config.eventType\` matching an incoming event auto-executes — no \`app.onEvent()\` call needed:

\`\`\`typescript
blocks: [
  { id: "trigger", type: "trigger", config: { eventType: "inbox.item_created" } },
  { id: "wake",    type: "wake-agent", config: { agentId: triageAgentId } },
]
\`\`\`

The framework's event-dispatch listener queries all active workflows in the event's tenant and fires every match in a microtask, so a slow workflow can't block the bus.`,
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

// Queue — in-process default. Set parallelism via BoringOS config:
//   new BoringOS({ queue: { concurrency: 4 } })
// For production, swap in BullMQ:
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
    assigneeUserId: e.data.assignTo, // optional — route to a specific user
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
| \`.onEvent(type, handler)\` | Subscribe to EventBus events (e.g., \`inbox.item_created\`) |
| \`.routeToInbox(config)\` | Route events to inbox |
| \`.route(path, app)\` | Mount custom Hono routes |
| \`.onTenantCreated(fn)\` | Hook for app-specific tenant setup (runtimes + copilot already provisioned) |
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
| \`@boringos/workflow\` | DAG workflow engine + 14 block handlers (trigger/condition/for-each/delay/transform, connector-action/create-inbox-item/emit-event, query-database/update-row/create-task, wake-agent/wait-for-human, invoke-workflow). Persisted runs, pause/resume, background mode, lifecycle event sink. |
| \`@boringos/workflow-ui\` | React components for workflows — \`WorkflowCanvas\` (xyflow + dagre auto-layout), \`BlockPalette\`, \`BlockConfigForm\`, \`RunDiffView\`, plus SSE-driven hooks (\`useWorkflow\`, \`useWorkflowRun\`). Drop-in companion to @boringos/workflow. |
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
| PATCH | \`/agents/:id\` | Update agent (set \`status: "paused"\` to pause) |
| POST | \`/agents/:id/wake\` | Wake agent |
| GET | \`/agents/:id/runs\` | Agent run history |

## Tasks

| Method | Endpoint | Description |
|---|---|---|
| GET | \`/tasks\` | List tasks (filter by \`status\`, \`assigneeAgentId\`, \`assigneeUserId\`) |
| POST | \`/tasks\` | Create task (auto-generates identifier, defaults \`assigneeUserId\` to current user) |
| GET | \`/tasks/:id\` | Get task + comments + work products + runs + costSummary |
| PATCH | \`/tasks/:id\` | Update task (supports \`assigneeUserId\`) |
| DELETE | \`/tasks/:id\` | Delete task |
| POST | \`/tasks/:id/comments\` | Post comment |
| POST | \`/tasks/:id/assign\` | Assign to agent + optionally wake |

**User assignment:** Tasks have both \`assigneeAgentId\` (for agent tasks) and \`assigneeUserId\` (for human tasks). When a user creates a task via session auth, \`assigneeUserId\` defaults to them. Pass \`?assigneeUserId=me\` to filter by the current session user.

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
| PATCH | \`/runtimes/:id\` | Update runtime (auto-syncs \`model\` and \`config.model\`) |
| DELETE | \`/runtimes/:id\` | Delete runtime |
| POST | \`/runtimes/:id/default\` | Set as default |
| GET | \`/runtimes/:id/models\` | List available models for this runtime type |

## Approvals

| Method | Endpoint | Description |
|---|---|---|
| GET | \`/approvals\` | List pending approvals |
| GET | \`/approvals/:id\` | Get approval |
| POST | \`/approvals/:id/approve\` | Approve (with optional note) |
| POST | \`/approvals/:id/reject\` | Reject (with reason) |

## Workflows

| Method | Endpoint | Description |
|---|---|---|
| GET | \`/workflows\` | List workflows |
| POST | \`/workflows\` | Create workflow |
| GET | \`/workflows/:id\` | Get workflow |
| PATCH | \`/workflows/:id\` | Update name / blocks / edges / status / governingAgentId |
| DELETE | \`/workflows/:id\` | Delete workflow |
| POST | \`/workflows/:id/execute\` | Execute now (background mode — returns runId immediately, DAG walks asynchronously) |
| GET | \`/workflows/:id/runs\` | Recent runs scoped to this workflow |

## Workflow runs

| Method | Endpoint | Description |
|---|---|---|
| GET | \`/workflow-runs\` | List runs (cross-workflow) |
| GET | \`/workflow-runs/:id\` | Run detail with all block runs |
| POST | \`/workflow-runs/:id/resume\` | Resume a paused run with \`{ userInput }\` (used by the Actions queue) |
| POST | \`/workflow-runs/:id/replay\` | Re-execute against the current workflow definition using the original trigger payload |
| GET | \`/workflow-runs/:id/events\` | SSE stream of \`workflow:*\` lifecycle events scoped to one run. Accepts session token via \`?token=\` because EventSource can't set Authorization. |

## Other endpoints

- **Projects:** \`GET/POST /projects\`, \`GET/PATCH /projects/:id\`
- **Goals:** \`GET/POST /goals\`, \`PATCH /goals/:id\`
- **Labels:** \`GET/POST /labels\`, \`POST/DELETE /tasks/:id/labels/:labelId\`
- **Budgets:** \`GET/POST /budgets\`, \`DELETE /budgets/:id\`, \`GET /budgets/incidents\`
- **Routines:** \`GET/POST /routines\` (supports \`assigneeAgentId\` OR \`workflowId\`), \`PATCH/DELETE /routines/:id\`, \`POST /routines/:id/trigger\`
- **Evals:** \`GET/POST /evals\`, \`POST /evals/:id/run\`, \`GET /evals/:id/runs\`
- **Inbox:** \`GET /inbox\` (filter by \`status\`, \`assigneeUserId\`, supports \`=me\`), \`GET /inbox/:id\`, \`PATCH /inbox/:id\` (update metadata, status, assigneeUserId — agents write analysis results back), \`POST /inbox/:id/archive\`, \`POST /inbox/:id/create-task\` (defaults \`assigneeUserId\` to current user)
- **Drive:** \`GET /drive/list\`, \`GET/PATCH /drive/skill\`, \`GET /drive/skill/revisions\`
- **Plugins:** \`GET /plugins\`, \`GET /plugins/:name/jobs\`, \`POST /plugins/:name/jobs/:job/trigger\`
- **Search:** \`GET /search?q=query\`
- **Activity:** \`GET /activity\`
- **Onboarding:** \`GET /onboarding\`, \`POST /onboarding/complete-step\`
- **Entities:** \`POST /entities/link\`, \`GET /entities/:type/:id/refs\`
- **Settings:** \`GET /settings\` (returns key-value tenant settings), \`PATCH /settings\` (upsert settings, e.g. \`{"agents_paused": "true"}\` for global agent kill switch)
- **Costs:** \`GET /costs\`

## SSE Events

\`\`\`
GET /api/events?apiKey=...&tenantId=...
\`\`\`

Event types: \`run:started\`, \`run:completed\`, \`run:failed\`, \`task:created\`, \`task:updated\`, \`task:comment_added\`, \`agent:created\`, \`approval:decided\`, plus per-run workflow events \`workflow:run_started\`, \`workflow:run_completed\`, \`workflow:run_failed\`, \`workflow:run_paused\`, \`workflow:block_started\`, \`workflow:block_completed\`, \`workflow:block_failed\`, \`workflow:block_waiting\`, \`workflow:block_skipped\`. The per-run \`/workflow-runs/:id/events\` stream filters to the events for one run.

## Agent Pause

Two levels: **global** (set \`agents_paused: "true"\` via \`PATCH /settings\`) and **per-agent** (set \`status: "paused"\` via \`PATCH /agents/:id\`). Paused runs get status \`"skipped"\` with \`errorCode\` indicating the reason. Run statuses: \`queued\`, \`running\`, \`done\`, \`failed\`, \`cancelled\`, \`skipped\`.

### Pause behavior
- Already-running agents are **not** killed — they finish their current run
- Events still fire, tasks still get created — only CLI spawning is blocked
- Budget is not consumed during pause

### Resume and auto-re-wake
- **Global resume:** set \`agents_paused\` to \`"false"\` via \`PATCH /settings\`. The framework auto-re-wakes all agents that have pending \`todo\` tasks — no work is lost.
- **Per-agent resume:** set \`status\` to \`"idle"\` via \`PATCH /agents/:id\`.
- **Auto-re-wake after run:** after any agent run completes, the engine checks if the agent has remaining \`todo\` tasks. If yes, it auto-re-wakes. This prevents tasks from getting stuck when multiple events coalesce into one run.`,
  },
  {
    id: "auth",
    title: "Authentication",
    content: `## User auth (multi-tenant SaaS)

**Signup — create a new tenant:**
\`\`\`bash
curl -X POST /api/auth/signup \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Alice", "email": "alice@acme.com", "password": "...", "tenantName": "Acme Corp"}'
\`\`\`

Creates the tenant, auto-seeds 6 runtimes + copilot agent, runs \`onTenantCreated\` hook. Returns \`{ userId, token }\`.

**Signup — join via invite:**
\`\`\`bash
curl -X POST /api/auth/signup \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Bob", "email": "bob@acme.com", "password": "...", "inviteCode": "abc123"}'
\`\`\`

Joins the tenant from the invitation. Returns \`{ userId, token }\`.

**Login:**
\`\`\`bash
curl -X POST /api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "alice@acme.com", "password": "..."}'
\`\`\`

Returns \`{ userId, token, name, email, tenants: [{ id, name, role }] }\` — all tenants the user belongs to.

**Current user:**
\`\`\`bash
curl /api/auth/me -H "Authorization: Bearer <token>" -H "X-Tenant-Id: <tenant-uuid>"
\`\`\`

Returns \`{ id, name, email, tenants: [...] }\`. Pass \`X-Tenant-Id\` to select the active tenant (returns \`tenantId\` + \`role\` for that tenant).

## Invitations

Admins can invite users to their tenant:

\`\`\`bash
# Create invite (admin only, 7-day expiry)
curl -X POST /api/auth/invite \\
  -H "Authorization: Bearer <token>" \\
  -d '{"email": "bob@acme.com", "role": "member"}'
# Returns { id, inviteCode, expiresAt }

# List pending invitations
curl /api/auth/invitations -H "Authorization: Bearer <token>"

# Revoke an invitation
curl -X DELETE /api/auth/invitations/:id -H "Authorization: Bearer <token>"
\`\`\`

## Team management

Admins can manage users within their tenant:

\`\`\`bash
# List team members
curl /api/auth/team -H "Authorization: Bearer <token>"

# Change role (admin only)
curl -X PATCH /api/auth/team/:userId/role \\
  -H "Authorization: Bearer <token>" \\
  -d '{"role": "admin"}'

# Remove user (admin only)
curl -X DELETE /api/auth/team/:userId -H "Authorization: Bearer <token>"
\`\`\`

## Roles

Every user has a \`role\` per tenant, stored in \`user_tenants.role\`. The framework surfaces \`role\` on every authenticated request but does **not** enforce what roles mean — that's up to your app.

On session-authenticated requests, the admin API sets \`userId\`, \`tenantId\`, and \`role\` on the request context:

\`\`\`typescript
// In your app routes, after framework auth middleware runs:
app.delete("/api/myapp/resources/:id", async (c) => {
  const role = c.get("role");
  if (role !== "admin") return c.json({ error: "Forbidden" }, 403);
  // ... delete logic
});
\`\`\`

The framework provides the plumbing (resolving role from session). Your app decides the policy.

## Admin API auth

The admin API accepts both methods:

1. **API key** — \`X-API-Key: your-admin-key\` + \`X-Tenant-Id: tenant-uuid\`
2. **Session token** — \`Authorization: Bearer <token>\` (tenant resolved from session, \`userId\` + \`role\` set on context)

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
| \`useInbox(status?, assigneeUserId?)\` | inbox items | — |
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
  {
    id: "budgeting-controls",
    title: "Budgeting & Cost Controls",
    content: `BoringOS treats budget enforcement as a runtime primitive, not a reporting afterthought.

## Scope your budget policies

Apply controls at multiple levels:
- Tenant-wide default caps
- Agent-specific limits for expensive roles
- Task-level ceilings for high-risk work
- Workflow-level policies for automation loops

Use stricter defaults for autonomous routines and looser caps for human-approved flows.

## Guardrail modes

- **Hard stop:** immediately halt work when spend limit is reached
- **Soft alert:** allow completion but emit incident + alert event
- **Approval gate:** require a human decision before crossing a threshold

## Operational endpoints

Budget APIs are available under the admin surface:
- \`GET /api/admin/budgets\`
- \`POST /api/admin/budgets\`
- \`DELETE /api/admin/budgets/:id\`
- \`GET /api/admin/budgets/incidents\`
- \`GET /api/admin/costs\`

## Incident handling pattern

1. Detect overrun via budget incidents
2. Inspect run/task context and tool calls
3. Adjust runtime routing (quality/cost policy)
4. Resume with tighter caps or approval gates`,
  },
  {
    id: "auditability-compliance",
    title: "Auditability & Compliance",
    content: `Every meaningful action in BoringOS can be traced and reviewed.

## What gets audited

- Agent wakeups and run lifecycle transitions
- Tool invocations with validated input/output context
- Task comments, assignments, and approvals
- Workflow block execution state changes
- Budget incidents and control decisions

## Why this matters

Auditability powers:
- Root-cause analysis for failures
- Internal governance and security reviews
- Customer diligence and enterprise procurement
- Replay-driven debugging ("what exactly happened?")

## Evidence flow

\`\`\`
Task/Event -> Agent/Workflow action -> Tool call -> Persisted run + event stream
                   -> Approval/Budget decision -> Full timeline for export/review
\`\`\`

## Recommended practice

Keep policy decisions close to execution:
- Use workflow checkpoints for risky actions
- Record explicit reason strings on approvals/rejections
- Treat budget incidents as first-class operations events`,
  },
  {
    id: "runtime-routing",
    title: "Runtime Routing (Any Agent, Any Task)",
    content: `BoringOS supports heterogeneous runtime execution with one orchestration layer.

## Built-in runtime adapters

- \`claude\` (Claude Code CLI)
- \`chatgpt\` (OpenAI Codex CLI)
- \`gemini\` (Gemini CLI)
- \`ollama\` (local model runtime)
- \`command\` (custom subprocess)
- \`webhook\` (external execution service)

## Routing strategies

Use assignment policies based on:
- Cost sensitivity (cheaper-first route)
- Latency requirements (fastest-first route)
- Quality requirements (best-model route)
- Data residency constraints (local/private route)

## Resilience patterns

- Configure fallback chains per workflow path
- Re-route after failures without losing task context
- Keep skills/tools stable while swapping runtime backends

This lets teams optimize for both capability and cost while staying vendor-flexible.`,
  },
  {
    id: "policy-approvals",
    title: "Policy Engine & Human Approvals",
    content: `Autonomy works best with explicit checkpoints for risky transitions.

## Human-in-the-loop blocks

Use \`wait-for-human\` inside workflows to pause execution and collect approval input before continuing.

When approved:
- Workflow resumes with merged user input
- Downstream blocks continue from persisted state

## Practical checkpoint examples

- Deploying to production
- Exceeding normal budget thresholds
- Sending customer-facing comms at scale
- Applying broad data mutations

## Policy layering

Combine multiple controls:
1. Budget policy (cost boundary)
2. Workflow checkpoint (human gate)
3. Role policy in app routes (authorization)

This provides controlled autonomy without forcing humans into every low-risk action.`,
  },
  {
    id: "evals-scorecards",
    title: "Evals, Scorecards, and Regression Checks",
    content: `Reliable agent systems need continuous measurement.

## Evals API

- \`GET /api/admin/evals\`
- \`POST /api/admin/evals\`
- \`POST /api/admin/evals/:id/run\`
- \`GET /api/admin/evals/:id/runs\`

## What to measure

- Success/failure rate by task type
- Cost per successful outcome
- Retry rate and recovery behavior
- Latency percentile by runtime/model
- Human override frequency

## Scorecard loop

\`\`\`
Define eval -> run against candidate change -> compare baseline metrics
-> approve or rollback -> publish updated routing/policy
\`\`\`

Treat evals as a release gate for runtime changes, prompt updates, and policy tweaks.`,
  },
  {
    id: "copilot",
    title: "Copilot",
    content: `Every BoringOS app ships with a built-in **copilot** — a conversational AI assistant that can both **operate** your system (manage tasks, agents, data) and **build** new features (edit code, add integrations). The copilot is **multi-tenant** — it resolves the tenant from the session token and a copilot agent is auto-created for each new tenant on signup.

## How it works

Copilot sessions are tasks with \`originKind: "copilot"\`. Messages are comments. The copilot agent auto-wakes when you post a message — same pattern as any agent task.

\`\`\`
User types "Show me all blocked tasks"
  → Message saved as comment on copilot session task
  → Copilot agent auto-wakes
  → Agent reads codebase + calls admin API
  → Agent posts reply as comment
  → UI polls and renders the reply
\`\`\`

## Zero configuration

The copilot agent (role: \`copilot\`) is auto-created per tenant — on boot for the first tenant, and automatically when new tenants sign up. Session routes are registered automatically. No \`app.copilot()\` call needed.

\`\`\`
POST   /api/copilot/sessions              — create session
GET    /api/copilot/sessions              — list sessions
GET    /api/copilot/sessions/:id          — get messages
POST   /api/copilot/sessions/:id/message  — send + auto-wake agent
DELETE /api/copilot/sessions/:id          — archive
\`\`\`

## What the copilot can do

| Ask | What happens |
|---|---|
| "Show all blocked tasks" | Calls admin API, formats results |
| "Create a task for Q2 review" | Calls POST /api/admin/tasks |
| "Add a chart to the dashboard" | Edits page.tsx, confirms the change |
| "Why did the finance agent fail?" | Reads run logs, explains the error |
| "Change email sync to every 5 min" | Edits routine or workflow config |

## Agent permissions

All agents (including copilot) run with \`--dangerously-skip-permissions\` — full file read/write access for autonomous operation. No interactive approval needed.

## Auto-post results

After every agent run on a task, the framework extracts the result text and posts it as a comment. This enables conversational workflows — the copilot's reply appears in the chat UI without the agent explicitly calling the comment API.

## UI

Use the \`<CopilotPanel />\` component from \`@boringos/ui\`, or build your own chat UI using the copilot API.`,
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
