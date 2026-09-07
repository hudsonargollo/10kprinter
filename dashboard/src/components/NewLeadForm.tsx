import { useState } from "react";
import { createLead } from "../api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewLeadForm({ onCreated }: { onCreated: () => void }) {
  const [url, setUrl] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!url) return;
    setSubmitting(true);
    setError(null);
    try {
      await createLead({ url, businessName: businessName || undefined, category: category || undefined });
      setUrl("");
      setBusinessName("");
      setCategory("");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lead");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <Card className="p-4.5">
        <h2 className="mb-3 font-heading text-[15px] font-bold">Audit a new lead</h2>
        {error && (
          <div className="mb-4 rounded-lg border border-bad bg-bad/15 px-3.5 py-2.5 text-bad">
            {error}
          </div>
        )}
        <div className="mb-3 flex flex-col gap-1">
          <Label htmlFor="url">Website URL</Label>
          <Input id="url" required type="url" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <div className="mb-3 flex flex-col gap-1">
          <Label htmlFor="businessName">Business name (optional)</Label>
          <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
        </div>
        <div className="mb-3 flex flex-col gap-1">
          <Label htmlFor="category">Category (optional)</Label>
          <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Starting pipeline…" : "Run the pipeline"}
        </Button>
      </Card>
    </form>
  );
}
