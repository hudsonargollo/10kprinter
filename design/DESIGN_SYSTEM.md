# Showcase Page Design System

Reference doc for hand-building each lead's one-off showcase/demo page. Read this before starting one.
Every lead gets one of these built and linked via the Offer tab's showcase URL field — it's what gets sent
to the prospect first, before pain points or pricing.

## Two tiers of effort

- **Premium** — harder/bigger leads (multiple qualifying verticals, strong existing assets, clearly a bigger
  deal). Full custom design pass: bespoke layout, motion, maybe a Three.js hero moment if the business/product
  supports it. Use the `design` skill (Claude Design canvas) for these.
- **Standard** — everything else. Fast but still polished: apply the structure and rules below directly,
  lean on the component-level skills rather than inventing new layout each time.

Both tiers must hit the same floor: stunning visuals, clear conversion-driving UX, real content — never a
"nice mockup that's clearly fake."

## Inputs (always use real data, never placeholders)

- **Brand tokens** — `brand_tokens_json` on the lead's PRDs: primary/background/backgroundAlt/textOnPrimary/
  textOnBackground + rationale. Don't stop at these three swatches — run them through `algorithmic-color-palette`
  to derive hover/active states, borders, and semantic colors so the page doesn't look like a 3-color toy.
- **Scraped content** — real copy, testimonials, services, photos found on the business's actual site (from the
  scrape stored per lead). Follow `authentic-product-representation`: the hero, the offer, the testimonials must
  be this business's actual words/assets, not generic filler.
- **Audit findings** — the "good/bad/fix" per vertical already generated. The showcase page should visibly
  *fix* the specific "bad" items called out (e.g. if the audit flagged "no mobile optimization," the showcase
  page better be flawless on mobile).

## Required page structure

1. **Hero** — the single biggest "wow" moment. Real business name/value prop, high-contrast primary CTA.
   Apply `visual-emphasis-and-hierarchy` and `modular-scale-typography`.
2. **Proof strip** — testimonials/stats pulled from the actual scrape, not invented numbers.
3. **What changed** — a tight before/after or fix-list tied directly to the audit's "bad" → "fix" pairs for
   whichever vertical(s) this lead qualified for.
4. **Offer block** — the itemized $200 line item(s) this page is pitching + the $100 consult add-on, styled as
   an aggressive overdelivery, not a boring price table. Reuse `button-states` for the CTA states.
5. **CTA / consult hook** — close on booking the $100 strategy hour, framed as free-feeling relative to the
   value already shown above it.

## Process

1. Pull the lead's brand tokens, scraped summary, and qualifying audit findings from the dashboard.
2. For Premium tier: open the `design` skill and build the canvas from scratch using the structure above.
   For Standard tier: build directly following the structure above, still checking `component-family-consistency`
   and `elevation-and-depth` so it doesn't look flat/generic.
3. Publish (Artifact or wherever it ends up hosted) and paste the link into the lead's **Offer tab → Showcase
   page** field so it's tracked in the system.
4. Sales sequencing: showcase page first → audit pain points second → itemized offer third. Never lead with
   the audit.
