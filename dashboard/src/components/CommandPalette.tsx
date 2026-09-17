import { useEffect, useState, useMemo } from "react";
import { Search, MapPinned, Radar, LayoutGrid, Sparkles, ArrowRight, CornerDownLeft } from "lucide-react";
import { listLeads } from "../api";
import type { Lead } from "../types";
import { TIER_CLASS } from "@/lib/tier";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
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
        title: "All Leads Board",
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
        title: "Launch Hunt Wizard",
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
        title: "Lead Sources & Places",
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
  }, [query, onOpenChange]);

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
        className="w-full max-w-xl rounded-2xl border border-white/15 bg-[#140f1c] shadow-2xl overflow-hidden text-foreground flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-white/[0.02]">
          <Search className="w-4 h-4 text-white/40 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search leads..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-white/40 bg-white/5 border border-white/10 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-2 space-y-3">
          {/* Actions */}
          {filteredActions.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-white/40">Commands</div>
              <div className="space-y-0.5">
                {filteredActions.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = selectedIndex === idx;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left cursor-pointer",
                        isSelected ? "bg-[#e8ff5c] text-black font-semibold" : "text-white/80 hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={cn("w-4 h-4", isSelected ? "text-black" : "text-white/40")} />
                        <span>{item.title}</span>
                      </div>
                      <kbd
                        className={cn(
                          "px-1.5 py-0.5 text-[10px] font-mono rounded border",
                          isSelected ? "bg-black/10 border-black/20 text-black" : "bg-white/5 border-white/10 text-white/40"
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
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-white/40">Leads</div>
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
                        "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left cursor-pointer",
                        isSelected ? "bg-[#e8ff5c] text-black font-semibold" : "text-white/80 hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <Sparkles className={cn("w-3.5 h-3.5 shrink-0", isSelected ? "text-black" : "text-[#e8ff5c]")} />
                        <div className="truncate">
                          <span className="font-medium block truncate">{lead.business_name || lead.url}</span>
                          <span className={cn("text-[11px] block truncate", isSelected ? "text-black/60" : "text-white/40")}>
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
                        <ArrowRight className={cn("w-3 h-3", isSelected ? "text-black" : "text-white/30")} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {allItemsCount === 0 && (
            <div className="py-8 text-center text-xs text-white/40 font-mono">No matching commands or leads found</div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-[11px] text-white/40 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span className="flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3" /> Select
            </span>
          </div>
          <span>MoneyMachine Command</span>
        </div>
      </div>
    </div>
  );
}
