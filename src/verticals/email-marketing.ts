import type { Vertical } from "./types";
import { PRD_NEGATIVE_GUARDRAILS } from "./guardrails";

const EMAIL_SEQUENCE_LIBRARY = `
Pick the ONE sequence archetype below that best matches this business's actual offer(s), then name it
explicitly and specify the real step count, timing, and subject-line pattern for that archetype — never
propose "a nurture sequence" in the abstract:

1. Welcome/Nurture Series — for a business with a single clear offer and no existing capture. 4-5 emails
   over 10 days: immediate value-delivery email (the lead magnet itself), day-2 social-proof/story email,
   day-5 objection-handling email, day-8 soft-offer email, day-10 last-chance/urgency email. Subject lines
   lead with the specific value promised, never "Welcome to our newsletter."
2. Inquiry-Abandonment Recovery — for a business whose form/quote requests go cold with no follow-up.
   3 emails over 5 days triggered the moment a form is started/submitted but not converted: 1-hour
   "did you mean to send that?" nudge, day-2 answer-the-likely-objection email, day-5 direct incentive
   (e.g. a small discount or a free add-on) to close the loop.
3. Win-Back for Dormant Customers — for a business with a returning-customer model but no reactivation
   flow. 3 emails over 14 days to contacts inactive 60+ days: "we miss you" personal-tone email, day-7
   what's-new/social-proof email, day-14 direct incentive with a hard deadline.

If the scrape shows more than one distinct offer/audience (e.g. B2B and B2C), specify separate segmented
paths using the same archetype logic, not one generic list serving both.
`.trim();

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

${EMAIL_SEQUENCE_LIBRARY}

Objective: Capture and nurture leads who are not yet ready to buy, segmented by the business's actual offers.
Target Audience: infer from scraped content (segment by offer type if more than one exists).

Tech Stack Requirements:
- ESP: Klaviyo or Resend, chosen based on whether this is more B2C (Klaviyo) or transactional/B2B (Resend)
- Capture: embedded/exit-intent forms matching the site's actual sections and offers found

Core Features: name the chosen sequence archetype from the pattern library above, propose a lead magnet
specific to this business's actual offer(s), a segmented signup flow (e.g. separate B2B vs B2C paths if both
exist, as found in the scrape), and the exact step count/timing/subject-line pattern for the sequence,
tailored to this business's actual value proposition.

${PRD_NEGATIVE_GUARDRAILS}

Pricing: this is an aggressive, low-friction entry offer, not a scoped enterprise engagement — a single
itemized line item priced $150-$250 (default $200) for the lead magnet + capture flow described above, framed
as a deliberate overdelivery to win the account fast. Do not scope this as a multi-thousand-dollar project or
a recurring retainer.
`.trim(),
};
