import type { Vertical } from "./types";

export const emailMarketing: Vertical = {
  key: "email-marketing",
  label: "Email Marketing",
  auditRubric: `
Evaluate the site's ability to capture and nurture leads over time via email.
Look for:
- GOOD: any newsletter signup, lead magnet, or gated content found.
- BAD: zero email capture anywhere on the site, no way for a researching-but-not-ready-to-buy visitor to stay
  in touch, generic "Contact Us" as the only funnel, no evidence of segmentation (e.g. B2B vs B2C offers mixed
  into one form).
- FIX: specific capture mechanisms and nurture sequence ideas tied to the business's actual offers found.
Qualifies if there is no meaningful email capture/nurture path today. Score 0-100 on opportunity.
`.trim(),
  prdTemplate: `
Produce a Product Requirements Document titled "Project Overview: {{businessName}} Email Marketing" with:

Objective: Capture and nurture leads who are not yet ready to buy, segmented by the business's actual offers.
Target Audience: infer from scraped content (segment by offer type if more than one exists).

Tech Stack Requirements:
- ESP: Klaviyo or Resend, chosen based on whether this is more B2C (Klaviyo) or transactional/B2B (Resend)
- Capture: embedded/exit-intent forms matching the site's actual sections and offers found

Core Features: propose a lead magnet specific to this business's actual offer(s), a segmented signup flow
(e.g. separate B2B vs B2C paths if both exist, as found in the scrape), and a 3-5 email nurture sequence
outline with subject lines tailored to the business's actual value proposition.

Pricing tier: $2,500-$4,000 setup + optional monthly retainer for ongoing sends — recommend based on scope.
`.trim(),
};
