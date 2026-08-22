import type { Vertical } from "./types";

export const marketingAutomation: Vertical = {
  key: "marketing-automation",
  label: "Marketing Automation",
  auditRubric: `
Evaluate how much of this business's customer/lead handling is manual vs automated.
Look for:
- GOOD: any existing booking widgets, chatbots, CRM integration signals, automated confirmation/reminder copy.
- BAD: "call us" as the only path to action, no visible scheduling/booking automation, no signs of a CRM or
  follow-up sequence, repetitive manual-sounding processes described in the copy (e.g. "call Bob or Chris").
- FIX: specific automation workflows this business could deploy (booking, quote requests, follow-up sequences,
  internal routing) tied to what was actually observed.
Qualifies if the business shows clear manual-process bottlenecks a workflow/CRM automation package would fix.
Score 0-100 on automation opportunity.
`.trim(),
  prdTemplate: `
Produce a Product Requirements Document titled "Project Overview: {{businessName}} Marketing Automation" with:

Objective: Replace manual, phone-dependent processes with automated lead routing, scheduling, and follow-up.
Target Audience: infer from scraped content.

Tech Stack Requirements:
- Automation platform: n8n or Make (self-hosted or cloud, pick based on scale implied by the business)
- CRM: lightweight CRM integration (e.g. HubSpot free tier or Airtable-as-CRM) if none currently exists
- Forms/booking: Cal.com or Shadcn-based booking form feeding directly into the automation

Core Features: propose 3-5 concrete automations tailored to this business's actual observed workflow gaps
(e.g. auto-routing a lead form by inquiry type instead of "call Bob or Chris", automated quote/follow-up
sequences, calendar-based booking replacing phone scheduling).

Pricing tier: $4,000-$7,000 depending on number of workflows required — state the recommended number and why.
`.trim(),
};
