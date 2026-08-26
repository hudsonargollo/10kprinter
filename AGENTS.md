# Agent Instructions

10kprinter (public brand: MoneyMachine) — Cloudflare Workers + Hono + D1 + R2 lead-gen/audit/PRD
pipeline. Production route: `1kprint.clubemkt.digital`.

## Commands

- Typecheck: `npx tsc --noEmit -p .`
- Build (landing + dashboard sub-apps): `npm run build`
- Deploy: `npm run deploy` (builds then `wrangler deploy`)
- DB migration (remote): `wrangler d1 migrations apply 10kprinter --remote`
- DB migration (local): `wrangler d1 migrations apply 10kprinter --local`

## Always do

- Typecheck (`npx tsc --noEmit -p .`) before considering any TypeScript change done.
- Verify a prompt-template change (anything in `src/verticals/*.ts`) with a real generation call
  before claiming it works — a throwaway `tsx` script calling `generateStructuredGemini` directly
  against the keys in `.dev.vars` is enough; don't just eyeball the prompt text.
- Keep every vertical's `prdTemplate` grounded in real scraped/audit data — see
  `src/verticals/guardrails.ts`'s `PRD_NEGATIVE_GUARDRAILS` for the exclusion list every vertical
  must include.

## Ask first

- Any `wrangler deploy` or `wrangler secret put` against the live environment.
- Any git commit or push.
- Any change to pricing bounds (`PRD_SCHEMA` in `src/workflows/leadPipeline.ts`), or to
  `PRD_NEGATIVE_GUARDRAILS`.
- Adding a new third-party API dependency/secret to the Workflow pipeline.

## Never

- `wrangler d1 execute --remote` with a destructive statement (DROP/DELETE without a WHERE, or any
  UPDATE without one) against the production database without the user confirming the exact
  statement first.
- Commit `.dev.vars` or any real API key/secret.
- Generate an image/video asset depicting the real business's people, premises, or product as if
  photographed — generated visuals must stay abstract/brand-driven only (see
  `design/VISUAL_PROMPT_LIBRARY.md`).
