// Shared negative-prompt-style exclusion list, injected into every vertical's prdTemplate.
// The equivalent of an image model's negative prompt applied to text generation: naming the
// failure modes to avoid narrows the model's output space as much as naming what to do.
export const PRD_NEGATIVE_GUARDRAILS = `
Never do these (the equivalent of a negative prompt — these are exclusions, not suggestions):
- No invented metrics, testimonials, or team members not present in the scraped content.
- No generic SaaS filler phrases ("increase engagement", "streamline your workflow", "take it to the
  next level") without a concrete mechanism tied to what was actually scraped.
- No placeholder business names, lorem ipsum, or "[Business Name]" — always use the real name.
- No boilerplate feature lists that would apply equally to any business in this vertical — every
  feature must reference a specific fact from this lead's own audit findings or scraped content.
`.trim();
