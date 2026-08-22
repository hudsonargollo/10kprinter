import { useState } from "react";
import { createLead } from "../api";

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
    <form className="card" onSubmit={submit}>
      <h2>Audit a new lead</h2>
      {error && <div className="error-banner">{error}</div>}
      <div className="form-row">
        <label htmlFor="url">Website URL</label>
        <input id="url" required type="url" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
      </div>
      <div className="form-row">
        <label htmlFor="businessName">Business name (optional)</label>
        <input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
      </div>
      <div className="form-row">
        <label htmlFor="category">Category (optional)</label>
        <input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>
      <button className="btn btn-primary" type="submit" disabled={submitting}>
        {submitting ? "Starting pipeline…" : "Run the pipeline"}
      </button>
    </form>
  );
}
