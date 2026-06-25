import { LucideIcon } from "lucide-react";

export function MetricCard({ label, value, icon: Icon }: { label: string; value: string; icon?: LucideIcon }) {
  return (
    <section className="ofora-panel rounded-lg p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-ofora-muted">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-ofora-ink">{value}</p>
        </div>
        {Icon ? (
          <span className="rounded-md bg-ofora-mist p-2 text-ofora-green">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        ) : null}
      </div>
    </section>
  );
}
