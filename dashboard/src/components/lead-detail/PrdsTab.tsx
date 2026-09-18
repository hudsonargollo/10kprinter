import { useEffect, useState } from "react";
import { getPrdMarkdown } from "../../api";
import type { BrandTokens, Prd } from "../../types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "../../i18n/LanguageContext";

export function PrdsTab({ leadId, prds }: { leadId: string; prds: Prd[] }) {
  const { t } = useLanguage();
  const [activeId, setActiveId] = useState<string | null>(prds[0]?.id ?? null);
  const [markdown, setMarkdown] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeId) return;
    setLoading(true);
    getPrdMarkdown(leadId, activeId)
      .then(setMarkdown)
      .finally(() => setLoading(false));
  }, [leadId, activeId]);

  if (prds.length === 0) {
    return (
      <p className="py-10 text-center text-muted-foreground font-mono text-xs">
        {t.prdsTab.noPrds}
      </p>
    );
  }

  const active = prds.find((p) => p.id === activeId);
  const tokens: BrandTokens | null = active ? JSON.parse(active.brand_tokens_json) : null;

  function download() {
    if (!active) return;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${active.vertical}-prd.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="p-4.5">
      <Tabs value={activeId ?? undefined} onValueChange={setActiveId} className="mb-3 gap-0">
        <TabsList>
          {prds.map((p) => (
            <TabsTrigger key={p.id} value={p.id} className="text-xs">
              {t.verticals[p.vertical] || p.vertical}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {tokens && (
        <div className="mb-4">
          <div className="mt-2 flex flex-wrap gap-2.5">
            {(["primary", "background", "backgroundAlt"] as const).map((key) => (
              <div
                key={key}
                className="flex h-15 w-15 items-end rounded-lg border border-border p-1 font-mono text-[9px]"
                style={{ background: tokens[key], color: tokens.textOnBackground }}
              >
                {key}
              </div>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">{tokens.rationale}</p>
        </div>
      )}

      <div className="mb-2 flex justify-end">
        <Button variant="outline" size="sm" onClick={download} disabled={loading}>
          {t.prdsTab.downloadMd}
        </Button>
      </div>

      <div className="prd-markdown">{loading ? t.prdsTab.loading : markdown}</div>
    </Card>
  );
}
