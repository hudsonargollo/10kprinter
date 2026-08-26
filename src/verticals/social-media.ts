import type { Vertical } from "./types";
import { PRD_NEGATIVE_GUARDRAILS } from "./guardrails";

const CONTENT_ANGLE_LIBRARY = `
Pick the 2-3 content angles below that best fit this business's ACTUAL scraped assets/testimonials —
these describe editing/framing patterns applied to the business's real material, never generated or
fabricated footage:

1. UGC-Style Testimonial Repurpose — a real written testimonial found in the scrape, reformatted as an
   on-screen text reveal over a relevant real photo/clip from the site, paced for a 15-20s vertical cut.
2. Before/After Transformation Cut — for businesses with real before/after evidence (renovation, fitness,
   dental, etc.) already in the gallery; a split-screen or hard-cut edit of the business's own images.
3. Review-Highlight Quote Card — a real star-rating/review quote pulled from the scrape, laid out as a
   still or slow-pan graphic card using the business's own brand colors, for feed/story posting.
4. Day-in-the-Life B-Roll — only if the scrape shows real behind-the-scenes/process photos already
   published; a repurposed cut of those existing photos/clips into a narrated or captioned sequence.

Every angle here re-edits assets that already exist on this business's site — never propose generating
new footage/photos of the business, its staff, or its premises.
`.trim();

export const socialMedia: Vertical = {
  key: "social-media",
  label: "Social Media Management",
  auditRubric: `
Evaluate the business's presence and asset quality for Instagram/TikTok/WhatsApp.
Look for:
- GOOD: any linked social accounts, testimonials/stories that would make good short-form content, existing
  photo/video gallery assets.
- BAD: no linked social accounts found, dead/unprofessional assets (raw filenames like IMG_2119, no captions/
  alt text), no WhatsApp click-to-chat link despite an obviously mobile/local customer base, gallery content
  that isn't being repurposed into short-form video.
- FIX: specific content angles this business's existing assets/testimonials could become (e.g. UGC-style clips,
  before/after, review highlights), plus channel-specific recommendations (Instagram vs TikTok vs WhatsApp).
Qualifies if there's an untapped or poorly-run social presence relative to the strength of the underlying
testimonials/assets found. Score 0-100 on opportunity.
`.trim(),
  prdTemplate: `
Produce a Product Requirements Document titled "Project Overview: {{businessName}} Social Media Management" with:

${CONTENT_ANGLE_LIBRARY}

Objective: Turn existing testimonials/assets into a consistent short-form content + WhatsApp lead-capture engine.
Target Audience: infer from scraped content.

Tech Stack Requirements:
- Content: short-form video (Instagram Reels/TikTok) repurposed from the business's actual existing photo/story
  assets found in the scrape
- WhatsApp: click-to-chat integration on the site if missing, given the business's actual audience

Core Features: name the chosen content angle(s) from the library above and tie each one to the specific real
testimonial/photo/story it repurposes, propose a content calendar theme tied to those actual assets, and a
WhatsApp lead-capture flow if none exists.

${PRD_NEGATIVE_GUARDRAILS}

Pricing: this is an aggressive, low-friction entry offer, not a scoped enterprise engagement — a single
itemized line item priced $150-$250 (default $200) for the content/WhatsApp setup described above, framed as
a deliberate overdelivery to win the account fast. Do not scope this as a monthly retainer.
`.trim(),
};
