import { LockKeyhole } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { AwardPolicy } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export function AwardPolicyCard({ policy }: { policy: AwardPolicy }) {
  return (
    <section className="ofora-panel p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-black tracking-[-0.055em] text-ofora-deep">Award Policy</h2>
          <p className="mt-2 text-sm text-ofora-muted">Evaluation rules cannot be changed after supplier submissions begin.</p>
        </div>
        <StatusBadge status="Policy locked" />
      </div>
      <div className="mt-5 grid gap-3">
        {policy.criteria.map((criterion) => (
          <div key={criterion.id} className="flex items-center justify-between gap-3 rounded-md border border-ofora-border bg-ofora-canvas px-3 py-2 text-sm">
            <span className="text-ofora-muted">{criterion.label}</span>
            <span className="font-semibold text-ofora-ink">{criterion.weight}%</span>
          </div>
        ))}
      </div>
      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="text-ofora-muted">Minimum quality score</dt><dd className="font-medium text-ofora-ink">{policy.minimumQualityScore}</dd></div>
        <div><dt className="text-ofora-muted">Maximum delivery time</dt><dd className="font-medium text-ofora-ink">{policy.maximumDeliveryDays} days</dd></div>
        <div><dt className="text-ofora-muted">Budget ceiling</dt><dd className="font-medium text-ofora-ink">{formatCurrency(policy.budgetCeiling)}</dd></div>
        <div><dt className="text-ofora-muted">Lock timestamp</dt><dd className="font-medium text-ofora-ink">{formatDateTime(policy.lockedAt)}</dd></div>
      </dl>
      <p className="mt-5 inline-flex max-w-full items-start gap-2 rounded-md bg-ofora-mist px-3 py-2 text-sm font-medium text-ofora-green">
        <LockKeyhole className="h-4 w-4" aria-hidden="true" />
        <span className="min-w-0 break-words">Evaluation policy locked before supplier submissions.</span>
      </p>
    </section>
  );
}
