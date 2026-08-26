import type { Vertical } from "./types";
import { PRD_NEGATIVE_GUARDRAILS } from "./guardrails";

// Distilled from github.com/xiiiabu/motionsites.ai's 65 real, production-tested
// prompts (not guessed) — four recurring archetypes that cover most business
// types, plus the signature CSS/motion patterns that show up across the library.
const MOTION_PATTERN_LIBRARY = `
Pick the ONE archetype below that best fits this business's category and brand tone, then adapt it
with this lead's own brand tokens/copy/imagery (never ship the literal example colors or copy — they
are structural references, not content to reuse):

1. Liquid-Glass Agency/SaaS — for creative agencies, AI/dev tooling, premium B2B services. Pure/near-black
   HSL background, a floating glassmorphic navbar and buttons using the Liquid Glass CSS below, an
   Instrument-Serif-italic accent font paired with a plain sans body font (e.g. Barlow, Geist Sans), all
   buttons rounded-full. Section flow: glass navbar -> full-bleed hero (video or gradient) -> word-by-word
   scroll-reveal statement section -> staggered fade-up project/feature grid -> full-bleed video/CTA -> footer.

2. Bold Color-Gradient Portfolio/Personal Brand — for individuals, studios, personal-brand sites. Vivid
   vertical gradient background, a heavy condensed display headline font (Anton-style, massive/uppercase),
   glowing blurred color "blobs" (mix-blend-screen, blur 60-80px) behind content, a transparent floating
   navbar, and a circular arrow CTA button that fills solid on hover.

3. Cinematic Web3/Fintech Hero — for finance, crypto, high-trust/high-stakes offers. Full-bleed background
   video, deep dark HSL palette with one warm accent (amber/gold) used for glow effects, a neon-glow text
   treatment (two blurred duplicate spans with a directional gradient mask over the emphasized word), a
   glowing CTA button (large soft box-shadow bloom in the accent hue), and an infinite CSS-keyframe logo
   marquee for social proof.

4. Standard SaaS Product Hero — for tools/platforms/dashboards. A centered floating pill navbar (glass or
   solid), an announcement badge pill above the H1, a primary+secondary CTA pair, a muted subheading, and a
   social-proof/logo strip below the fold.

LIQUID GLASS CSS (use verbatim when the chosen archetype calls for it — this exact construction, not a
generic backdrop-blur, is what gives the "liquid glass" look real depth):
.liquid-glass { background: rgba(255,255,255,0.01); background-blend-mode: luminosity;
  backdrop-filter: blur(4px); border: none; box-shadow: inset 0 1px 1px rgba(255,255,255,0.1);
  position: relative; overflow: hidden; }
.liquid-glass::before { content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1.4px;
  background: linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%,
  transparent 40%, transparent 60%, rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude; pointer-events: none; }

FRAMER MOTION RECIPES actually used across the library — name which one each animated section uses:
- Word-by-word scroll reveal: split a statement into words, each a motion.span; useScroll({offset:
  ["start 0.9","start 0.3"]}) drives useTransform of each word's opacity from 0.15 to 1 as it scrolls by.
- Staggered fade-up grid: each card animates y: 40->0, opacity 0->1, delay = index * 0.1.
- Button micro-interaction: whileHover={{ scale: 1.03 }}, whileTap={{ scale: 0.98 }} on every primary CTA.
- Parallax overlap: a full-bleed video/image section with a negative top margin (e.g. -mt-[325px]) pulling
  it upward under the section above, gradient-faded top and bottom into the background color.
`.trim();

export const websiteRedesign: Vertical = {
  key: "website-redesign",
  label: "Website Redesign",
  auditRubric: `
Evaluate the site strictly as a revenue-generating asset, the way a paid conversion consultant would.
Look for:
- GOOD: strong emotional hooks, hard data/social proof, hidden low-ticket or impulse offers, clear existing CTAs.
- BAD (friction/leaks): decision fatigue (too many competing CTAs/phone numbers), zero lead capture/nurture,
  poor visual hierarchy (walls of text, no scanning structure), unprofessional assets (raw filenames, slow images,
  missing alt text), no mobile optimization signals, no distinct funnels for distinct audiences.
- FIX: concrete, specific fixes — not generic advice. Reference the actual copy/structure found on the page.
Qualifies for this vertical if the site is dated, static, or has material conversion friction that a rebuild
would fix. Score 0-100 on redesign opportunity (higher = more opportunity / weaker current site).
`.trim(),
  prdTemplate: `
Produce a Product Requirements Document titled "Project Overview: {{businessName}} Modernization" with this
exact structure:

${MOTION_PATTERN_LIBRARY}

Objective: Transform a legacy/static site into a high-converting, immersive lead-generation engine.
Target Audience: infer from the scraped content (e.g. B2B buyers, B2C consumers, both).

Tech Stack Requirements:
- Framework: Next.js 14 (App Router)
- UI Library: Shadcn UI
- Motion/Interaction: Framer Motion for scroll-reveals, page transitions, and hover/tap micro-interactions
- Design System: strict whitespace, typography scales, high-contrast primary actions
- Immersive WebGL: Three.js (React Three Fiber) where it fits the business's actual product/service
- Fallback for complex internal dashboards (only if the business plausibly needs one): Material UI

Core Features & Component Mapping: propose 3-5 concrete features tailored to what was actually scraped from
this specific business (not generic placeholders) — e.g. a relevant hero interaction, a multi-step lead-capture
funnel (Shadcn Form/Select/Slider/DatePicker), a social-proof/gallery section fixing any asset-quality issues
found (e.g. raw filenames, missing alt text, slow-loading images), and if relevant, a client-side ROI/pricing
calculator specific to this business's offer.

Design Tokens: reference the brand tokens generated separately for this lead (primary/background colors +
rationale) and specify typography (sans-serif, heavily weighted headers).

Design Quality Bar: name the archetype chosen from the pattern library above and state explicitly which
named pattern (liquid glass, a specific Framer Motion recipe, etc.) drives each section's polish — this is
a premium, portfolio-grade redesign built from real production patterns, not a template swap with vibes
attached after the fact. Also hold every section to the caliber curated on collectui.com (UI component
inspiration), mobbin.com (mobile/web design patterns), and designrocket.io (landing page inspiration) for
anything the archetype library above doesn't already cover.

${PRD_NEGATIVE_GUARDRAILS}

Pricing: this is an aggressive, low-friction entry offer, not a scoped enterprise engagement — a single
itemized line item priced $150-$250 (default $200) for the core deliverable described above, framed as a
deliberate overdelivery (far more value than the price implies) to win the account fast. Do not scope this
as a multi-thousand-dollar project.
`.trim(),
};
