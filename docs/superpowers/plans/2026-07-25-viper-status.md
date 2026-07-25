# Viper Status Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy `status.viperisuseful.cc`, a ViperCapture-aligned public status site backed by a published Uptime Kuma status feed and six customer-facing components.

**Architecture:** A Dockerized Next.js App Router application fetches Uptime Kuma public status endpoints on the server, validates and normalizes them, then serves sanitized same-origin JSON to the browser. Uptime Kuma remains the monitor and incident control plane. ViperCapture API health combines a minute-level route probe with a six-hour paid functional PNG render.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS v4, shadcn/ui, Zod, Vitest, Testing Library, Playwright, Docker, Coolify, Nginx, Cloudflare, Uptime Kuma Socket.IO API.

## Global Constraints

- Public components are exactly Portfolio, ViperCapture, ViperCapture API, Turtle Cave, QuickRunLab, and QuickRunLab API.
- TinyAuth, Coolify, Vaultwarden, ViperSearch, Zipline, Turtle worker, and legacy redirects stay off the public page.
- Browser code receives no Kuma credentials, ViperCapture API key, monitor request headers, internal monitor IDs, or raw errors.
- Kuma public endpoints are the runtime data source. Admin credentials are setup-only.
- ViperCapture paid render runs every 21,600 seconds and costs about 120-124 credits per month.
- Server fetch cache and visible-page browser refresh are 60 seconds.
- Data older than 180 seconds is stale.
- Page meets WCAG 2.2 AA and supports system light/dark, reduced motion, keyboard use, 200% zoom, and narrow mobile.
- Use ViperCapture brand tokens and self-hosted Viper Sans.
- Use regular hyphens only in visible copy. No em dash or en dash characters.
- No fabricated 90-day uptime. Show 24-hour uptime, recent real checks, and real incident history.
- Coolify Traefik stays disabled. Host Nginx remains public listener on ports 80 and 443.
- Preview deployments stay disabled.
- Never print or commit Kuma credentials, ViperCapture API keys, cookies, webhook secrets, or environment values.

---

## Planned File Structure

```text
viper-status/
├── Dockerfile                         # Production Next.js image
├── .dockerignore                      # Excludes local and secret files
├── .env.example                       # Non-secret runtime variable names
├── components.json                    # shadcn project configuration
├── next.config.ts                     # Standalone output and security headers
├── package.json                       # Scripts and dependencies
├── public/
│   ├── fonts/viper-sans.woff2         # Existing ViperCapture brand font
│   ├── viper-mark.svg                 # Existing ViperCapture mark
│   └── favicon.svg                    # Status favicon
├── src/
│   ├── app/
│   │   ├── api/health/route.ts        # Container liveness
│   │   ├── api/status/route.ts        # Sanitized status JSON
│   │   ├── globals.css                # Brand tokens and Tailwind theme
│   │   ├── layout.tsx                 # Metadata and page theme
│   │   └── page.tsx                   # Status page composition
│   ├── components/
│   │   ├── active-incident.tsx        # Incident or maintenance alert
│   │   ├── empty-history.tsx          # Incident-history empty state
│   │   ├── header.tsx                 # Brand, portfolio link, theme control
│   │   ├── incident-history.tsx       # Resolved and active incident list
│   │   ├── overall-status.tsx         # Overall state panel
│   │   ├── recent-checks.tsx          # Accessible recent-heartbeat rail
│   │   ├── service-list.tsx           # Six open service rows
│   │   ├── service-row.tsx            # Single public component row
│   │   ├── status-page-client.tsx     # Refresh, loading, stale, retry state
│   │   ├── status-state.tsx           # Shared icon and state label
│   │   ├── theme-provider.tsx          # next-themes client provider
│   │   └── theme-toggle.tsx            # Compact light/dark/system control
│   ├── lib/
│   │   ├── aggregate.ts               # Child and overall state precedence
│   │   ├── constants.ts               # Slug, intervals, component mapping
│   │   ├── kuma-client.ts             # Public endpoint fetch adapter
│   │   ├── normalize.ts               # Kuma payload to public document
│   │   ├── schemas.ts                 # Zod upstream and public schemas
│   │   ├── status-cache.ts             # Last-good in-process cache
│   │   └── types.ts                   # Stable public types
│   └── test/
│       ├── fixtures/kuma.ts            # Realistic sanitized Kuma fixtures
│       └── setup.ts                    # Testing Library setup
├── tests/
│   ├── aggregate.test.ts               # State precedence
│   ├── api-status.test.ts              # Route fallback and sanitization
│   ├── normalize.test.ts               # Mapping and freshness
│   ├── status-page.test.tsx            # UI states and accessibility
│   └── e2e/status.spec.ts              # Desktop/mobile/live workflow
└── docs/
    ├── operations.md                   # Deploy, health, rollback
    └── superpowers/                    # Approved spec and plan
```

---

### Task 1: Create and Approve Visual Concept

**Files:**
- Create: `docs/design/status-desktop.png`
- Create: `docs/design/status-mobile.png`
- Modify: `DESIGN.md`

**Interfaces:**
- Consumes: Approved `PRODUCT.md`, `DESIGN.md`, and design spec.
- Produces: Accepted desktop and mobile visual references plus final token decisions used by every UI task.

- [ ] **Step 1: Load required visual skills**

Read `imagegen`, `frontend-app-builder`, `shadcn`, `design-taste-frontend`, and `impeccable` instructions. Record the approved dials as `5 / 3 / 5`.

- [ ] **Step 2: Generate desktop concept**

Generate a 1440x1100 full status-page concept with this exact brief:

```text
Public operational status page, not a marketing landing page. ViperCapture brand:
cool near-white and near-black system themes, cobalt accent, Viper Sans, quiet
14px surfaces, precise 1px borders. Familiar clarity of status.openai.com and
status.discord.com without copying either. Header: Viper mark, "Viper Status",
portfolio link, theme control. Overall state: "All systems operational".
Exactly six service rows: Portfolio, ViperCapture, ViperCapture API, Turtle Cave,
QuickRunLab, QuickRunLab API. Each row has text state, 24-hour uptime, recent
check rail. Then incident history empty state. No 90-day claim, no hero eyebrow,
no fake metrics, no infrastructure services, no decorative dashboard cards,
no gradients, no glass, no em dash, no invented incident.
```

Save accepted output to `docs/design/status-desktop.png`.

- [ ] **Step 3: Generate mobile concept**

Generate a coordinated 390x844 mobile concept preserving exact copy, colors, row order, and component family. Rows collapse to product name, state, uptime, then horizontally compressed recent checks. Save to `docs/design/status-mobile.png`.

- [ ] **Step 4: Inspect both concepts**

Run:

```bash
view_image docs/design/status-desktop.png
view_image docs/design/status-mobile.png
```

Expected: readable service names, exact six rows, no clipped controls, no unapproved copy, consistent radius and cobalt.

- [ ] **Step 5: Get user approval**

Present both concepts. Do not scaffold code until user approves.

- [ ] **Step 6: Update design tokens**

Add any approved token refinements to `DESIGN.md`. Keep existing ViperCapture identity values unless concept review explicitly changes composition without changing identity.

- [ ] **Step 7: Commit**

```bash
git add DESIGN.md docs/design/status-desktop.png docs/design/status-mobile.png
git commit -m "docs: approve Viper Status visual concept"
```

---

### Task 2: Scaffold Next.js and shadcn Foundation

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `components.json`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `src/lib/utils.ts`
- Create: `public/fonts/viper-sans.woff2`
- Create: `public/viper-mark.svg`
- Create: `src/components/ui/{alert,badge,button,separator,skeleton,tooltip}.tsx`
- Test: `tests/status-page.test.tsx`

**Interfaces:**
- Consumes: Accepted concept and `DESIGN.md`.
- Produces: Runnable Next.js shell, shadcn primitives, brand assets, and test harness.

- [ ] **Step 1: Scaffold in a temporary directory**

```bash
scaffold_dir=$(mktemp -d /tmp/viper-status-next.XXXXXX)
npx create-next-app@latest "$scaffold_dir" \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias '@/*' --use-npm --no-turbopack
rsync -a --exclude .git --exclude README.md "$scaffold_dir"/ ./
rm -rf "$scaffold_dir"
```

Expected: existing `PRODUCT.md`, `DESIGN.md`, and `docs/` preserved; Next.js files added.

- [ ] **Step 2: Initialize shadcn**

```bash
npx shadcn@latest init --defaults
npx shadcn@latest info --json
npx shadcn@latest docs alert badge button separator skeleton tooltip
npx shadcn@latest add alert badge button separator skeleton tooltip
```

Expected: `components.json` exists and six component implementations appear under `src/components/ui/`.

- [ ] **Step 3: Add runtime and test dependencies**

```bash
npm install zod next-themes @phosphor-icons/react
npm install -D vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  @playwright/test axe-core
```

- [ ] **Step 4: Add test scripts**

Set `package.json` scripts to:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test"
}
```

- [ ] **Step 5: Write failing shell test**

Create `tests/status-page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

it("renders the Viper Status shell", () => {
  render(<Home />);
  expect(screen.getByRole("heading", { name: "Viper Status" })).toBeInTheDocument();
});
```

- [ ] **Step 6: Run test and verify failure**

```bash
npm test -- tests/status-page.test.tsx
```

Expected: FAIL because the scaffold page does not expose the `Viper Status` heading.

- [ ] **Step 7: Implement minimal shell**

Create `src/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main>
      <h1>Viper Status</h1>
    </main>
  );
}
```

- [ ] **Step 8: Add brand assets**

Copy existing reviewed assets without modifying originals:

```bash
cp /home/ubuntu/screenshot-api/static/vipercapture-mark.svg public/viper-mark.svg
curl -fsSL https://capture.viperisuseful.cc/static/fonts/InterVariable.woff2 \
  -o public/fonts/viper-sans.woff2
test -s public/fonts/viper-sans.woff2
```

- [ ] **Step 9: Add global token baseline**

Define ViperCapture light/dark variables in `src/app/globals.css` and map shadcn semantic tokens. Use CSS variables, one page theme, `@font-face`, visible focus, reduced-motion fallback, `font-variant-numeric: tabular-nums`, and no raw component color overrides.

- [ ] **Step 10: Verify foundation**

```bash
npm test -- tests/status-page.test.tsx
npm run typecheck
npm run lint
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 11: Commit**

```bash
git add package.json package-lock.json components.json next.config.ts tsconfig.json \
  postcss.config.mjs public src tests
git commit -m "feat: scaffold Viper Status frontend"
```

---

### Task 3: Implement Status Domain Model

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/schemas.ts`
- Create: `src/lib/constants.ts`
- Create: `src/lib/aggregate.ts`
- Test: `tests/aggregate.test.ts`

**Interfaces:**
- Produces:
  - `StatusState = "operational" | "degraded" | "outage" | "maintenance" | "unknown"`
  - `aggregateStates(states: StatusState[]): StatusState`
  - `overallState(components: PublicComponent[]): StatusState`
  - `PUBLIC_COMPONENTS` exact ordered component definitions

- [ ] **Step 1: Write failing state tests**

Create `tests/aggregate.test.ts`:

```ts
import { aggregateStates, overallState } from "@/lib/aggregate";
import type { PublicComponent } from "@/lib/types";

describe("aggregateStates", () => {
  it.each([
    [["operational", "operational"], "operational"],
    [["operational", "maintenance"], "maintenance"],
    [["operational", "unknown"], "unknown"],
    [["operational", "outage"], "outage"],
  ] as const)("%j becomes %s", (states, expected) => {
    expect(aggregateStates([...states])).toBe(expected);
  });
});

it("marks mixed public availability degraded", () => {
  const components = [
    { state: "operational" },
    { state: "outage" },
  ] as PublicComponent[];
  expect(overallState(components)).toBe("degraded");
});
```

- [ ] **Step 2: Run test and verify failure**

```bash
npm test -- tests/aggregate.test.ts
```

Expected: FAIL because `aggregateStates` and types do not exist.

- [ ] **Step 3: Define public types**

Create `src/lib/types.ts` with:

```ts
export type StatusState =
  | "operational"
  | "degraded"
  | "outage"
  | "maintenance"
  | "unknown";

export type RecentCheck = {
  at: string;
  state: StatusState;
  responseMs: number | null;
};

export type PublicComponent = {
  key: string;
  name: string;
  state: StatusState;
  uptime24h: number | null;
  responseMs: number | null;
  recentChecks: RecentCheck[];
};

export type PublicIncident = {
  id: string;
  title: string;
  content: string;
  state: "active" | "resolved";
  severity: "info" | "warning" | "danger" | "maintenance";
  createdAt: string;
  updatedAt: string | null;
};

export type StatusDocument = {
  state: StatusState;
  generatedAt: string;
  stale: boolean;
  components: PublicComponent[];
  activeIncident: PublicIncident | null;
  incidents: PublicIncident[];
};
```

- [ ] **Step 4: Define exact public mapping**

Create `src/lib/constants.ts`:

```ts
export const KUMA_SLUG = "viper";
export const STALE_AFTER_MS = 180_000;

export const PUBLIC_COMPONENTS = [
  { key: "portfolio", name: "Portfolio", monitors: ["Viper Hub"] },
  { key: "vipercapture", name: "ViperCapture", monitors: ["ViperCapture"] },
  {
    key: "vipercapture-api",
    name: "ViperCapture API",
    monitors: ["ViperCapture API Route", "ViperCapture API Functional Render"],
  },
  {
    key: "turtle-cave",
    name: "Turtle Cave",
    monitors: ["Turtle Cave Database Health"],
  },
  { key: "quickrunlab", name: "QuickRunLab", monitors: ["QuickRunLab"] },
  {
    key: "quickrunlab-api",
    name: "QuickRunLab API",
    monitors: ["QuickRunLab API Socket.IO"],
  },
] as const;
```

- [ ] **Step 5: Implement precedence**

Create `src/lib/aggregate.ts`:

```ts
import type { PublicComponent, StatusState } from "./types";

export function aggregateStates(states: StatusState[]): StatusState {
  if (states.length === 0) return "unknown";
  if (states.includes("outage")) return "outage";
  if (states.includes("unknown")) return "unknown";
  if (states.includes("maintenance")) return "maintenance";
  if (states.includes("degraded")) return "degraded";
  return "operational";
}

export function overallState(components: PublicComponent[]): StatusState {
  if (components.length === 0) return "unknown";
  const states = components.map((component) => component.state);
  if (states.every((state) => state === "operational")) return "operational";
  if (states.every((state) => state === "maintenance")) return "maintenance";
  if (states.every((state) => state === "outage" || state === "unknown")) {
    return "outage";
  }
  return "degraded";
}
```

- [ ] **Step 6: Add Zod public schema**

Define `StatusDocumentSchema` in `src/lib/schemas.ts` matching `StatusDocument`. Also define upstream schemas for status-page config, heartbeat map, uptime map, and incident history. Use `.passthrough()` only on upstream objects, never on the public output schema.

- [ ] **Step 7: Verify**

```bash
npm test -- tests/aggregate.test.ts
npm run typecheck
```

Expected: PASS and exit 0.

- [ ] **Step 8: Commit**

```bash
git add src/lib tests/aggregate.test.ts
git commit -m "feat: define public status model"
```

---

### Task 4: Build Kuma Adapter and Normalizer

**Files:**
- Create: `src/lib/kuma-client.ts`
- Create: `src/lib/normalize.ts`
- Create: `src/lib/status-cache.ts`
- Create: `src/test/fixtures/kuma.ts`
- Test: `tests/normalize.test.ts`

**Interfaces:**
- Consumes: `PUBLIC_COMPONENTS`, upstream Zod schemas.
- Produces:
  - `fetchKumaSnapshot(signal?: AbortSignal): Promise<KumaSnapshot>`
  - `normalizeSnapshot(snapshot: KumaSnapshot, now?: Date): StatusDocument`
  - `getLastGood(): StatusDocument | null`
  - `setLastGood(document: StatusDocument): void`

- [ ] **Step 1: Write sanitized fixture**

Create `src/test/fixtures/kuma.ts` with monitor IDs `1, 5, 8, 10, 14, 15, 16`, exact required monitor names, two heartbeats each, 24-hour uptime values, one resolved incident, and no credentials or request headers.

- [ ] **Step 2: Write failing normalizer tests**

Create `tests/normalize.test.ts`:

```ts
import { normalizeSnapshot } from "@/lib/normalize";
import { kumaSnapshot } from "@/test/fixtures/kuma";

it("returns exactly six public components in approved order", () => {
  const result = normalizeSnapshot(kumaSnapshot, new Date("2026-07-25T23:00:00Z"));
  expect(result.components.map((item) => item.name)).toEqual([
    "Portfolio",
    "ViperCapture",
    "ViperCapture API",
    "Turtle Cave",
    "QuickRunLab",
    "QuickRunLab API",
  ]);
});

it("aggregates both ViperCapture API monitors", () => {
  const result = normalizeSnapshot(kumaSnapshot);
  expect(result.components[2].state).toBe("operational");
});

it("does not serialize internal monitor ids", () => {
  expect(JSON.stringify(normalizeSnapshot(kumaSnapshot))).not.toMatch(/monitorId|\"id\":1/);
});
```

- [ ] **Step 3: Run test and verify failure**

```bash
npm test -- tests/normalize.test.ts
```

Expected: FAIL because `normalizeSnapshot` does not exist.

- [ ] **Step 4: Implement bounded public fetches**

Create `src/lib/kuma-client.ts`:

```ts
import { KUMA_SLUG } from "./constants";
import {
  KumaConfigSchema,
  KumaHeartbeatSchema,
  KumaIncidentHistorySchema,
} from "./schemas";

const base = process.env.KUMA_PUBLIC_URL ?? "https://uptimekuma.fr-1.instapods.app";

async function getJson(path: string, signal?: AbortSignal) {
  const response = await fetch(`${base}${path}`, {
    signal,
    next: { revalidate: 60 },
    headers: { accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Kuma request failed: ${response.status}`);
  return response.json();
}

export async function fetchKumaSnapshot(signal?: AbortSignal) {
  const [config, heartbeat, incidents] = await Promise.all([
    getJson(`/api/status-page/${KUMA_SLUG}`, signal),
    getJson(`/api/status-page/heartbeat/${KUMA_SLUG}`, signal),
    getJson(`/api/status-page/${KUMA_SLUG}/incident-history`, signal),
  ]);
  return {
    config: KumaConfigSchema.parse(config),
    heartbeat: KumaHeartbeatSchema.parse(heartbeat),
    incidents: KumaIncidentHistorySchema.parse(incidents),
  };
}
```

- [ ] **Step 5: Implement normalization**

Map heartbeat status `1` to operational, `0` to outage, `3` to maintenance, and missing or pending to unknown. Resolve monitor names from `publicGroupList`. Aggregate child monitors with `aggregateStates`. Convert uptime fractions to percentages only at render time. Sort heartbeat arrays oldest to newest.

- [ ] **Step 6: Implement last-good cache**

Create `src/lib/status-cache.ts`:

```ts
import type { StatusDocument } from "./types";

let lastGood: StatusDocument | null = null;

export const getLastGood = () => lastGood;
export const setLastGood = (document: StatusDocument) => {
  lastGood = document;
};
```

- [ ] **Step 7: Verify**

```bash
npm test -- tests/normalize.test.ts
npm run typecheck
```

Expected: PASS and exit 0.

- [ ] **Step 8: Commit**

```bash
git add src/lib src/test tests/normalize.test.ts
git commit -m "feat: normalize Uptime Kuma status data"
```

---

### Task 5: Add Status and Health API Routes

**Files:**
- Create: `src/app/api/status/route.ts`
- Create: `src/app/api/health/route.ts`
- Test: `tests/api-status.test.ts`

**Interfaces:**
- Produces:
  - `GET /api/status` returning `StatusDocument`
  - `GET /api/health` returning `{"ok":true}`

- [ ] **Step 1: Write failing route tests**

Mock `fetchKumaSnapshot` and assert:

```ts
it("returns a validated status document", async () => {
  const response = await GET();
  expect(response.status).toBe(200);
  expect(StatusDocumentSchema.parse(await response.json())).toBeTruthy();
});

it("returns stale last-good data after Kuma failure", async () => {
  mockFetchKumaSnapshot.mockRejectedValueOnce(new Error("timeout"));
  const response = await GET();
  expect((await response.json()).stale).toBe(true);
});
```

- [ ] **Step 2: Run and verify failure**

```bash
npm test -- tests/api-status.test.ts
```

Expected: FAIL because routes do not exist.

- [ ] **Step 3: Implement `/api/status`**

Use `AbortSignal.timeout(8_000)`. On success normalize, validate, cache, and return with `Cache-Control: public, max-age=30, stale-while-revalidate=120`. On failure return stale last-good with HTTP 200. Without last-good return:

```json
{
  "error": "Monitoring data is temporarily unavailable."
}
```

with HTTP 503. Log only error class and upstream HTTP status.

- [ ] **Step 4: Implement `/api/health`**

```ts
export async function GET() {
  return Response.json({ ok: true });
}
```

- [ ] **Step 5: Add security headers**

Configure `next.config.ts` headers for:

```text
Content-Security-Policy
Referrer-Policy: strict-origin-when-cross-origin
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

CSP permits self scripts/styles/fonts/images and connections only to self.

- [ ] **Step 6: Verify**

```bash
npm test -- tests/api-status.test.ts
npm run typecheck
npm run build
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/app/api next.config.ts tests/api-status.test.ts
git commit -m "feat: expose sanitized status API"
```

---

### Task 6: Configure Uptime Kuma Public Feed and API Monitors

**Files:**
- Create: `.env.example`
- Modify: `docs/operations.md`

**Interfaces:**
- Produces published Kuma slug `viper` containing required underlying monitors.
- Requires setup-only `KUMA_USERNAME`, `KUMA_PASSWORD`, and `VIPERCAPTURE_API_KEY`.

- [ ] **Step 1: Verify current monitor inventory**

Connect through `uptime-kuma-api` with dashboard credentials loaded from process environment. Print only monitor IDs, names, type, URL, interval, and active state.

Expected existing monitors:

```text
Viper Hub
ViperCapture
Turtle Cave Database Health
QuickRunLab
```

- [ ] **Step 2: Test unauthenticated ViperCapture route behavior**

```bash
curl -sS -o /dev/null -w '%{http_code}\n' \
  -X POST https://capture.viperisuseful.cc/v1/render \
  -H 'Content-Type: application/json' \
  --data '{"url":"https://example.com","output":"png","viewport":{"width":320,"height":240},"full_page":false}'
```

Expected: HTTP 401 with error code `unauthorized`.

- [ ] **Step 3: Add idempotent ViperCapture API route monitor**

Create only when `(name, url)` is absent:

```python
{
  "name": "ViperCapture API Route",
  "type": "http",
  "url": "https://capture.viperisuseful.cc/v1/render",
  "method": "POST",
  "body": "{\"url\":\"https://example.com\",\"output\":\"png\",\"viewport\":{\"width\":320,\"height\":240},\"full_page\":false}",
  "headers": "{\"Content-Type\":\"application/json\"}",
  "interval": 60,
  "retryInterval": 60,
  "maxretries": 2,
  "accepted_statuscodes": ["401"],
  "conditions": [],
  "rabbitmqNodes": []
}
```

- [ ] **Step 4: Add paid functional render monitor**

Create only when absent:

```python
{
  "name": "ViperCapture API Functional Render",
  "type": "http",
  "url": "https://capture.viperisuseful.cc/v1/render",
  "method": "POST",
  "body": "{\"url\":\"https://example.com\",\"output\":\"png\",\"viewport\":{\"width\":320,\"height\":240},\"full_page\":false}",
  "headers": "{\"Authorization\":\"Bearer ${VIPERCAPTURE_API_KEY}\",\"Content-Type\":\"application/json\"}",
  "interval": 21600,
  "retryInterval": 60,
  "maxretries": 2,
  "accepted_statuscodes": ["200-299"],
  "conditions": [],
  "rabbitmqNodes": []
}
```

Never print the rendered `headers` field.

- [ ] **Step 5: Add QuickRunLab API monitor**

```python
{
  "name": "QuickRunLab API Socket.IO",
  "type": "keyword",
  "url": "https://quickrunlab.tech/socket.io/?EIO=4&transport=polling",
  "keyword": "\"sid\"",
  "interval": 60,
  "retryInterval": 60,
  "maxretries": 2,
  "accepted_statuscodes": ["200-299"],
  "conditions": [],
  "rabbitmqNodes": []
}
```

- [ ] **Step 6: Create or update published Kuma page**

Use slug `viper`, title `Viper Status`, published `true`, and one `Products` group. The ordered underlying monitor list is:

```python
[
  {"id": id_by_name["Viper Hub"]},
  {"id": id_by_name["ViperCapture"]},
  {"id": id_by_name["ViperCapture API Route"]},
  {"id": id_by_name["ViperCapture API Functional Render"]},
  {"id": id_by_name["Turtle Cave Database Health"]},
  {"id": id_by_name["QuickRunLab"]},
  {"id": id_by_name["QuickRunLab API Socket.IO"]},
]
```

Set `showPoweredBy` false on Kuma's built-in page. The custom frontend credits Kuma separately.

- [ ] **Step 7: Verify public endpoints without credentials**

```bash
curl -fsS https://uptimekuma.fr-1.instapods.app/api/status-page/viper
curl -fsS https://uptimekuma.fr-1.instapods.app/api/status-page/heartbeat/viper
curl -fsS https://uptimekuma.fr-1.instapods.app/api/status-page/viper/incident-history
```

Expected: all HTTP 200. Config contains exactly seven underlying monitors and no request headers.

- [ ] **Step 8: Verify monitor heartbeats**

Reconnect through dashboard API and require UP for all seven underlying public monitors. Confirm functional render response is non-trivial PNG and one credit settled.

- [ ] **Step 9: Document operations**

Write `docs/operations.md` with monitor names, intervals, public slug, incident workflow, expected monthly credit use, key rotation process, and Kuma rollback steps. Do not include credentials.

- [ ] **Step 10: Commit**

```bash
git add .env.example docs/operations.md
git commit -m "docs: record status monitor operations"
```

---

### Task 7: Build Production Status Interface

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Create: `src/components/*.tsx` listed in file structure
- Test: `tests/status-page.test.tsx`

**Interfaces:**
- Consumes: `GET /api/status` and `StatusDocument`.
- Produces: faithful desktop/mobile implementation of approved concept.

- [ ] **Step 1: Expand component tests**

Add tests for:

```tsx
expect(screen.getAllByRole("listitem")).toHaveLength(6);
expect(screen.getByText("All systems operational")).toBeInTheDocument();
expect(screen.getByText("No incidents reported")).toBeInTheDocument();
expect(screen.getByRole("button", { name: "Retry status" })).toBeInTheDocument();
expect(screen.getByText("Monitoring data may be delayed")).toBeInTheDocument();
```

Render each assertion with the matching operational, error, and stale fixture.

- [ ] **Step 2: Run and verify failure**

```bash
npm test -- tests/status-page.test.tsx
```

Expected: FAIL because production components do not exist.

- [ ] **Step 3: Implement theme shell**

Use `ThemeProvider` with `attribute="class"`, `defaultTheme="system"`, and `enableSystem`. Header includes mark, heading, portfolio link, and an accessible three-choice system/light/dark theme menu.

- [ ] **Step 4: Implement status state primitive**

Map each state to Phosphor icon, visible text, and semantic tokens:

```ts
operational: "Operational"
degraded: "Degraded performance"
outage: "Outage"
maintenance: "Maintenance"
unknown: "Status unknown"
```

Icons inherit current color. Do not use color alone.

- [ ] **Step 5: Implement overall status**

Map overall states to:

```ts
operational: "All systems operational"
degraded: "Some systems degraded"
outage: "Service disruption"
maintenance: "Maintenance in progress"
unknown: "Status unavailable"
```

Use one purposeful `Card` composition or Alert-like panel matching accepted concept. No hero eyebrow.

- [ ] **Step 6: Implement service list**

Render exactly six semantic list items. Use `Separator` between rows, not a floating card per row. Each row exposes product name, status text, 24-hour uptime formatted to at most three decimal places, response time when available, and recent checks.

- [ ] **Step 7: Implement recent checks**

Render up to 30 check segments. Every segment has an accessible label such as:

```text
Operational at July 25, 2026, 10:42 PM, 164 milliseconds
```

Use `Tooltip` for pointer users and `aria-label` for assistive technology.

- [ ] **Step 8: Implement incidents**

Use shadcn `Alert` for active incident or maintenance. Incident history uses plain chronological entries. Empty history uses `Empty` if available in the selected registry version; otherwise use semantic heading and paragraph without inventing a styled card.

- [ ] **Step 9: Implement client states**

`StatusPageClient`:

- Uses server-rendered initial document.
- Refreshes `/api/status` every 60 seconds only while `document.visibilityState === "visible"`.
- Aborts on unmount.
- Keeps last rendered data during refresh.
- Uses `Skeleton` matching service-row anatomy on initial loading.
- Shows stale `Alert`.
- Shows explicit error state and `Retry status` button when no data exists.

- [ ] **Step 10: Add metadata**

Set:

```ts
title: "Viper Status"
description: "Live status for ViperCapture, Turtle Cave, QuickRunLab, and the Viper portfolio."
metadataBase: new URL("https://status.viperisuseful.cc")
```

Add canonical URL, Open Graph, Twitter card, theme colors, favicon, and robots indexing.

- [ ] **Step 11: Verify tests and build**

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Expected: all exit 0.

- [ ] **Step 12: Commit**

```bash
git add src public tests
git commit -m "feat: build live Viper Status interface"
```

---

### Task 8: Add Docker Packaging and Local Verification

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`
- Modify: `next.config.ts`
- Modify: `docs/operations.md`
- Test: `tests/e2e/status.spec.ts`

**Interfaces:**
- Produces production container listening on port 3000 with `/api/health`.

- [ ] **Step 1: Write Dockerfile**

Use Node 22 Alpine multi-stage build with non-root runtime user and Next standalone output:

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

- [ ] **Step 2: Enable standalone output**

Set `output: "standalone"` in `next.config.ts`.

- [ ] **Step 3: Build and run candidate**

```bash
docker build -t viper-status:candidate .
docker run --rm -d --name viper-status-candidate \
  -p 127.0.0.1:8308:3000 \
  -e KUMA_PUBLIC_URL=https://uptimekuma.fr-1.instapods.app \
  viper-status:candidate
curl -fsS http://127.0.0.1:8308/api/health
curl -fsS http://127.0.0.1:8308/api/status
```

Expected: health `{"ok":true}` and validated six-component status document.

- [ ] **Step 4: Add Playwright tests**

Create `tests/e2e/status.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("renders six live public components", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Viper Status" })).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveCount(6);
  await expect(page.getByText("ViperCapture API", { exact: true })).toBeVisible();
});

test("fits a narrow mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(390);
});
```

- [ ] **Step 5: Run local E2E**

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:8308 npm run test:e2e
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add Dockerfile .dockerignore next.config.ts docs/operations.md tests/e2e
git commit -m "build: package Viper Status for production"
```

---

### Task 9: Visual, Accessibility, and Performance QA

**Files:**
- Modify: UI files discovered by QA
- Create temporarily, then remove: `tmp/qa/*`

**Interfaces:**
- Consumes: accepted desktop/mobile concepts and local candidate.
- Produces: agency-signoff render with no known P0/P1 accessibility, responsive, or visual defects.

- [ ] **Step 1: Run browser verification**

Use Browser/IAB first. Verify:

```text
1440x1100 light
1440x1100 dark
390x844 light
390x844 dark
200% zoom
prefers-reduced-motion
```

- [ ] **Step 2: Capture screenshots**

Save latest renders to:

```text
tmp/qa/status-desktop-light.png
tmp/qa/status-desktop-dark.png
tmp/qa/status-mobile-light.png
tmp/qa/status-mobile-dark.png
```

- [ ] **Step 3: Compare with accepted concepts**

Use `view_image` on accepted concept and latest matching render. Write a fidelity ledger covering:

1. Exact copy and six-row order
2. First viewport balance
3. Typography and Viper Sans
4. Palette and semantic state colors
5. Spacing, separators, and radius
6. Responsive collapse
7. Loading and error states

Fix every actionable mismatch.

- [ ] **Step 4: Run automated audits**

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npx lighthouse http://127.0.0.1:8308 \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags='--headless' \
  --output=json --output-path=tmp/qa/lighthouse.json
```

Required:

```text
Accessibility >= 95
Best Practices >= 95
SEO >= 95
No horizontal overflow
No critical axe violations
```

- [ ] **Step 5: Run mechanical preflight**

```bash
rg -n '—|–|T[B]D|T[O]DO|PLACEHOLDER' src public
rg -n 'space-[xy]-|bg-(blue|green|red|amber)-[0-9]|text-(blue|green|red|amber)-[0-9]' src
```

Expected: no visible em/en dashes, placeholders, banned spacing utilities, or raw component palette overrides.

- [ ] **Step 6: Remove temporary QA artifacts**

```bash
rm -rf tmp/qa
```

- [ ] **Step 7: Commit QA fixes**

```bash
git add src public tests
git commit -m "fix: polish Viper Status experience"
```

---

### Task 10: Publish Repository and Create Coolify Application

**Files:**
- Modify: `docs/operations.md`
- Modify after deployment: `/home/ubuntu/AGENTS.md`
- Modify after deployment: `/home/ubuntu/docs/coolify-operations.md`

**Interfaces:**
- Produces GitHub repository and healthy Coolify candidate on selected local port.

- [ ] **Step 1: Final local repository review**

```bash
git status --short --branch
git log --oneline --decorate -10
git diff origin/main...HEAD
```

For a new repo without `origin`, inspect `git show --stat --oneline HEAD` and full tracked-file inventory instead.

- [ ] **Step 2: Create and push private/public repository as approved**

Create `Viperisuseful/viper-status`, add as `origin`, and push `main`. Use GitHub publishing workflow. Never include `.env` or credentials.

- [ ] **Step 3: Grant GitHub App least privilege**

Grant `coolify-oraclevm` access only to `Viperisuseful/viper-status`.

- [ ] **Step 4: Create Coolify Git application**

Configure:

```text
Name: viper-status
Repository: Viperisuseful/viper-status
Branch: main
Build: Dockerfile
Container port: 3000
Host port candidate: 8308
Health endpoint: /api/health
Preview deployments: disabled
Auto-deploy: disabled until candidate verification
KUMA_PUBLIC_URL: https://uptimekuma.fr-1.instapods.app
```

Set explicit CPU and memory limits. Prefer `127.0.0.1:8308`. If Coolify requires `8308:3000`, verify existing IPv4 and IPv6 `DENY FWD` rules for destination container port 3000 block direct public access.

- [ ] **Step 5: Monitor deployment**

Wait for terminal success. Verify:

```bash
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
curl -fsS http://127.0.0.1:8308/api/health
curl -fsS http://127.0.0.1:8308/api/status
```

Expected: healthy container and six public components.

- [ ] **Step 6: Enable auto-deploy**

Enable after candidate verification. Keep previews disabled.

- [ ] **Step 7: Commit operational identifiers**

Record Coolify UUID, final port mapping, limits, repository, branch, health endpoint, and rollback revision in `docs/operations.md`. Commit and push.

---

### Task 11: Configure DNS, TLS, and Nginx

**Files:**
- Create: `/etc/nginx/sites-available/status.viperisuseful.cc`
- Create symlink: `/etc/nginx/sites-enabled/status.viperisuseful.cc`
- Modify: `/home/ubuntu/AGENTS.md`
- Modify: `/home/ubuntu/docs/coolify-operations.md`

**Interfaces:**
- Produces public `https://status.viperisuseful.cc`.

- [ ] **Step 1: Repeat routing preflight**

```bash
git -C /home/ubuntu/viper-status status --short --branch
git -C /home/ubuntu/viper-status diff
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
sudo nginx -t
sudo ss -lntp
sudo ufw status numbered
df -h /
docker system df
```

Require disk below 80% and port 8308 owned only by candidate.

- [ ] **Step 2: Create protected routing backup**

Create `/home/ubuntu/backups/viper-status/<UTC timestamp>/` mode 700 containing:

```text
Coolify PostgreSQL named-table dump
affected Nginx files
sanitized resource map
UFW status
listener inventory
SHA256SUMS
```

Artifacts mode 600. Validate the compressed dump and checksums. Do not print secrets or full Coolify models.

- [ ] **Step 3: Create Cloudflare record**

Create proxied A record `status.viperisuseful.cc` pointing at this Oracle VM. Do not change other records.

- [ ] **Step 4: Stage HTTP Nginx site**

Create an HTTP-only server for ACME and temporary redirect. Follow existing site conventions. Test:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

- [ ] **Step 5: Issue certificate**

Use Certbot for exactly `status.viperisuseful.cc`. Record lineage and renewal state. Do not modify unrelated certificates.

- [ ] **Step 6: Install final Nginx site**

Final upstream:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name status.viperisuseful.cc;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name status.viperisuseful.cc;

    ssl_certificate /etc/letsencrypt/live/status.viperisuseful.cc/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/status.viperisuseful.cc/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://127.0.0.1:8308;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_read_timeout 65s;
    }
}
```

Enable symlink, run `sudo nginx -t`, then reload.

- [ ] **Step 7: Verify public behavior**

```bash
curl -fsS https://status.viperisuseful.cc/api/health
curl -fsS https://status.viperisuseful.cc/api/status
curl -fsSL -o /dev/null -w '%{http_code}\n' https://status.viperisuseful.cc/
curl -fsSI http://status.viperisuseful.cc/ | rg -i '^location:'
```

Expected: health 200, six-component status JSON, homepage 200, HTTP redirects to HTTPS.

- [ ] **Step 8: Browser verify production**

Repeat desktop/mobile/light/dark Browser/IAB verification against production. Confirm live Kuma data, theme control, incident empty state, and no mixed-content or console errors.

- [ ] **Step 9: Document authoritative resource map**

Add `status.viperisuseful.cc` to `/home/ubuntu/AGENTS.md` and `/home/ubuntu/docs/coolify-operations.md` with manager, repository, branch, port, health endpoint, DNS, TLS lineage, monitor source, credit cadence, and rollback.

- [ ] **Step 10: Final routine verification**

Run all existing routine checks from `/home/ubuntu/AGENTS.md` plus status site checks. Treat the existing `protocol options redefined` warnings as known only if no new warning appears.

- [ ] **Step 11: Final Git state**

Commit and push operational documentation in the repository. Confirm:

```bash
git status --short --branch
git log -1 --oneline
```

Expected: clean branch matching `origin/main`.

---

## Plan Self-Review

- Spec coverage: product scope, data source, paid API cadence, status model, incidents, brand, accessibility, security, tests, Coolify, Nginx, DNS, TLS, backups, verification, and rollback each map to a task.
- Placeholder scan: no unresolved markers or unspecified error-handling steps remain.
- Type consistency: `StatusState`, `PublicComponent`, `StatusDocument`, `fetchKumaSnapshot`, `normalizeSnapshot`, and route shapes are defined once and consumed with matching names.
- Scope: one deployable status product. Monitor setup and hosting are required dependencies, not independent products.
