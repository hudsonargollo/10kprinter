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
      <Card className="p-5 bg-[#161020] border-white/10 shadow-xl rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#e8ff5c]" />
            <span>{t.newLead.title}</span>
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <Globe className="w-3.5 h-3.5 text-[#e8ff5c]" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="auto" className="bg-[#161020] text-white">🌐 Auto Language</option>
              <option value="es" className="bg-[#161020] text-white">🇪🇸 Español</option>
              <option value="en" className="bg-[#161020] text-white">🇺🇸 English</option>
              <option value="pt" className="bg-[#161020] text-white">🇧🇷 Português</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-bad bg-bad/15 px-3.5 py-2.5 text-bad text-xs font-mono">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="url" className="text-xs text-white/70">{t.newLead.urlLabel}</Label>
            <Input
              id="url"
              required
              type="url"
              placeholder={t.newLead.urlPlaceholder}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 h-9 text-xs rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="businessName" className="text-xs text-white/70">{t.newLead.businessNameLabel}</Label>
            <Input
              id="businessName"
              placeholder={t.newLead.businessNamePlaceholder}
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 h-9 text-xs rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category" className="text-xs text-white/70">{t.newLead.categoryLabel}</Label>
            <Input
              id="category"
              placeholder={t.newLead.categoryPlaceholder}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 h-9 text-xs rounded-xl"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="bg-[#e8ff5c] text-black font-bold hover:bg-[#d8ef4c] rounded-xl text-xs h-9 px-5 shadow-md shadow-[#e8ff5c]/20 cursor-pointer"
        >
          {submitting ? t.newLead.submitBusy : t.newLead.submitDefault}
        </Button>
      </Card>
    </form>
  );
}
