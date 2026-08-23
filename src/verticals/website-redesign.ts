import type { Vertical } from "./types";

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

Objective: Transform a legacy/static site into a high-converting, immersive lead-generation engine.
Target Audience: infer from the scraped content (e.g. B2B buyers, B2C consumers, both).

Tech Stack Requirements:
- Framework: Next.js 14 (App Router)
- UI Library: Shadcn UI
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

Pricing: this is an aggressive, low-friction entry offer, not a scoped enterprise engagement — a single
itemized line item priced $150-$250 (default $200) for the core deliverable described above, framed as a
deliberate overdelivery (far more value than the price implies) to win the account fast. Do not scope this
as a multi-thousand-dollar project.
`.trim(),
};
