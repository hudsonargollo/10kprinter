import type { Vertical } from "./types";
import { PRD_NEGATIVE_GUARDRAILS } from "./guardrails";

const AUTOMATION_PATTERN_LIBRARY = `
Pick the ONE (or two, if clearly both apply) automation archetype below that matches this business's
actual observed bottleneck, then name it explicitly and describe its real trigger -> condition ->
action shape — never propose "some automation" in the abstract:

1. Missed-Call Text-Back + Lead Router — for phone-dependent businesses ("call us" as the only path).
   Trigger: an inbound call goes unanswered. Condition: business hours vs after-hours. Action: an
   automatic SMS reply with a booking link, and routing the caller's info to the right team member by
   inquiry type instead of "call Bob or Chris."
2. Review-Request Drip After Job/Service Completion — for businesses with no review-generation flow.
   Trigger: a job/appointment is marked complete. Action: a timed SMS/email sequence (immediate thank-
   you, day-3 review request with a direct Google/Yelp link, day-10 fallback for non-responders).
3. No-Show Appointment Recovery Sequence — for businesses relying on manual scheduling/reminders.
   Trigger: an appointment passes with no check-in/completion marked. Action: an automatic rebooking
   text within the hour, escalating to a call-back task if unanswered by end of day.
4. Quote-Request Auto-Router + Follow-Up — for service businesses whose only funnel is a generic
   contact form. Trigger: a quote/estimate request form submits. Condition: route by service type/
   urgency keyword found in the message. Action: instant acknowledgment + auto-assignment, with a
   48-hour no-response follow-up nudge.

Name the platform that implements it (n8n or Make, matched to the business's apparent scale/budget)
and specify the actual trigger/condition/action nodes required — not a vague "set up automation" line.
`.trim();

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

${AUTOMATION_PATTERN_LIBRARY}

Objective: Replace manual, phone-dependent processes with automated lead routing, scheduling, and follow-up.
Target Audience: infer from scraped content.

Tech Stack Requirements:
- Automation platform: n8n or Make (self-hosted or cloud, pick based on scale implied by the business)
- CRM: lightweight CRM integration (e.g. HubSpot free tier or Airtable-as-CRM) if none currently exists
- Forms/booking: Cal.com or Shadcn-based booking form feeding directly into the automation

Core Features: name the chosen archetype(s) from the pattern library above and describe the exact
trigger/condition/action nodes tailored to this business's actual observed workflow gaps (e.g. auto-routing
a lead form by inquiry type instead of "call Bob or Chris", automated quote/follow-up sequences, calendar-
based booking replacing phone scheduling).

${PRD_NEGATIVE_GUARDRAILS}

Pricing: this is an aggressive, low-friction entry offer, not a scoped enterprise engagement — a single
itemized line item priced $150-$250 (default $200) for the single highest-impact automation described above,
framed as a deliberate overdelivery to win the account fast. Do not scope this as a multi-thousand-dollar
project.
`.trim(),
};
