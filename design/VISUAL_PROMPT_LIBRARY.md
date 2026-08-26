# Visual Asset Prompt Library

Reference for any generated image (autonomous pipeline step, or Hudson/Claude hand-building a
Premium-tier showcase page) so the same vocabulary and quality bar applies either way. Built from the
6-layer prompt anatomy — Subject → Style → Lighting → Camera/Composition → Color/Mood → Technical
modifiers — plus a negative-instruction clause folded into the positive prompt (Gemini's image models
don't take a separate negative-prompt field).

## Hard constraint (non-negotiable)

Every generated image must be **abstract/brand-driven only**. Never depict, or attempt to depict, this
business's actual people, premises, storefront, product, or logo — that would be a fabricated
"photo" of something real, which violates `authentic-product-representation` (see
`DESIGN_SYSTEM.md`). Real photography of the business comes only from the actual scrape.

## The recipe (used verbatim by `src/lib/proposal.ts`'s `buildCoverImagePrompt`)

- **Subject**: an abstract geometric/gradient composition — crystalline facets, flowing gradient
  planes, or a soft particle field. No literal objects, people, buildings, or readable text.
- **Style**: premium, minimal, tech-forward — the same register as the `MOTION_PATTERN_LIBRARY`
  archetypes in `src/verticals/website-redesign.ts` (liquid-glass / cinematic gradient look), not a
  generic stock-photo abstract.
- **Lighting**: soft directional glow, gradient light falloff, no harsh specular highlights.
- **Camera/Composition**: wide 16:9 hero-banner framing, subject filling the frame edge-to-edge, no
  vignette, no border.
- **Color/Mood**: the lead's own `BrandTokens.primary` and `BrandTokens.background` hex values, stated
  explicitly as the two dominant hues — this is what makes the image genuinely on-brand rather than a
  generic template.
- **Technical**: "4K, high detail, no text, no logos, no watermark, no readable signage, no people."

Example filled-in prompt (used by the pipeline, not to be copied verbatim — always substitute the
real brand tokens):
> Abstract crystalline geometric gradient composition, premium minimal tech aesthetic, soft
> directional glow lighting, wide 16:9 hero-banner framing filling the entire frame, dominant colors
> #1c6dd0 and #ffffff, 4K, high detail, no text, no logos, no watermark, no readable signage, no
> people, no real-world objects or storefronts.

## Video (future — not built yet)

No video-generation API/budget is wired up anywhere in this codebase yet (see `AGENTS.md`). When this
is picked up, the same anatomy applies with camera-movement vocabulary layered on top — candidates
worth reusing from the motion research: a slow parallax push-in on the same abstract composition, or
a gentle continuous gradient drift (avoid anything resembling "Impossible Camera Moves"-style dynamic
motion for a business hero — a proposal cover should feel calm/premium, not high-energy).
