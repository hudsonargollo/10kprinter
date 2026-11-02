# Niche Engine & Webkit Builder Pipeline — Refined PRD

Status: draft v2 (refined 2026-11-01)
Supersedes: original PRD v1 (assumed a `/api/v1` Krikkit API that does not exist)

---

## 1. What changed from v1, and why

Every correction below was verified against the running systems, not assumed.

| # | v1 claim | Verified reality | Consequence |
|---|---|---|---|
| 1 | API base `https://webkit.clubemkt.digital` | **No DNS record.** Real host is `https://web.clubemkt.digital` (nginx → `172.17.0.1:8100`) | All endpoint paths in v1 are invalid |
| 2 | `POST /api/v1/projects/generate` exists | Krikkit has **no `routes/api.php`**, no Sanctum/Passport, no API middleware group. Only `web` + `dashboard` are registered | The contract must be **built into Krikkit**, not consumed |
| 3 | "MoneyMachine Middleware (Laravel/Node API)" | MoneyMachine is **Hono on Cloudflare Workers** (`src/index.ts`), D1 + R2 + Workflows | No separate middleware service; logic goes in a Workflow |
| 4 | `BigInt auto-increment` PKs | D1 is SQLite; the codebase uses `TEXT PRIMARY KEY` + `crypto.randomUUID()` (`newId()`) | Schema rewritten to match existing conventions |
| 5 | NVS = `(0.4V + 0.4M) / (C + 0.1)` | Unbounded — approaches 400 as competition → 0, so a 65 threshold stops discriminating | Replaced with a bounded 0–100 formula (§4) |
| 6 | `publish_immediately: true` | Krikkit publishing is per-user, session-authenticated, and custom hosts require `custom_host_verified_at` | Immediate publish is not achievable as written; see §5.4 |
| 7 | SearXNG assumed live | **No SearXNG container exists** on the host | Must be deployed before P2 (§8) |

### Product-direction note

MoneyMachine today hunts local businesses that **already have a weak site**, audits it, and pitches a redesign (`runHunterCycle` → `LEAD_PIPELINE`). This PRD builds **new** sites for a **discovered niche**. Different motion, different inputs, different output. It must be a separate `NichePipeline` Workflow — not bolted onto `LEAD_PIPELINE`.

Reusable as-is: `src/lib/nichePackage.ts` (24 verticals, multilingual seed variants), `src/lib/db.ts` patterns, LLM clients, R2, Browser Rendering, and the `newId()` convention.

---

## 2. Revised architecture

```
┌──────────────────────────────────────────────────────────────┐
│ MoneyMachine — Cloudflare Worker (Hono + D1)                 │
│                                                              │
│  cron ──► NichePipeline (Workflow)                           │
│              │                                               │
│              ├─ 1. discoverCandidates(seeds)                 │
│              │      └─► SearXNG  (self-hosted, JSON API)     │
│              │                                               │
│              ├─ 2. score → niche_opportunities (D1)          │
│              │                                               │
│              ├─ 3. select NVS ≥ 65, rate-limit gate          │
│              │                                               │
│              ├─ 4. POST /api/v1/projects  ───────────┐       │
│              │                                        │       │
│              ├─ 5. poll generation status             │       │
│              │                                        ▼       │
│              ├─ 6. POST /api/v1/projects/{id}/publish  Krikkit│
│              │                                        (Laravel│
│              ├─ 7. verify live URL (HTTP 200)         +Livewire│
│              │                                        +MySQL) │
│              └─ 8. persist → generated_websites (D1)  │       │
│                                                       │       │
│  webhook  ◄──── POST /api/webhooks/krikkit ───────────┘       │
│  (HMAC-SHA256 signed)                                         │
└──────────────────────────────────────────────────────────────┘
```

Ownership boundary: **MoneyMachine owns discovery, scoring and orchestration. Krikkit owns generation and publishing.** Neither reaches into the other's database.

---

## 3. Niche discovery (MoneyMachine)

### 3.1 Inputs

| Field | Type | Default | Notes |
|---|---|---|---|
| `seeds` | `string[]` | `NICHE_PACKAGE[*].queryVariants` | Explicit list overrides the package |
| `geo` | `string` | `US` | Passed to SearXNG as a locale hint |
| `language` | `string` | `en` | SearXNG `language` param |
| `minNvs` | `number` | `65` | Viability gate |
| `maxPerRun` | `number` | `10` | Hard ceiling, see §7.1 |

### 3.2 SearXNG contract

```
GET {SEARXNG_URL}/search
  ?q=<seed>
  &format=json
  &categories=general
  &language=<lang>
  &pageno=1
```

Requirements on the SearXNG instance:

- `search.formats` in `settings.yml` must include `json` (disabled by default — this is the most common integration failure).
- Rate limiting must be relaxed for the MoneyMachine egress IP, or the instance sits behind the same network.
- Engines should exclude ones that aggressively block datacenter IPs.

Failure policy: if any seed errors, log and continue — a partial batch is still valuable. If **all** seeds fail, abort the run rather than persisting zero-scored rows.

### 3.3 Metric definitions

All three normalize to **0–100** before scoring.

**V — demand.** SearXNG does not return search volume. V is a *proxy*, and the record says so (`volume_confidence = 'proxy'`).

```
resultCount  = results.length
reported     = number_of_results  (present on some engines; 0 when absent)

V = clamp(100 * log10(1 + max(resultCount, reported)) / log10(1 + P95_batch), 0, 100)
```

where `P95_batch` is the 95th-percentile count across the current batch. Batch-relative normalization means scores are comparable within a run, not across runs. **This is the single biggest data-quality weakness in the design** and the main reason to migrate to a real keyword provider later (§9).

**C — competition.** Share of the top 10 results whose domain is commercial or aggregator-like (directories, marketplaces, paid listings, national chains).

```
C = 100 * (commercialResults / top10Count)
```

Country-code TLDs that match neither geo nor language count as informational.

**M — monetization.** Share of the top 10 results whose title or snippet contains a high-intent modifier from the list in `src/lib/nichePackage.ts` plus: `buy`, `best`, `price`, `cost`, `near me`, `quote`, `hire`, `service`, `cheap`, `emergency`.

```
M = 100 * (highIntentResults / top10Count)
```

### 3.4 Discovery step

1. Fan out over seeds with a concurrency cap of 4.
2. Dedupe on normalized domain across seeds.
3. Use the top-10 organic results per seed for C and M.
4. Optionally refine the niche label via LLM from the aggregated result titles — one call per surviving seed, not per result. Skip entirely if `NVS < 50` (not worth the tokens).

---

## 4. Niche Viability Score — v2

```
NVS = round(0.40 * V + 0.40 * M + 0.20 * (100 - C))
```

Bounded 0–100, monotonic in every dimension, and `65` actually means "top third". Competition is inverted because a crowded SERP is a worse entry point, not a better one.

Comparison against v1 on the same inputs:

| V | M | C | v1 | v2 |
|---|---|---|---|---|
| 50 | 50 | 50 | 78.4 ✗ (passes) | 50 ✗ (fails) |
| 80 | 70 | 20 | 71.4 | 80 ✓ |
| 90 | 90 | 5 | 353 ✗ | 81 ✓ |

v1 scores a mediocre niche at 78 and a great one at 71 — the threshold carried no signal.

**Gate:** `NVS >= 65` marks the row `accepted`. Everything else stays `rejected` with its scores preserved for later analysis.

---

## 5. Krikkit integration — the contract to build

> **Superseded by [`KRIKKIT_BUILD_API.md`](./KRIKKIT_BUILD_API.md).** The API was widened to cover both MVP sites and one-page proposals, with wildcard-subdomain publishing. That document is authoritative; §5.1–§5.5 below are kept only for the reasoning trail and should not be implemented from.

This does not exist yet. It is a Krikkit-side deliverable (Laravel), and it is the critical path.

### 5.1 Router registration

`bootstrap/app.php` registers only `web` and `dashboard`. Add:

```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    api: __DIR__.'/../routes/api.php',
    ...
)
```

The `api` group carries no session or CSRF, which is required here — the current CSRF exemption list only covers `webhooks/stripe` and `webhooks/paypal`.

### 5.2 Authentication

Krikkit has no Sanctum/Passport. Add a minimal token guard rather than a new package:

- New table `api_tokens (id, name, token_hash, last_used_at, created_at)`.
- Middleware `auth.apikey` reads `X-MoneyMachine-Key`, compares `hash('sha256', $key)` with `token_hash` using `hash_equals`.
- Register the alias in `bootstrap/app.php`.
- One token per environment; rotation = insert new row, flip the old one.

Never store the plaintext token. Never log it.

### 5.3 Endpoints

All paths under `/api/v1`, all requiring `auth.apikey`.

**`POST /api/v1/projects`** → `202 Accepted`

```json
{
  "title": "Solar Clean Pro - Miami",
  "niche": "Solar Panel Cleaning Services",
  "seed_keyword": "solar panel cleaning miami",
  "target_audience": "Homeowners with residential solar setups",
  "locale": "en",
  "design_brief": {
    "theme": "Clean, Modern, Eco-Friendly",
    "primary_color": "#0ea5e9",
    "sections": ["Hero", "Features", "Pricing/Quotes", "Testimonials", "Contact Form"],
    "seo_keywords": ["solar cleaning", "panel maintenance", "residential solar service"]
  }
}
```

Headers: `Idempotency-Key: <niche_opportunity id>`. Krikkit stores it with a unique index and returns the existing project on replay — no duplicate generation.

Response:

```json
{
  "status": "queued",
  "project_id": "proj_98234712",
  "status_url": "/api/v1/projects/proj_98234712"
}
```

**`GET /api/v1/projects/{project_id}`** → status

```json
{ "status": "generating", "progress": 60, "error": null }
```

Status enum: `queued | generating | ready | publishing | live | failed`.

**`POST /api/v1/projects/{project_id}/publish`** → `202`

Body: `{ "subdomain": "solar-clean-miami" }`. Returns the same status object. Publish runs async; poll until `live` or `failed`.

**`DELETE /api/v1/projects/{project_id}`** → cleanup for rejected niches.

### 5.4 Publishing constraints (real, not assumed)

- `LabProject` is owned by `user_id`; publishing calls `LabPublicationManager::saveAndPublish($project, $request->user(), ...)`. A **service account user** must own all MoneyMachine-generated projects — decide which account, and record it in config.
- `LabPublication` carries `custom_host_verified_at` and `published_at`. Custom subdomains need verification; `publish_immediately: true` from v1 is not achievable. The API must expose the verification state, and MoneyMachine must treat `pending_verification` as a non-final state.
- Generation costs credits (`credits_spent` on `LabProject`). The service account needs a credit balance, and MoneyMachine's 10/hour ceiling exists partly to protect it.

### 5.5 Callback

`POST {MONEY_MACHINE}/api/webhooks/krikkit` with:

```
X-Krikkit-Signature: sha256=<hex hmac of raw body, key = KRIKKIT_WEBHOOK_SECRET>
```

Body: `{ "project_id", "status", "live_url", "error" }`.

MoneyMachine verifies the HMAC over the **raw** body before parsing. Replay protection: reject if `X-Krikkit-Timestamp` is more than 5 minutes old.

The callback is an optimization, not a dependency — `NichePipeline` polls regardless, so a dropped webhook delays nothing.

---

## 6. Data model (D1)

New migration `0010_niche_engine.sql`.

```sql
CREATE TABLE niche_opportunities (
  id                 TEXT PRIMARY KEY,
  seed_term          TEXT NOT NULL,
  discovered_niche   TEXT NOT NULL,
  geo                TEXT NOT NULL DEFAULT 'US',
  language           TEXT NOT NULL DEFAULT 'en',
  demand_score       REAL NOT NULL,
  competition_score  REAL NOT NULL,
  monetization_score REAL NOT NULL,
  viability_score    REAL NOT NULL,
  volume_confidence  TEXT NOT NULL DEFAULT 'proxy',
  status             TEXT NOT NULL DEFAULT 'pending',
  created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_niche_status ON niche_opportunities(status, viability_score DESC);
CREATE UNIQUE INDEX idx_niche_seed ON niche_opportunities(seed_term, geo, language);

CREATE TABLE generated_websites (
  id                  TEXT PRIMARY KEY,
  niche_id            TEXT NOT NULL REFERENCES niche_opportunities(id),
  krikkit_project_id  TEXT,
  subdomain           TEXT,
  live_url            TEXT,
  status              TEXT NOT NULL DEFAULT 'draft',
  attempts            INTEGER NOT NULL DEFAULT 0,
  last_error          TEXT,
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_generated_status ON generated_websites(status);
CREATE UNIQUE INDEX idx_generated_project
  ON generated_websites(krikkit_project_id)
  WHERE krikkit_project_id IS NOT NULL;
```

Notes:

- `status` is `TEXT` with a `CHECK` constraint, matching how the existing tables encode enums (`leads.status`, `proposals.status`). D1 has no native enum.
- `idx_niche_seed` is what makes re-runs idempotent — a seed already scored today is skipped, not re-queried.
- Scores are stored individually, not just as `viability_score`. Without the components you cannot debug why a niche scored 66.

---

## 7. Execution flow

### 7.1 Rate limiting

Before every dispatch:

```sql
SELECT COUNT(*) FROM generated_websites
WHERE created_at > datetime('now', '-1 hour')
```

If `>= 10`, defer to the next run. Enforced in MoneyMachine, not Krikkit — the ceiling protects Krikkit's credits and the search infrastructure, so the orchestrator owns it.

### 7.2 Retry policy

| Failure | Policy |
|---|---|
| SearXNG error, single seed | Log, continue batch |
| SearXNG error, all seeds | Abort run, alert |
| Krikkit `5xx` | 3 attempts, exponential backoff (30s → 2m → 8m) |
| Krikkit `4xx` | No retry — bad payload. Mark `failed`, store `last_error` |
| Generation timeout (> 10 min) | Mark `failed`, surface for manual review |
| Verification non-200 | 3 checks over 2 minutes before marking `failed` |

### 7.3 Workflow steps

`NichePipeline` as a Cloudflare `WorkflowEntrypoint`, bound as `NICHE_PIPELINE`:

1. `loadSeeds` — resolve config, skip seeds scored in the last 24h
2. `discover` — SearXNG fan-out, concurrency 4
3. `score` — NVS v2, persist to `niche_opportunities`
4. `select` — top N with `NVS >= 65`, respecting the rate gate
5. `dispatch` — `POST /api/v1/projects` per niche, `Idempotency-Key` = niche id
6. `poll` — until `ready` or timeout
7. `publish` — `POST /publish`
8. `verify` — HTTP 200 on `live_url`, plus title contains the niche
9. `record` — update `generated_websites`

Separate cron entry from the existing daily `runHunterCycle` — they share nothing but the D1 binding. Suggested cadence: weekly, since niche demand does not move daily and each run spends generation credits.

### 7.4 Logging

Reuse `pipeline_events` (`id, lead_id, stage, status, message, created_at`)? **No** — `lead_id` is `NOT NULL` with an FK to `leads`, so niche runs cannot write to it without polluting the leads table.

Add a parallel table:

```sql
CREATE TABLE niche_events (
  id          TEXT PRIMARY KEY,
  niche_id    TEXT,
  stage       TEXT NOT NULL,
  status      TEXT NOT NULL,
  message     TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_niche_events_niche ON niche_events(niche_id);
```

---

## 8. Configuration

| Name | Kind | Value |
|---|---|---|
| `SEARXNG_URL` | var | to be set at deploy |
| `KRIKKIT_API_URL` | var | `https://web.clubemkt.digital` |
| `KRIKKIT_API_KEY` | secret | `wrangler secret put` |
| `KRIKKIT_WEBHOOK_SECRET` | secret | `wrangler secret put` |
| `NICHE_MIN_NVS` | var | `65` |

---

## 9. Phases

| Phase | Scope | Depends on |
|---|---|---|
| **P0** | Fix `web.clubemkt.digital` branding — root renders the **Agendaya** landing page from DB-driven `SiteSettings`/`PageSeo`, not Krikkit's own. Content bug, not routing; the host already reaches `:8100` correctly | — |
| **P1** | Krikkit API: `api.php`, `api_tokens`, `auth.apikey`, project create/poll/publish/delete, webhook emitter | Service account + credits |
| **P2** | Deploy SearXNG with JSON format enabled and relaxed limits | — |
| **P3** | MoneyMachine: migration `0010`, SearXNG client, NVS v2, `NichePipeline`, rate gate | P1, P2 |
| **P4** | Webhook receiver, verification, dashboards | P3 |

P1 and P2 are independent and can run in parallel. P3 is blocked by both.

---

## 10. Open decisions

1. **Service account in Krikkit.** Which user owns machine-generated projects, and who tops up its credits?
2. **Subdomain vs custom domain.** Verification is required for custom hosts. Decide whether generated sites live on a shared wildcard subdomain (fast, no verification) or per-project custom hosts (verification flow required).
3. **What happens to rejected niches.** Keep at 0 cost for analysis, or delete? Recommendation: keep — the score history is the only way to tune `minNvs`.
4. **Volume provider.** SearXNG proxy is good for ranking *relative* demand across seeds in a batch, useless for absolute numbers. If absolute volume drives pricing decisions, budget for DataForSEO or Keyword Planner.
5. **Re-run policy.** If a niche is `live`, does a later higher score trigger a rebuild? Recommendation: no — a rebuild needs a manual decision.

---

## 11. Risks

- **SearXNG blocks.** Datacenter IPs get rate-limited by upstream engines quickly. Mitigation: restrict engine list, keep concurrency at 4, cache results per seed per day.
- **Proxy volume misleads.** `V` reflects SERP saturation as much as demand. The `volume_confidence` field exists so this is visible in the data rather than hidden in a comment.
- **Generation quality.** The pipeline can publish a lot of mediocre sites quickly. Rate limiting is the only guardrail until a quality gate exists — consider a manual `accepted → building` transition for the first runs.
- **Cost.** Each run spends Krikkit credits plus LLM tokens. 10 niches/hour is 240/day if left unattended.
