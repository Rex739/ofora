import { AuditTimelineEvent } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function TenderTimeline({ events }: { events: AuditTimelineEvent[] }) {
  return (
    <section className="ofora-panel p-6">
      <h2 className="text-2xl font-black tracking-[-0.055em] text-ofora-deep">Audit timeline</h2>
      <ol className="mt-5 space-y-4">
        {events.map((event) => (
          <li key={event.id} className="grid grid-cols-[auto_1fr] gap-3">
            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-ofora-green" />
            <div>
              <p className="text-sm font-medium text-ofora-ink">{event.label}</p>
              <p className="text-xs text-ofora-muted">{formatDateTime(event.timestamp)}</p>
              <p className="mt-1 text-sm text-ofora-muted">{event.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
