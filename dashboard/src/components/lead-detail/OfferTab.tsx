import { useState } from "react";
import { setShowcaseUrl } from "../../api";
import type { LeadDetail as LeadDetailData, Prd, Proposal } from "../../types";
import { CONSULT_ADDON_USD } from "../../types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLanguage } from "../../i18n/LanguageContext";

export function OfferTab({
  lead,
  prds,
  proposals,
  onRefresh,
}: {
  lead: LeadDetailData["lead"];
  prds: Prd[];
  proposals: Proposal[];
  onRefresh: () => void;
}) {
  const { t } = useLanguage();
  const [urlDraft, setUrlDraft] = useState(lead.showcase_url ?? "");
  const [saving, setSaving] = useState(false);

  const itemTotal = prds.reduce((sum, p) => sum + (p.price_usd ?? 0), 0);
  const bundleTotal = itemTotal + CONSULT_ADDON_USD;

  async function saveShowcaseUrl(url: string) {
    setSaving(true);
    try {
      await setShowcaseUrl(lead.id, url);
      onRefresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-4.5">
      <h2 className="font-heading text-[15px] font-bold">{t.offerTab.showcaseTitle}</h2>
      <p className="mt-[-6px] mb-3 text-[13px] text-muted-foreground">
        {t.offerTab.showcaseDesc}
      </p>

      {proposals.length > 0 && (
        <div className="mb-4 flex flex-col gap-2">
          {proposals.map((p) => {
            const url = `${window.location.origin}/api/leads/${lead.id}/proposals/${p.vertical}`;
            const label = t.verticals[p.vertical] || p.vertical;
            return (
              <div
                key={p.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border px-2.5 py-2"
              >
                <span className="text-xs font-medium">{label} ({t.offerTab.draftSuffix})</span>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <a href={url} target="_blank" rel="noreferrer">
                      {t.offerTab.preview}
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setUrlDraft(url);
                      saveShowcaseUrl(url);
                    }}
                    disabled={saving}
                  >
                    {t.offerTab.useAsShowcase}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className={`flex gap-2 ${lead.showcase_url ? "mb-3" : ""}`}>
        <Input
          className="flex-1 text-xs"
          placeholder="https://... (URL personalizada do showcase ou selecione acima)"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
        />
        <Button onClick={() => saveShowcaseUrl(urlDraft)} disabled={saving} size="sm">
          {saving ? t.offerTab.saving : t.offerTab.save}
        </Button>
      </div>
      {lead.showcase_url && (
        <Button asChild variant="outline" size="sm">
          <a href={lead.showcase_url} target="_blank" rel="noreferrer">
            {t.offerTab.openShowcase}
          </a>
        </Button>
      )}

      <h2 className="mt-6 font-heading text-[15px] font-bold">{t.offerTab.offerTitle}</h2>
      {prds.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground font-mono text-xs">{t.offerTab.noPrds}</p>
      ) : (
        <>
          <ul className="mb-3 list-none p-0 text-xs">
            {prds.map((p) => {
              const label = t.verticals[p.vertical] || p.vertical;
              return (
                <li key={p.id} className="flex justify-between border-b border-border py-2 text-white/90">
                  <span>{label}</span>
                  <strong className="font-mono">${p.price_usd ?? "—"}</strong>
                </li>
              );
            })}
            <li className="flex justify-between border-b border-border py-2 text-muted-foreground">
              <span>{t.offerTab.consultAddon}</span>
              <strong className="font-mono text-white/90">${CONSULT_ADDON_USD}</strong>
            </li>
          </ul>
          <div className="flex justify-between text-sm font-bold text-[#e8ff5c]">
            <span>{t.offerTab.bundleTotal}</span>
            <span className="font-mono">${bundleTotal}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {t.offerTab.stackNote}
          </p>
        </>
      )}
    </Card>
  );
}
