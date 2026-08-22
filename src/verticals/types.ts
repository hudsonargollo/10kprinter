import type { VerticalKey } from "../types";

export interface Vertical {
  key: VerticalKey;
  label: string;
  /** What "good/bad" means for this offer — injected into the Consultant (audit) prompt. */
  auditRubric: string;
  /** Deliverables/tech-stack/pricing shape for this offer's PRD — injected into the Architect (PRD) prompt. */
  prdTemplate: string;
}
