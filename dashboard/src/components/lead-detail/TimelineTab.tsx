import type { LeadDetail as LeadDetailData } from "../../types";
import { Card } from "@/components/ui/card";

export function TimelineTab({ events }: { events: LeadDetailData["events"] }) {
  if (events.length === 0) return <p className="py-10 text-center text-muted-foreground">No events yet.</p>;
  return (
    <Card className="p-4.5">
      <ul className="m-0 list-none p-0">
        {events.map((e) => (
          <li key={e.id} className="flex justify-between gap-3 border-b border-border py-2 text-[13px] last:border-b-0">
            <span>
              <span className="font-semibold">{e.stage}</span> — {e.status}
              {e.message ? `: ${e.message}` : ""}
            </span>
            <span className="shrink-0 text-xs whitespace-nowrap text-muted-foreground">{e.created_at}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
