# Krikkit Build API — contract for MoneyMachine

Status: draft v1 (2026-11-01)
Consumer: MoneyMachine (Cloudflare Worker, `10kprinter`)
Provider: Krikkit (`https://web.clubemkt.digital`, Laravel 12 + Livewire 4)

---

## 1. Purpose

Let MoneyMachine trigger Krikkit builds without a human leaving the MoneyMachine UI. Two build kinds share one pipeline:

| Kind | Output | Published as |
|---|---|---|
| `site` | Multi-section MVP business site | `https://<slug>.<LAB_PUBLISH_DOMAIN>` |
| `proposal` | Persuasive one-page pitch site | `https://<slug>.<LAB_PUBLISH_DOMAIN>` |

Both are `LabProject`s driven by the same AI engine. They differ only in prompt contract and default section structure.

Triggers inside MoneyMachine: an existing **lead** (audit data available) or a **niche opportunity** (no lead yet).

---

## 2. Where the work actually is

The API is not a thin wrapper. Today the browser orchestrates generation:

```
Browser ──POST /lab/chat──► ChatGateway ──► provider
        ◄──SSE: tool calls──
        ──POST /lab/files──► LabFilesController ──► SiteWorkspace::write()
```

The AI emits `write_file` / `mkdir` / `delete` tool calls; **the JS client applies them**. There is no server-side runner — `routes/console.php` contains nothing, `app/Console/Commands` does not exist.

So the deliverable is:

```
API request ──► RunBuildJob (queue) ──► BuildRunner ──► ChatGateway::complete()
                                             │              (Planner → Executor)
                                             └──► SiteWorkspace::write()/commitAtomic()
                                                        │
                                                        └──► LabPublicationManager::saveAndPublish()
```

`BuildRunner` is the only genuinely new machinery. Everything else is wiring around services that already work.

---

## 3. Authentication

No Sanctum or Passport installed, and none needed. One table, one middleware.

`api_tokens`
```
id           bigint pk
name         varchar(100)
token_hash   char(64)      -- sha256 hex of the plaintext key
last_used_at timestamp null
created_at   timestamp
```

`AuthenticateApiKey` middleware:
- reads `X-MoneyMachine-Key`
- compares `hash('sha256', $key)` against `token_hash` with `hash_equals`
- touches `last_used_at`
- returns `401 {"message":"Invalid API key"}` on failure

Register `api` routing group and the `auth.apikey` alias in `bootstrap/app.php`. The `api` group has no session and no CSRF, which is required — today only `webhooks/stripe` and `webhooks/paypal` are exempt from CSRF.

Never store or log the plaintext key. Rotation = insert a new row, then revoke the old one.

---

## 4. Endpoints

Base: `https://web.clubemkt.digital/api/v1`
All require `X-MoneyMachine-Key`.

### 4.1 `POST /builds` → `202`

| Field | Type | Required | Notes |
|---|---|---|---|
| `kind` | `site` \| `proposal` | yes | Chooses the prompt contract |
| `title` | string | yes | Project title; also seeds the subdomain suggestion |
| `brief` | object | yes | See §5 |
| `model` | string | no | Defaults to `config('krikkit.build.model')` |

Header `Idempotency-Key: <uuid>` — unique index on `builds.idempotency_key`. Replaying the same key returns the original build with `200` instead of creating a second one.

```json
{ "id": "bld_01J...", "status": "queued", "poll_url": "/api/v1/builds/bld_01J..." }
```

### 4.2 `GET /builds/{id}`

```json
{
  "id": "bld_01J...",
  "kind": "site",
  "status": "building",
  "stage": "executor",
  "turns": 7,
  "files": 14,
  "preview_url": null,
  "live_url": null,
  "error": null
}
```

`status`: `queued | planning | building | ready | publishing | live | failed`
`stage`: `router | planner | executor | null` — surfaces where it stalled.

### 4.3 `POST /builds/{id}/publish`

```json
{ "subdomain": "solar-clean-miami" }
```

→ `202` with the same status object. Poll until `live` or `failed`.

Rules:
- only from `ready`
- subdomain must match `^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$`
- rejects reserved names from `config('lab.publish.reserved')`
- `409` if already `live` with the same subdomain, `422` if the subdomain is taken

### 4.4 `DELETE /builds/{id}`

Unpublishes if live, then deletes the workspace. Used when a niche is rejected after building.

---

## 5. Brief schema

### 5.1 `kind: "site"`

```json
{
  "niche": "Solar Panel Cleaning Services",
  "seed_keyword": "solar panel cleaning miami",
  "target_audience": "Homeowners with residential solar setups",
  "locale": "en",
  "design": {
    "theme": "Clean, Modern, Eco-Friendly",
    "primary_color": "#0ea5e9",
    "sections": ["Hero", "Features", "Pricing/Quotes", "Testimonials", "Contact Form"]
  },
  "seo_keywords": ["solar cleaning", "panel maintenance", "residential solar service"],
  "business": {
    "name": null,
    "phone": null,
    "address": null
  }
}
```

### 5.2 `kind: "proposal"`

Built from an existing lead, so `business` and `audit` carry real data.

```json
{
  "locale": "en",
  "business": { "name": "Acme Dental", "url": "https://acme.example", "phone": "+1..." },
  "audit": {
    "score": 42,
    "good": ["..."],
    "bad": ["..."],
    "fix": ["..."]
  },
  "offer": {
    "price_usd": 250,
    "consult_addon_usd": 100,
    "roadmap_days": 7
  },
  "design": { "primary_color": "#0ea5e9" }
}
```

The proposal prompt must inherit `PRD_NEGATIVE_GUARDRAILS` semantics from MoneyMachine: no invented testimonials, no fabricated metrics, no claims the audit did not support. **This is a hard requirement** — a proposal that invents results is worse than no proposal.

### 5.3 Prompt composition

`BuildBrief::toPrompt(kind)` produces the user message. Keep the mapping in one class so both kinds stay inspectable — do not bury prompt text in the controller.

---

## 6. BuildRunner

```
run(Build $build):
    workspace->ensure($project)

    plan = gateway->complete($model, [$brief], promptKey: 'lab', stage: Planner)
    messages = [$brief, assistant(plan.content)]

    for turn in 1..maxTurns:
        resp = gateway->complete($model, messages, promptKey: 'lab', stage: Executor)
        applied = applyToolCalls(resp.toolCalls)      // write_file, mkdir, delete
        recordTurn($build, $resp, $applied)

        if $applied->isEmpty() && $resp->isFinal():
            break
        messages[] = assistant($resp.content)
        messages[] = toolResults($applied)

    build->status = 'ready'
```

Guardrails — every one is mandatory:

| Limit | Value | Why |
|---|---|---|
| `maxTurns` | 40 | stops a runaway loop |
| wall clock | 10 min | queue job timeout |
| write bytes | 2 MB/file, 50 MB total | `LAB_PUBLISH_ARTIFACT_MAX_BYTES` already caps this |
| credit check | before first turn | `LabCreditMeter` — fail fast, not mid-build |
| repeated-error abort | 3 identical failures | prevents retry storms |

`RunBuildJob` runs on the **database queue that supervisor already starts**. Tries: 1 — a partially-written workspace should not be silently retried; surface `failed` and let MoneyMachine decide.

Cost is metered per turn. Store `tokens_in`, `tokens_out`, `tool_turns` on the build row so spend is attributable per lead/niche.

---

## 7. Publishing

Resolved differently from the original recommendation. The dedicated `sites.clubemkt.digital` base was **not** adopted; publishing runs on the apex wildcard:

```
LAB_PUBLISH_DOMAIN=clubemkt.digital
```

with a proxied `*` A record pointing at the origin (the VPS public IPv4; keep it out of public docs — it is behind Cloudflare precisely so it stays unpublished). This is live and verified end-to-end: a seeded publication at `smoke-test.clubemkt.digital` served HTML, CSS and JS correctly, returned 404 for unknown slugs and missing assets, and fell back to `index.html` on deep links.

Trade-off accepted: a typo'd subdomain now resolves and returns Krikkit's 404 instead of failing DNS. Explicit records still win over the wildcard, so the ~40 existing subdomains (`citasya`, `mimenu`, `agendaya`, …) are unaffected.

`ServeLabPublication` serves published sites straight from disk by Host — **no Node, no build step, no deploy**.

### How the API publishes (differs from the original sketch)

Do **not** call `LabPublicationManager::saveAndPublish()` from a headless build. It only moves the publication to `building` and waits for the **browser** to upload `dist/`; there is no browser on this path, so it would hang in `building` forever.

`BuildController::publish` instead:

1. Rejects non-`ready` builds (`409`), reserved names and duplicates (`422`).
2. Marks the publication `building` with the requested subdomain.
3. Zips the workspace with `File::allFiles()` (skipping `.krikkit-kit`) into a temp file.
4. Wraps it in an `UploadedFile` and calls `deployArtifact()`, which already does zip-slip-safe extraction into `storage/app/lab/live/<uuid>` and sets the publication `live`.
5. Stores `subdomain` + `live_url` on the build and returns `202`.

Same end state as the browser flow, reusing the audited deployer. `preview_url` stays `null` — the only URL a machine build has is the live one.

---

## 8. Service account

Krikkit publishing is per-user. Create one dedicated user, e.g. `builds@clubemkt.digital`:

- owns every machine-generated `LabProject`
- has `dashboard.access` ability
- has a credit balance, and a low-balance alert
- is **not** an admin

Config: `config('krikkit.build.service_user_id')`. Resolve to a `User` in the job; never trust a user id from the request body.

---

## 9. Callback

`POST {MONEY_MACHINE}/api/webhooks/krikkit`

```
X-Krikkit-Signature: sha256=<hex hmac of raw body>
X-Krikkit-Timestamp: <unix seconds>
```

Body: `{ "build_id", "krikkit_id", "status", "live_url", "error" }`

MoneyMachine verifies the HMAC over the **raw** body, rejects timestamps older than 5 minutes, and treats the callback as an optimization only — it polls regardless. Follows the existing pattern in `src/index.ts` for `theleadmachine-won`.

---

## 10. Prerequisites (in order)

1. **Snapshot Krikkit.** It is not a git repo. `git init` + initial commit, or a tarball pulled off the box, before a single line changes.
2. `LAB_PUBLISH_DOMAIN` + wildcard DNS.
3. Service account user + credits.
4. Fix the Agendaya branding on `web.clubemkt.digital` (P0 in the niche PRD) — otherwise every published site's builder origin looks wrong.

---

## 11. Implementation order

| Step | Files | Effort |
|---|---|---|
| 1. Snapshot + `git init` | — | minutes |
| 2. Token auth | `api_tokens` migration, `ApiToken`, `AuthenticateApiKey`, `bootstrap/app.php` | small |
| 3. `builds` table + model | migration, `Build` | small |
| 4. `BuildRunner` | `app/Lab/Build/BuildRunner.php`, tool-call applier | **the work** |
| 5. `RunBuildJob` + controller | `app/Jobs/RunBuildJob.php`, `Api/V1/BuildController.php` | medium |
| 6. Publish + subdomain validation | `BuildController::publish` | small |
| 7. Webhook emitter | `app/Lab/Build/BuildNotifier.php` | small |
| 8. MoneyMachine client + `website_builds` | `src/lib/krikkit.ts`, migration `0010` | medium |

Step 4 is where the risk lives: the tool-call applier must match what the browser does, or builds will produce files the preview cannot render. Validate by building one site end-to-end and opening it.

---

## Appendix — MoneyMachine side

One table serves both triggers:

```sql
CREATE TABLE website_builds (
  id                TEXT PRIMARY KEY,
  subject_type      TEXT NOT NULL CHECK (subject_type IN ('lead','niche')),
  subject_id        TEXT NOT NULL,
  kind              TEXT NOT NULL CHECK (kind IN ('site','proposal')),
  krikkit_build_id  TEXT,
  subdomain         TEXT,
  live_url          TEXT,
  status            TEXT NOT NULL DEFAULT 'queued',
  attempts          INTEGER NOT NULL DEFAULT 0,
  last_error        TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_website_builds_subject ON website_builds(subject_type, subject_id);
CREATE UNIQUE INDEX idx_website_builds_krikkit
  ON website_builds(krikkit_build_id) WHERE krikkit_build_id IS NOT NULL;
```

`subject_id` is intentionally not a foreign key — it points at `leads` or `niche_opportunities` depending on `subject_type`, and SQLite cannot express a conditional FK.
