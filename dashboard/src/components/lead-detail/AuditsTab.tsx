import type { AuditFinding, LeadDetail as LeadDetailData } from "../../types";
import { Card } from "@/components/ui/card";
import { useLanguage } from "../../i18n/LanguageContext";

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value.length > 0) return [value];
  return [];
}

export function AuditsTab({ audits }: { audits: LeadDetailData["audits"] }) {
  const { t } = useLanguage();

  if (audits.length === 0) {
    return <p className="py-10 text-center text-muted-foreground font-mono text-xs">{t.auditsTab.noAudits}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {audits.map((audit) => {
        const raw = JSON.parse(audit.findings_json);
        const finding: AuditFinding = { good: asStringArray(raw.good), bad: asStringArray(raw.bad), fix: asStringArray(raw.fix) };
        const label = t.verticals[audit.vertical] || audit.vertical;

        return (
          <Card className="p-4.5" key={audit.id}>
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-[15px] font-bold">{label}</h2>
              <div className="flex items-center gap-2">
                <span
                  className={
                    audit.qualifies
                      ? "rounded-full bg-good/15 px-2 py-0.5 text-[11px] font-bold text-good"
                      : "rounded-full bg-bad/15 px-2 py-0.5 text-[11px] font-bold text-bad"
                  }
                >
                  {audit.qualifies ? t.auditsTab.qualifies : t.auditsTab.doesNotQualify}
                </span>
                <span className="rounded-full bg-border px-2 py-0.5 text-[11px] font-bold">
                  {t.auditsTab.score} {audit.score}/100
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 max-[800px]:grid-cols-1 mt-3">
              <div>
                <h4 className="mb-2 text-xs font-semibold tracking-wide uppercase text-good">{t.auditsTab.good}</h4>
                <ul className="m-0 pl-4.5 text-xs text-white/90">
                  {finding.good.map((g, i) => (
                    <li className="mb-1.5" key={i}>
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold tracking-wide uppercase text-bad">{t.auditsTab.bad}</h4>
                <ul className="m-0 pl-4.5 text-xs text-white/90">
                  {finding.bad.map((b, i) => (
                    <li className="mb-1.5" key={i}>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold tracking-wide uppercase text-[#e8ff5c]">{t.auditsTab.fix}</h4>
                <ul className="m-0 pl-4.5 text-xs text-white/90">
                  {finding.fix.map((f, i) => (
                    <li className="mb-1.5" key={i}>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
