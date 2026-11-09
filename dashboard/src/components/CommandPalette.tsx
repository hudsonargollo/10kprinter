import { useEffect, useState, useMemo } from "react";
import { Search, MapPinned, Radar, LayoutGrid, Sparkles, ArrowRight, CornerDownLeft } from "lucide-react";
import { listLeads } from "../api";
import type { Lead } from "../types";
import { TIER_CLASS } from "@/lib/tier";
import { cn } from "@/lib/utils";
import { useLanguage } from "../i18n/LanguageContext";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      listLeads()
        .then(setLeads)
        .catch(() => {});
    }
  }, [open]);

  // Global key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  // Filter items
  const filteredActions = useMemo(() => {
    const defaultActions = [
      {
        id: "nav-board",
        category: "Navigation",
        title: t.commandPalette.navBoard,
        icon: LayoutGrid,
        shortcut: "G B",
        action: () => {
          window.location.hash = "#/";
          onOpenChange(false);
        },
      },
      {
        id: "nav-hunt",
        category: "Navigation",
        title: t.commandPalette.navHunt,
        icon: Radar,
        shortcut: "G H",
        action: () => {
          window.location.hash = "#/hunt";
          onOpenChange(false);
        },
      },
      {
        id: "nav-sources",
        category: "Navigation",
        title: t.commandPalette.navSources,
        icon: MapPinned,
        shortcut: "G S",
        action: () => {
          window.location.hash = "#/sources";
          onOpenChange(false);
        },
      },
    ];

    if (!query) return defaultActions;
    return defaultActions.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()));
  }, [query, onOpenChange, t]);

  const filteredLeads = useMemo(() => {
    if (!query) return leads.slice(0, 5);
    const q = query.toLowerCase();
    return leads
      .filter((l) => (l.business_name || "").toLowerCase().includes(q) || l.url.toLowerCase().includes(q))
      .slice(0, 8);
  }, [leads, query]);

  const allItemsCount = filteredActions.length + filteredLeads.length;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle arrow navigation & selection
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allItemsCount || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItemsCount) % (allItemsCount || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex < filteredActions.length) {
        filteredActions[selectedIndex]?.action();
      } else {
        const leadIdx = selectedIndex - filteredActions.length;
        const lead = filteredLeads[leadIdx];
        if (lead) {
          window.location.hash = `#/leads/${lead.id}`;
          onOpenChange(false);
        }
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-2xl border border-border bg-popover shadow-2xl overflow-hidden text-foreground flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-secondary">
          <Search className="size-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder={t.commandPalette.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] text-muted-foreground bg-muted border border-border rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-2 space-y-3">
          {/* Actions */}
          {filteredActions.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">{t.commandPalette.commandsGroup}</div>
              <div className="space-y-0.5">
                {filteredActions.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = selectedIndex === idx;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className={cn(
                        "w-full flex items-center justify-between px-3.5 py-2 rounded-full text-sm transition-colors text-left cursor-pointer",
                        isSelected ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={cn("size-4", isSelected ? "text-primary-foreground" : "text-muted-foreground")} />
                        <span>{item.title}</span>
                      </div>
                      <kbd
                        className={cn(
                          "px-1.5 py-0.5 text-[10px] rounded-md border",
                          isSelected ? "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground" : "bg-muted border-border text-muted-foreground"
                        )}
                      >
                        {item.shortcut}
                      </kbd>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Leads */}
          {filteredLeads.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">{t.commandPalette.leadsGroup}</div>
              <div className="space-y-0.5">
                {filteredLeads.map((lead, idx) => {
                  const itemIndex = filteredActions.length + idx;
                  const isSelected = selectedIndex === itemIndex;
                  return (
                    <button
                      key={lead.id}
                      onClick={() => {
                        window.location.hash = `#/leads/${lead.id}`;
                        onOpenChange(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3.5 py-2 rounded-full text-sm transition-colors text-left cursor-pointer",
                        isSelected ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <Sparkles className={cn("size-3.5 shrink-0", isSelected ? "text-primary-foreground" : "text-primary")} />
                        <div className="truncate">
                          <span className="font-medium block truncate">{lead.business_name || lead.url}</span>
                          <span className={cn("text-[11px] block truncate", isSelected ? "text-primary-foreground/70" : "text-muted-foreground")}>
                            {lead.url}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {lead.tier && (
                          <span
                            className={cn(
                              "px-1.5 py-0.5 text-[10px] font-bold rounded-full border",
                              TIER_CLASS[lead.tier]
                            )}
                          >
                            {lead.score}
                          </span>
                        )}
                        <ArrowRight className={cn("size-3", isSelected ? "text-primary-foreground" : "text-muted-foreground")} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {allItemsCount === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">{t.commandPalette.noResults}</div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-border bg-secondary flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>{t.commandPalette.navigateHint}</span>
            <span className="flex items-center gap-1">
              <CornerDownLeft className="size-3" /> {t.commandPalette.selectHint}
            </span>
          </div>
          <span>{t.commandPalette.footerTitle}</span>
        </div>
      </div>
    </div>
  );
}
