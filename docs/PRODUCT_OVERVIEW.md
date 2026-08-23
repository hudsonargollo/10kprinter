# TheLeadMachine — Product Documentation

Reference doc for competitor research. Describes what the product actually does today (not
aspirational), so it can be compared honestly against adjacent tools.

## One-line positioning

An autonomous system that finds local businesses with a weak digital presence, audits each one
like a paid conversion consultant would, writes a priced/itemized proposal automatically, and
tracks the resulting lead through a sales pipeline — built by a solo web-design/marketing
operator (Hudson) to run his own outbound motion without manual prospecting.

**Live URLs:**
- Marketing site: `https://1kprint.clubemkt.digital/`
- Internal ops dashboard: `https://1kprint.clubemkt.digital/app/`
- Also reachable at: `https://10kprinter.hudsonargollo2.workers.dev` (workers.dev fallback)

## The core pipeline

One Cloudflare Workflow instance per lead, five stages:

1. **Hunter** — queries Google Places (Text Search + Place Details) against a configured region +
   search query, dedupes against existing leads by `place_id`/URL, discards businesses with no
   website, inserts new `leads` rows.
2. **Scraper** — Cloudflare Browser Rendering (headless Chromium) loads the business's real site,
   captures a full-page screenshot + a cropped hero screenshot, extracts text/headings/meta/CTAs/
   image alt text/phone numbers/load time. Raw HTML and screenshots go to R2; only the R2 keys +
   a structured summary go to D1.
3. **Consultant (Audit)** — for each of 4 service verticals, Claude is given the scrape summary +
   a vertical-specific rubric and returns structured JSON: `qualifies` (bool), `score` (0-100,
   *opportunity* score — higher = weaker current site = more room to sell), and `good`/`bad`/`fix`
   findings arrays. A lead can qualify for 0-4 verticals independently.
4. **Architect (PRD + pricing)** — for each qualifying vertical, Claude writes a full PRD
   (objective, target audience, tech-stack recommendation, concrete features tailored to that
   specific business, design-token references) and returns a structured price for that line item
   (itemized ~$150-250, anchored at $200 — see Pricing below). A brand-token extraction pass also
   runs Claude vision against the hero screenshot to derive a primary/background color pairing.
5. **Designer (Showcase page)** — *manual, not automated*: for higher-value leads, a one-off
   polished demo landing page is hand-built (using the discovered brand tokens + real business
   content) and its URL is attached to the lead. This is deliberately NOT an autonomous LLM step —
   see `design/DESIGN_SYSTEM.md` for the process/design-language reference used when building one.

Terminal states: `prd_ready` (≥1 vertical qualified), `reviewed` (none qualified), `failed`
(unrecoverable error — see Reliability below).

## The 4 service verticals (audit + PRD templates)

Each has its own audit rubric and PRD template (`src/verticals/*.ts`), independently swappable:

| Vertical | What it audits for |
|---|---|
| Website Redesign | Conversion friction: decision fatigue, no lead capture, poor visual hierarchy, unprofessional assets, no mobile signals |
| Marketing Automation | Manual-process bottlenecks: no booking/CRM automation, "call us" as the only funnel |
| Email Marketing | No email capture/nurture path, no segmentation between offer types |
| Social Media Management | Untapped social presence relative to existing testimonial/asset quality, no WhatsApp click-to-chat |

## Pricing model

Deliberately **not** a flat multi-thousand-dollar engagement. Each qualifying vertical is its own
itemized line item, ~$150-250 (Claude-priced within that band, anchored at $200), framed as an
aggressive low-friction entry offer. A standing **+$100 add-on** ("1-hour strategy consultation
with Hudson") is offered on every lead. The dashboard's Offer tab shows each line item + the
add-on + a bundle total, and explicitly frames the cheapest item as the lead-in, stacking toward
the full bundle. Nothing is sold as a single large package by default — the bundle total emerges
from stacking small items.

## Sales pipeline / lead thermometer

Past `prd_ready`, a lead moves through CRM-style stages: `reviewed → proposal_sent → won | lost`
(plus a `lost → proposal_sent` reopen path), all logged to an append-only `pipeline_events` table.

- **Tier/score ("thermometer")** — computed automatically the moment audits finish, from the
  audit data itself (no separate qualification form): a weighted blend of average opportunity
  score among qualifying verticals (65%) and breadth of qualification across the 4 verticals
  (35%), thresholded into `hot` (≥68) / `warm` (≥45) / `cold`.
- **Notes** — free-text, its own column (deliberately never sharing a field with structured data).
- **WhatsApp click-to-chat** — a `wa.me` link built from the lead's phone number.
- **Won/Lost capture** — amount + close date on won, reason on lost.
- Board view groups automation-stage leads into one "In Progress" column and gives each sales
  column its own, sorted hottest-first.

## Hunt Wizard (self-serve discovery)

A dashboard wizard replacing manual API calls for running a new hunt session:

1. **Place** — Google Places-autocompleted city/region input (proxied server-side; the API key
   never reaches the browser).
2. **Niches** — a fixed 8-niche predefined package (Dental Clinics, Real Estate Agencies, Law
   Firms, Restaurants, Gyms, Auto Repair Shops, Beauty Salons, General Contractors — each with up
   to 3 query-variant synonyms tried in sequence to hit a target lead count) or custom niches.
   Chain-prone categories (e.g. hotel chains) are deliberately excluded — a franchisee doesn't
   control the corporate site, so there's no one to sell a redesign to.
3. **Review & Run** — live per-niche progress as sources are created and run.
4. **Outreach Interview** — a short Q&A (weekly follow-up capacity, niche priority order,
   preferred contact method) fed to Claude along with the actual discovered business names to
   generate a week-by-week markdown outreach/follow-up plan, stored per hunt session.

## Tech stack

- **Runtime**: single Cloudflare Worker (Hono for routing), no separate backend service.
- **Orchestration**: Cloudflare Workflows — one durable instance per lead, per-step retry with
  exponential backoff, `NonRetryableError` used to fail fast on unrecoverable errors (e.g.
  insufficient LLM API credits) instead of burning through retries.
- **Scraping**: Cloudflare Browser Rendering (`@cloudflare/puppeteer`).
- **Database**: Cloudflare D1 (SQLite), 5 migrations, ~10 tables.
- **Object storage**: Cloudflare R2 — raw HTML, screenshots, PRD markdown.
- **LLM**: Anthropic Claude, called directly via `fetch` (no SDK) — both plain-text generation
  (PRDs, outreach timelines) and tool-forced structured JSON (audits, brand tokens, pricing).
- **External data**: Google Places API (Text Search, Place Details, Autocomplete) — the only
  paid third-party dependency besides Anthropic.
- **Frontend (ops dashboard)**: React + Vite, hash-based routing (no router library), hand-rolled
  CSS custom properties (no Tailwind/component library) — served at `/app/*`.
- **Frontend (marketing site)**: separate React + Vite + Tailwind + shadcn/ui project, Three.js
  (`@react-three/fiber`) hero visual, Framer Motion scroll-reveal — served at `/` (site root).
  Built as its own sibling project specifically to avoid retrofitting Tailwind into the ops app.
- **Cron**: daily scheduled Hunter cycle across all `cron_enabled` lead sources.

## Data model (D1, 5 migrations)

- `lead_sources` — Hunter query configs (query, region, category, cron toggle, optional
  `hunt_session_id` tag).
- `leads` — core record: business identity, status, `tier`/`score`, `notes`, `lost_reason`,
  `closed_amount_usd`/`closed_at`, `showcase_url`.
- `scrapes` — per-lead scrape artifacts (R2 keys, extracted summary, load time).
- `audits` — per-lead-per-vertical findings + score + qualifies flag.
- `prds` — per-lead-per-vertical PRD (R2 markdown key, brand tokens, `price_usd`).
- `pipeline_events` — append-only log across every stage (automation *and* sales).
- `hunt_sessions` — one row per Hunt Wizard run (region, niches snapshot, target count).
- `outreach_timelines` — the generated week-by-week plan per hunt session.

## Full API surface

Leads: `POST/GET /api/leads`, `GET /api/leads/:id`, `GET .../prds/:prdId/markdown`,
`POST .../retry`, `GET .../screenshot`, `POST .../stage`, `PATCH .../notes`,
`PATCH .../showcase`, `PATCH .../status`.
Sources: `GET/POST /api/sources`, `PATCH/DELETE /api/sources/:id`, `POST .../run`.
Hunt: `POST/GET /api/hunt-sessions`, `GET /api/hunt-sessions/:id`,
`POST .../timeline`.
Utility: `GET /api/places/autocomplete`.

No authentication exists on any route today — a known, accepted gap given this is currently a
single-operator internal tool, not yet multi-tenant.

## Reliability notes

- Steps fail fast (`NonRetryableError`) on 400/401 API responses (bad request, insufficient
  credits, auth failure) instead of exhausting Workflows' default 5-retry exponential backoff —
  learned from a real incident where an Anthropic credit-balance exhaustion mid-batch took
  several minutes to finish failing out ~100 in-flight leads.
- `/retry` wipes and regenerates a lead's scrape/audit/PRD data from scratch (not incremental).
- Google Places Autocomplete/Text Search/Details are proxied server-side everywhere — no Google
  API key is ever shipped to the browser.

## Deliberately deferred (not built, tracked as future phases)

- **Multi-tenant / configurable playbooks** — today's 4 verticals and niche package are
  hardcoded for one operator's web-design/marketing business. Generalizing to other consultancy
  types (accounting, SEO, insurance, etc.) would mean turning verticals into per-tenant
  configurable playbooks plus real account isolation.
- **CRM cloning** — Hudson's own production CRM (a separate app, "Tektone Hub") has a mature
  lead-pipeline/sales-thermometer/WhatsApp-link system this project's Sales Pipeline phase
  reimplemented the *concepts* of natively rather than forking. A later phase would properly
  adapt/clone that CRM and eventually provision each won client their own instance.
- **Always-on WhatsApp/email nurture** — stage-triggered automated follow-up messaging,
  explicitly described by Hudson as "never gonna stop sending people offers" — depends on the
  CRM phase landing first.
- **Commissions/multi-closer payouts, RBAC/auth** — not needed while single-operator.

## What this is *not*

- Not a cold-email/data-enrichment platform (no email-finding, no bulk contact enrichment).
- Not a generic CRM (the sales-stage tracking is minimal by design, not a full pipeline builder).
- Not multi-tenant SaaS today — single operator, single Anthropic/Google Cloud billing account,
  no login system.
- Not a no-code/white-label tool for other agencies (yet) — see deferred phases above.
