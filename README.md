# vercel-foundation-certification_eve-agent

A store-administration agent for the **Vercel Swag Store**, built with the [eve](https://eve.dev) agent framework and deployed on [Vercel](https://vercel.com).

The agent helps a store employee answer back-office questions about products, sales, inventory, returns, and support tickets by calling the store's HTTP API through a set of typed tools. Two skills package common workflows (a weekly operational briefing and data-backed product ideation), and a `researcher` subagent pulls in fresh external information from the web when a task needs it.

## What's implemented

### Root agent

| File | Purpose |
|---|---|
| `agent/agent.ts` | Agent definition. Model: `openai/gpt-5.6-luna-fast`. |
| `agent/instructions.md` | Identity and operating rules: a store-administration assistant for the Vercel Swag Store that must use the sandbox `bash` tool to compute totals rather than guessing. |
| `agent/channels/eve.ts` | The eve channel, with `vercelOidc()` (TUI and Vercel deployments), `localDev()` (localhost during `eve dev`), and a `placeholderAuth()` entry that should be swapped for a real auth provider before exposing the agent to browsers in production. |

eve's default tools (`bash`, `read_file`, `write_file`, `web_search`, `web_fetch`, ...) remain enabled, so the agent can run scripts in its sandbox and the researcher subagent can search the web.

### Tools (`agent/tools/`)

Each tool is a thin `defineTool` wrapper with a Zod input schema that delegates to a matching function in `lib/api.ts`.

| Tool | API endpoint | Inputs |
|---|---|---|
| `list_products` | `GET /products` | `page`, `limit` (1–100), `category`, `search`, `featured` |
| `get_product_details` | `GET /products/:idOrSlug` | `idOrSlug` |
| `list_stock_level_for_products` | `GET /back-office/inventory/stock` | `productIds` (comma-separated), `lowStock`, `inStock`, `page`, `limit` (1–200) |
| `sales_totals_by_product` | `GET /back-office/analytics/sales` | `from`, `to`, `productId` |
| `list_historical_returns` | `GET /back-office/returns` | `from`, `to`, `status`, `decision`, `limit` (1–500) |
| `list_support_tickets` | `GET /back-office/support-tickets` | `from`, `to`, `status`, `priority`, `category`, `assignee`, `limit` (1–500) |

Sales and returns history is available for roughly the last 180 days. Revenue values returned by the API are in cents.

### API client (`lib/api.ts`)

A small `fetch`-based client shared by all tools. It builds URLs from `API_BASE_URL`, serialises query parameters (dropping `undefined`), sends the `x-vercel-protection-bypass` header from `BYPASS_SECRET` so the agent can reach a deployment-protected Vercel app, and throws on non-2xx responses.

### Skills (`agent/skills/`)

| Skill | Trigger | What it does |
|---|---|---|
| `weekly-briefing` | "weekly briefing", "weekly report", "how did the store do this week", etc. | Fans out four tool calls in parallel (low stock, 7-day sales, 7-day returns, open tickets from the last 7 days), then renders a one-page Markdown report: top sellers, low-stock alerts, returns by decision, open tickets by priority, and 3–5 recommended actions tied to specific rows. |
| `product-ideation` | "new product ideas", "what should we make next", "swag suggestions", etc. | Calls the `researcher` subagent for recent Vercel news alongside 30-day sales, 30-day returns, and the full catalog. Applies explicit noise floors (returns count as a pattern only at 3+, thin sales volume is called out) and produces exactly five ranked, cited product candidates with an inputs summary. |

### Subagent (`agent/subagents/researcher/`)

| File | Purpose |
|---|---|
| `agent.ts` | Model: `anthropic/claude-sonnet-4.6`. Described to the parent as a web-research specialist for fresh external information (announcements, launches, trends). |
| `instructions.md` | Plans 2–4 queries, runs `web_search` in parallel, uses `web_fetch` selectively, and returns a short brief with summary, key findings, uncertainty, and a sources list. Favours recent, first-party sources. |

## Project layout

```
agent/
  agent.ts                     # root agent (model)
  instructions.md              # root agent identity and rules
  channels/eve.ts              # eve channel + auth
  tools/                       # six Swag Store API tools
  skills/
    weekly-briefing/SKILL.md
    product-ideation/SKILL.md
  subagents/researcher/
    agent.ts
    instructions.md
lib/
  api.ts                       # shared HTTP client for the store API
```

## Environment variables

Create `.env.local` (git-ignored) with:

| Variable | Used by | Description |
|---|---|---|
| `API_BASE_URL` | `lib/api.ts` | Base URL of the Vercel Swag Store API (no trailing slash). |
| `BYPASS_SECRET` | `lib/api.ts` | Vercel Deployment Protection bypass token, sent as `x-vercel-protection-bypass`. |
| `AI_GATEWAY_API_KEY` | eve | Vercel AI Gateway key used for the `openai/...` and `anthropic/...` model IDs. |
| `VERCEL_OIDC_TOKEN` | eve channel | Populated automatically by `vercel env pull` / Vercel; used by `vercelOidc()` auth. |

## Getting started

Requirements: Node.js 24.x and [pnpm](https://pnpm.io) (the repo ships a `pnpm-lock.yaml`).

```bash
pnpm install
pnpm dev          # eve dev: starts the local server and opens the terminal UI
```

Try prompts such as:

- "Give me the weekly briefing."
- "Which products are low on stock?"
- "What were total sales for `tshirt_001` over the last 30 days?"
- "Suggest five new products we should add to the store."

Other scripts from `package.json`:

```bash
pnpm typecheck    # tsc --noEmit over agent/ and evals/
pnpm build        # eve build
pnpm start        # eve start (serve the built output)
pnpm eval         # eve eval (no evals are authored yet)
pnpm deploy       # eve deploy
```

## Deploy on Vercel

```bash
eve deploy
```

`eve deploy` links a Vercel project if needed and deploys to production. Make sure `API_BASE_URL`, `BYPASS_SECRET`, and `AI_GATEWAY_API_KEY` are set as environment variables on the Vercel project. Before exposing the agent to browser clients, replace `placeholderAuth()` in `agent/channels/eve.ts` with a real auth provider (or `none()` for a public demo).

## Not yet implemented

- Evals (`evals/` directory and `eve eval` targets)
- Schedules, connections, or additional channels beyond the default eve channel
- Production browser auth (the channel still uses `placeholderAuth()`)

## Learn more

- [eve documentation](https://eve.dev/docs)
- [eve CLI reference](https://eve.dev/docs/reference/cli)
- [eve deployment on Vercel](https://eve.dev/docs/guides/deployment/vercel)
