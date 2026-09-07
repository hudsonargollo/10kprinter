import { useState } from "react";
import { setLeadNotes, transitionLeadStage } from "../../api";
import { waLink } from "../../lib/waLink";
import { TIER_CLASS } from "@/lib/tier";
import type { LeadDetail as LeadDetailData, Prd } from "../../types";
import { CONSULT_ADDON_USD, TIER_LABELS } from "../../types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SalesTab({
  lead,
  audits,
  prds,
  onRefresh,
}: {
  lead: LeadDetailData["lead"];
  audits: LeadDetailData["audits"];
  prds: Prd[];
  onRefresh: () => void;
}) {
  const [notesDraft, setNotesDraft] = useState(lead.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [amountDraft, setAmountDraft] = useState(
    String(prds.reduce((sum, p) => sum + (p.price_usd ?? 0), 0) + CONSULT_ADDON_USD),
  );
  const [lostReasonDraft, setLostReasonDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const qualifyingCount = audits.filter((a) => a.qualifies).length;

  async function saveNotes() {
    setSavingNotes(true);
    try {
      await setLeadNotes(lead.id, notesDraft);
      onRefresh();
    } finally {
      setSavingNotes(false);
    }
  }

  async function doTransition(status: "reviewed" | "proposal_sent" | "won" | "lost", opts?: { closedAmountUsd?: number; lostReason?: string }) {
    setBusy(true);
    try {
      await transitionLeadStage(lead.id, status, opts);
      onRefresh();
    } finally {
      setBusy(false);
    }
  }

  const wa = waLink(lead.phone, `Hi ${lead.business_name ?? "there"}, `);

  return (
    <Card className="p-4.5">
      <h2 className="font-heading text-[15px] font-bold">Lead thermometer</h2>
      {lead.tier ? (
        <p className="mt-[-6px]">
          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", TIER_CLASS[lead.tier])}>
            {TIER_LABELS[lead.tier]} · {lead.score}
          </span>{" "}
          <span className="text-[13px] text-muted-foreground">
            {qualifyingCount}/{audits.length} verticals qualify
          </span>
        </p>
      ) : (
        <p className="py-10 text-center text-muted-foreground">Not scored yet — waiting on audits.</p>
      )}

      <h2 className="mt-6 font-heading text-[15px] font-bold">Contact</h2>
      {wa ? (
        <Button asChild variant="outline">
          <a href={wa} target="_blank" rel="noreferrer">
            Message on WhatsApp
          </a>
        </Button>
      ) : (
        <p className="py-10 text-center text-muted-foreground">No phone number found.</p>
      )}

      <h2 className="mt-6 font-heading text-[15px] font-bold">Notes</h2>
      <textarea
        className="min-h-20 w-full rounded-lg border border-input bg-background p-2.5 font-sans text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        value={notesDraft}
        onChange={(e) => setNotesDraft(e.target.value)}
      />
      <div className="mt-2">
        <Button onClick={saveNotes} disabled={savingNotes}>
          {savingNotes ? "Saving…" : "Save notes"}
        </Button>
      </div>

      <h2 className="mt-6 font-heading text-[15px] font-bold">Stage</h2>
      {(lead.status === "prd_ready" || lead.status === "reviewed") && (
        <Button onClick={() => doTransition("proposal_sent")} disabled={busy}>
          Send Proposal
        </Button>
      )}
      {lead.status === "proposal_sent" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              className="w-30"
              value={amountDraft}
              onChange={(e) => setAmountDraft(e.target.value)}
            />
            <Button onClick={() => doTransition("won", { closedAmountUsd: Number(amountDraft) })} disabled={busy}>
              Mark Won
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Reason (optional)"
              className="flex-1"
              value={lostReasonDraft}
              onChange={(e) => setLostReasonDraft(e.target.value)}
            />
            <Button variant="outline" onClick={() => doTransition("lost", { lostReason: lostReasonDraft })} disabled={busy}>
              Mark Lost
            </Button>
          </div>
        </div>
      )}
      {lead.status === "won" && (
        <p>
          Closed <strong>${lead.closed_amount_usd}</strong> on {lead.closed_at ? new Date(lead.closed_at).toLocaleDateString() : "—"}
        </p>
      )}
      {lead.status === "lost" && (
        <>
          <p>Lost: {lead.lost_reason || "no reason given"}</p>
          <Button variant="outline" onClick={() => doTransition("proposal_sent")} disabled={busy}>
            Reopen
          </Button>
        </>
      )}
      {!["prd_ready", "reviewed", "proposal_sent", "won", "lost"].includes(lead.status) && (
        <p className="py-10 text-center text-muted-foreground">Sales stages open up once this lead reaches PRD Ready.</p>
      )}
    </Card>
  );
}
