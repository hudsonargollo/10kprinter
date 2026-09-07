import { useState } from "react";
import { setShowcaseUrl } from "../../api";
import type { LeadDetail as LeadDetailData, Prd, Proposal } from "../../types";
import { CONSULT_ADDON_USD, VERTICAL_LABELS } from "../../types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
      <h2 className="font-heading text-[15px] font-bold">Showcase page</h2>
      <p className="mt-[-6px] mb-3 text-[13px] text-muted-foreground">
        Send this first — before walking the prospect through pain points or pricing. Auto-generated
        drafts below are a starting point — review/polish (or hand-build a Premium one) before sending.
      </p>

      {proposals.length > 0 && (
        <div className="mb-4 flex flex-col gap-2">
          {proposals.map((p) => {
            const url = `${window.location.origin}/api/leads/${lead.id}/proposals/${p.vertical}`;
            return (
              <div
                key={p.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border px-2.5 py-2"
              >
                <span>{VERTICAL_LABELS[p.vertical]} draft</span>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <a href={url} target="_blank" rel="noreferrer">
                      Preview
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
                    Use as showcase
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className={`flex gap-2 ${lead.showcase_url ? "mb-3" : ""}`}>
        <Input
          className="flex-1"
          placeholder="https://... (paste a hand-built demo page link, or use a draft above)"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
        />
        <Button onClick={() => saveShowcaseUrl(urlDraft)} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
      {lead.showcase_url && (
        <Button asChild variant="outline">
          <a href={lead.showcase_url} target="_blank" rel="noreferrer">
            Open showcase page →
          </a>
        </Button>
      )}

      <h2 className="mt-6 font-heading text-[15px] font-bold">Offer</h2>
      {prds.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">No priced line items yet — waiting on audits/PRDs.</p>
      ) : (
        <>
          <ul className="mb-3 list-none p-0">
            {prds.map((p) => (
              <li key={p.id} className="flex justify-between border-b border-border py-2">
                <span>{VERTICAL_LABELS[p.vertical]}</span>
                <strong>${p.price_usd ?? "—"}</strong>
              </li>
            ))}
            <li className="flex justify-between border-b border-border py-2">
              <span>+ Add-on: 1-hour strategy consultation with Hudson</span>
              <strong>${CONSULT_ADDON_USD}</strong>
            </li>
          </ul>
          <div className="flex justify-between text-base font-bold">
            <span>Full bundle total</span>
            <span>${bundleTotal}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Each line item is also sellable standalone at its own price — lead with the cheapest, highest-impact
            one, then stack.
          </p>
        </>
      )}
    </Card>
  );
}
