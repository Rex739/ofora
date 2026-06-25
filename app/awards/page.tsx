import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { InlineMetric, PageHero, RecordPanel } from "@/components/shared/app-primitives";
import { StatusBadge } from "@/components/shared/status-badge";
import { PaymentStatus, ValidationStatus } from "@/lib/types";

const awards = [
  {
    tender: "Emergency Solar Lantern Procurement",
    id: "OFR-2026-041",
    supplier: "Nova Relief Systems",
    validation: ValidationStatus.Pending,
    integrity: "Policy preserved",
    payment: PaymentStatus.PendingValidation,
    updated: "Jun 25, 2026"
  },
  {
    tender: "Regional Medical Supply Procurement",
    id: "OFR-2026-036",
    supplier: "HelioMed Distribution",
    validation: ValidationStatus.Validated,
    integrity: "Confirmed",
    payment: PaymentStatus.ReadyForControlledRelease,
    updated: "Jun 14, 2026"
  },
  {
    tender: "Bridge Maintenance Materials Tender",
    id: "OFR-2026-033",
    supplier: "Andean Materials Cooperative",
    validation: ValidationStatus.Pending,
    integrity: "Policy preserved",
    payment: PaymentStatus.PendingValidation,
    updated: "Jun 25, 2026"
  }
];

export default function AwardsPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <PageHero
          eyebrow="Decision workspace"
          title={<>Defensible<br />awards.</>}
          description="Review decisions that are awaiting validation, validated, or ready for controlled payment release."
        />
        <RecordPanel className="p-5">
          <div className="grid gap-4 sm:grid-cols-4">
            <InlineMetric label="Awaiting validation" value="2" />
            <InlineMetric label="Validated" value="18" />
            <InlineMetric label="Payment ready" value="7" />
            <InlineMetric label="Blocked awards" value="1" />
          </div>
        </RecordPanel>
        <RecordPanel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-ofora-border bg-ofora-soft text-xs uppercase tracking-[0.12em] text-ofora-muted">
                <tr>
                  <th className="px-6 py-4">Tender</th>
                  <th className="px-6 py-4">Selected supplier</th>
                  <th className="px-6 py-4">Validation</th>
                  <th className="px-6 py-4">Policy integrity</th>
                  <th className="px-6 py-4">Payment status</th>
                  <th className="px-6 py-4">Last updated</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ofora-border">
                {awards.map((award) => (
                  <tr key={award.id} className="hover:bg-ofora-soft/60">
                    <td className="px-6 py-5"><p className="font-black text-ofora-deep">{award.tender}</p><p className="text-xs text-ofora-muted">{award.id}</p></td>
                    <td className="px-6 py-5 text-ofora-muted">{award.supplier}</td>
                    <td className="px-6 py-5"><StatusBadge status={award.validation} /></td>
                    <td className="px-6 py-5 font-semibold text-ofora-ink">{award.integrity}</td>
                    <td className="px-6 py-5 text-ofora-muted">{award.payment}</td>
                    <td className="px-6 py-5 text-ofora-muted">{award.updated}</td>
                    <td className="px-6 py-5"><Link href={`/tenders/${award.id}`} className="font-black text-ofora-green">Review</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </RecordPanel>
      </div>
    </AppShell>
  );
}
