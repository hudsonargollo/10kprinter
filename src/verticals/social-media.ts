import type { Vertical } from "./types";

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

Objective: Turn existing testimonials/assets into a consistent short-form content + WhatsApp lead-capture engine.
Target Audience: infer from scraped content.

Tech Stack Requirements:
- Content: short-form video (Instagram Reels/TikTok) repurposed from the business's actual existing photo/story
  assets found in the scrape
- WhatsApp: click-to-chat integration on the site if missing, given the business's actual audience

Core Features: propose a content calendar theme tied to the business's actual best testimonials/stories found,
specific short-form video concepts (not generic "post more"), and a WhatsApp lead-capture flow if none exists.

Pricing: this is an aggressive, low-friction entry offer, not a scoped enterprise engagement — a single
itemized line item priced $150-$250 (default $200) for the content/WhatsApp setup described above, framed as
a deliberate overdelivery to win the account fast. Do not scope this as a monthly retainer.
`.trim(),
};
