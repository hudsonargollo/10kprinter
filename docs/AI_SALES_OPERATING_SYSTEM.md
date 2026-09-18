# ClubeMKT AI Sales Operating System

## Principle
Use AI for repeatable research, preparation, documentation, and follow-up. Keep humans in the loop for judgment, empathy, presentation, objections, and relationship moments.

## Five-phase flow

1. Prospect
   - Hunt by ICP, niche, geography, and buying signals.
   - Enrich business and decision-maker data.
   - Deduplicate before outreach.
   - Human sniff test before activation.

2. Qualify
   - Ask about pain, urgency, current process, team size, budget/marketing spend, desired outcome, and authority.
   - Store answers and a qualification score in the lead record.
   - Only qualified or needs-review leads may proceed to a meeting.

3. Present
   - Combine CRM data, website audit, qualification answers, call transcript, and objections.
   - Generate a tailored proposal brief and talk track.
   - Always schedule a proposal-review call; do not send an unreviewed attachment as the primary close mechanism.

4. Handle objections
   - Store every call transcript and objection review.
   - Generate practice questions and talk tracks for the team.
   - AI coaches and roleplays; humans answer the real objection.

5. Enroll and deliver
   - Mark won with amount and next action.
   - Start onboarding immediately.
   - Give the customer a fast first win.
   - Record the win and permission to share it.

## System ownership

- Twenty: source of truth for people, companies, opportunities, stages, tasks, notes, and next actions.
- 10kprinter: prospect discovery, website audit, scoring, PRD, proposal draft, and AI sales artifacts.
- n8n/Evolution/Chatwoot: transport, notifications, WhatsApp, email, and scheduling integrations.
- Human owner: ICP definition, qualification approval, proposal call, objections, and customer celebration.

## API additions in this release

- `POST /api/leads/:id/qualification`
- `POST /api/leads/:id/artifacts`
- `PATCH /api/leads/:id/next-action`
- `PATCH /api/leads/:id/onboarding`

All four routes require the existing authenticated operations session and write an auditable pipeline event.
