import { useState } from "react";
import { createLead } from "../api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Sparkles } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

export function NewLeadForm({ onCreated }: { onCreated: () => void }) {
  const [url, setUrl] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("auto");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!url) return;
    setSubmitting(true);
    setError(null);
    try {
      await createLead({
        url,
        businessName: businessName || undefined,
        category: category || undefined,
        language: language === "auto" ? undefined : language,
      });
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
    <form onSubmit={submit} className="mb-6">
      <Card className="p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span>{t.newLead.title}</span>
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe className="size-3.5 text-primary" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="h-8 rounded-full border-0 bg-secondary px-3 text-xs text-foreground outline-none cursor-pointer focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="auto">🌐 Auto Language</option>
              <option value="es">🇪🇸 Español</option>
              <option value="en">🇺🇸 English</option>
              <option value="pt">🇧🇷 Português</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-bad bg-bad/15 px-3.5 py-2.5 text-bad text-xs">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="url" className="text-xs text-muted-foreground">{t.newLead.urlLabel}</Label>
            <Input
              id="url"
              required
              type="url"
              placeholder={t.newLead.urlPlaceholder}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="businessName" className="text-xs text-muted-foreground">{t.newLead.businessNameLabel}</Label>
            <Input
              id="businessName"
              placeholder={t.newLead.businessNamePlaceholder}
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category" className="text-xs text-muted-foreground">{t.newLead.categoryLabel}</Label>
            <Input
              id="category"
              placeholder={t.newLead.categoryPlaceholder}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? t.newLead.submitBusy : t.newLead.submitDefault}
        </Button>
      </Card>
    </form>
  );
}
