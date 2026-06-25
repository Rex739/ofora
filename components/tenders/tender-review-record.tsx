import { SupplierRequirementsSummary } from "@/components/tenders/supplier-requirements-summary";
import { ScoringPrioritiesSummary } from "@/components/tenders/scoring-priorities-summary";
import { DecisionProcessExplainer } from "@/components/tenders/decision-process-explainer";

type Priority = {
  id: string;
  title: string;
  description: string;
  points: number;
};

export function TenderReviewRecord({
  priorities,
  minimumQuality,
  maximumDelivery,
  onEditStep
}: {
  priorities: Priority[];
  minimumQuality: number;
  maximumDelivery: number;
  onEditStep: (step: number) => void;
}) {
  return (
    <div>
      <section className="pb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black tracking-[-0.055em] text-ofora-deep">Tender details</h3>
            <p className="mt-2 text-sm leading-6 text-ofora-muted">Structured procurement record for supplier review.</p>
          </div>
          <button type="button" onClick={() => onEditStep(0)} className="ofora-focus text-sm font-black text-ofora-green underline-offset-4 hover:underline">
            Edit
          </button>
        </div>
        <dl className="mt-5 grid gap-0 border-y border-ofora-border">
          <RecordRow label="Tender title" value="Emergency Solar Lantern Procurement" />
          <RecordRow label="Tender ID" value="Will be generated on lock" />
          <RecordRow label="Organization" value="Global Relief & Infrastructure Network" />
          <RecordRow label="Procurement category" value="Emergency response equipment" />
          <RecordRow label="Tender summary" value="Procurement of emergency solar lantern units for rapid deployment across regional relief operations." />
          <RecordRow label="Budget ceiling" value="$10,000 USD" />
          <RecordRow label="Currency" value="USD" />
          <RecordRow label="Submission deadline" value="June 28, 2026" />
          <RecordRow label="Required delivery deadline" value={`${maximumDelivery} days`} />
        </dl>
      </section>
      <SupplierRequirementsSummary minimumQuality={minimumQuality} maximumDelivery={maximumDelivery} />
      <ScoringPrioritiesSummary priorities={priorities} onEdit={() => onEditStep(2)} />
      <DecisionProcessExplainer />
    </div>
  );
}

function RecordRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 border-b border-ofora-border py-4 last:border-b-0 md:grid-cols-[240px_1fr]">
      <dt className="text-xs font-black uppercase tracking-[0.16em] text-ofora-muted">{label}</dt>
      <dd className="text-sm font-semibold leading-6 text-ofora-ink">{value}</dd>
    </div>
  );
}
