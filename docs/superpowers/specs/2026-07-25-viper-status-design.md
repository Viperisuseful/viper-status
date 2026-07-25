# Viper Status Design

## Summary

Build a custom public status site at `https://status.viperisuseful.cc`. The site uses Uptime Kuma as its operational source while presenting a ViperCapture-aligned interface inspired by the clarity of OpenAI Status and Discord Status.

Only customer-facing products appear:

- Portfolio
- ViperCapture
- ViperCapture API
- Turtle Cave
- QuickRunLab
- QuickRunLab API

TinyAuth, Coolify, Vaultwarden, ViperSearch, Zipline, legacy redirects, and other infrastructure stay private from this page.

## Architecture

### Application

Use Next.js App Router, TypeScript, Tailwind CSS v4, and shadcn/ui. Deploy as one Dockerized Node application through Coolify.

The browser calls only same-origin application routes. A server-side adapter fetches Uptime Kuma public status endpoints, validates their responses, normalizes monitor names into six public components, and returns a stable status document.

No Uptime Kuma API key, dashboard session, ViperCapture API key, or monitor header reaches browser JavaScript.

### Uptime Kuma source

Create one published Uptime Kuma status page with a stable slug. Attach only monitors needed by the six public components. The custom site consumes:

- `GET /api/status-page/:slug`
- `GET /api/status-page/heartbeat/:slug`
- `GET /api/status-page/:slug/incident-history`

Uptime Kuma remains the operator interface for incidents and maintenance.

### Caching and refresh

- Server fetch cache: 60 seconds
- Browser refresh: 60 seconds while page is visible
- Requests use a bounded timeout
- Last successful document remains visible during a temporary upstream failure
- Data older than 3 minutes displays a stale warning
- No successful document displays the explicit unavailable state

## Monitor Design

### Portfolio

Use the existing Viper Hub monitor at `https://viperisuseful.cc/`.

### ViperCapture

Use the existing homepage monitor at `https://capture.viperisuseful.cc/`.

### ViperCapture API

Aggregate two monitors into one public component:

1. Route and authentication monitor every 60 seconds. It calls the production API route without valid authorization and accepts the documented authentication response.
2. Functional PNG render every 6 hours. It renders `https://example.com` at a small viewport with the supplied ViperCapture API key.

The functional check costs about 120-124 credits per month. Current live documentation advertises 1,500 monthly Free credits, and the validation render showed 1,449 remaining after one successful one-credit request. Failed, timed-out, and cancelled renders release reserved credits according to the live documentation.

The public component is operational only when the route monitor is healthy and the latest functional render is healthy. A slow six-hour functional cadence protects credits and rate limits.

### Turtle Cave

Use the existing database-aware health monitor at `https://turtlecave.xyz/health` and require `"db":"ok"`.

The Discord worker remains internal because the public component requested is Turtle Cave.

### QuickRunLab

Use the existing homepage monitor at `https://quickrunlab.tech/`.

### QuickRunLab API

Add a monitor for the real Socket.IO polling handshake:

`https://quickrunlab.tech/socket.io/?EIO=4&transport=polling`

Require HTTP 200 and a valid Engine.IO open packet signature.

## Status Model

Normalize Uptime Kuma heartbeat states:

- Up: operational
- Down: outage
- Maintenance: maintenance
- Pending or missing: unknown

For aggregated components:

- Any down child makes the component outage
- Maintenance without outage makes the component maintenance
- Unknown without outage makes the component unknown
- All required children up makes the component operational

Overall state:

- All operational: All systems operational
- Mix of operational and non-operational: Some systems degraded
- All non-operational or source unavailable: Service disruption
- Planned maintenance only: Maintenance in progress

State always includes an icon and text. Color is secondary evidence.

## Data Available

Uptime Kuma public status endpoints expose:

- Status-page component configuration
- Active incident and maintenance information
- Up to 100 recent heartbeat records per monitor
- 24-hour uptime
- Paginated incident history

They do not expose reliable 90-day daily aggregates. The first release must not fabricate a 90-day bar. It displays 24-hour uptime, recent checks, and real incident history. Longer historical aggregation is a separate future feature.

## Interface

### Header

Use the Viper mark and `Viper Status`. Include a portfolio link and compact system-theme control. Keep desktop navigation on one line.

### Overall state

Use one full-width status panel near the top. It states the overall condition in plain language and shows the last refresh time.

### Active incidents

Render active incident or maintenance content directly below the overall state. Use shadcn Alert composition. Hide the section when empty.

### Services

Use one open service group with six rows. Each row includes:

- Product name
- Current state label and icon
- 24-hour uptime
- Recent-check rail with accessible detail

Do not wrap each row in a separate floating card. Use separators inside one purposeful surface.

### Incident history

Show current-month incident history first, then older entries when available. Use plain dates, state, title, and updates. If no incidents exist, show a calm empty state without claiming an unsupported uptime period.

### Footer

Link to the Viper portfolio and identify Uptime Kuma as the monitoring source. Do not expose the hosted Kuma dashboard URL.

## Visual System

Preserve ViperCapture tokens:

- Viper Sans
- Cobalt primary
- Cool near-white light surface
- Near-black dark surface
- 14px panel radius
- Quiet borders
- System light and dark themes

Healthy green, degraded amber, outage red, maintenance blue-gray, and unknown gray are semantic-only colors.

Motion is limited to state feedback and 150-200ms transitions. Reduced motion disables nonessential transitions.

## Error Handling

- Invalid Kuma payload: reject and use last successful document
- Kuma timeout or 5xx: show stale document when present
- No cached document: show unavailable state with retry action
- Partial monitor mapping: affected public component becomes unknown
- Incident-history failure: keep service states visible and label history unavailable
- ViperCapture functional check failure: failed request should not settle credits under documented behavior

Errors remain server-side. Client messages never contain credentials, upstream stack traces, or raw monitor configuration.

## Security

- Keep all credentials in Uptime Kuma or protected Coolify environment variables
- Never serialize monitor request headers to the client
- Use strict response schemas for Kuma data
- Add security headers through Next.js or Nginx
- Do not expose internal monitor names or IDs beyond the minimum normalized response
- Keep application port local-only where Coolify supports it
- If Coolify requires a public Docker mapping, add IPv4 and IPv6 `DENY FWD` rules before DNS cutover

## Hosting

- Repository: `Viperisuseful/viper-status`
- Production branch: `main`
- Manager: Coolify Git application through `coolify-oraclevm`
- Preview deployments: disabled
- Candidate host port: choose an unused port at deployment preflight, expected `8308`
- Public router: host Nginx
- DNS and proxy: Cloudflare
- Domain: `status.viperisuseful.cc`
- Health endpoint: `/api/health`

Coolify Traefik remains disabled.

## Testing

### Unit

- Kuma response validation
- Monitor-to-component mapping
- Aggregated state precedence
- Overall status calculation
- Data freshness calculation
- Incident normalization

### Component

- Loading, operational, degraded, outage, maintenance, unknown, stale, empty, and error states
- Keyboard and screen-reader labels
- Light and dark token parity

### Integration

- Mock Kuma endpoints
- Real published Kuma status endpoints
- ViperCapture paid monitor request
- QuickRunLab Socket.IO handshake
- Cache and stale fallback behavior

### Browser

- Desktop and narrow mobile layout
- 200% zoom
- System light and dark modes
- Reduced motion
- No horizontal overflow
- Visible focus
- Core refresh and retry interaction

### Deployment

- Container health
- Candidate local port
- Nginx configuration
- Public HTTPS
- Cloudflare path
- Real normalized status payload
- One complete page render with live Kuma data
- Lighthouse and accessibility scan

## Rollback

Retain the previous application image and Git revision until public verification passes. Roll back application revision first, then Nginx upstream, then DNS only if the origin layer is implicated. Never enable Coolify Traefik.
