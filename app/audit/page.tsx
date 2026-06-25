import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { InlineMetric, PageHero, RecordPanel } from "@/components/shared/app-primitives";
import { StatusBadge } from "@/components/shared/status-badge";
import { auditRecords } from "@/lib/mock-data";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function AuditPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <PageHero
          eyebrow="Independent records"
          title={<>Audit records<br />without exposure.</>}
          description="Review procurement decisions that were validated against their locked evaluation policies, without revealing protected supplier information."
        />
        <RecordPanel className="p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <InlineMetric label="Complete records" value="24" />
            <InlineMetric label="Receipts issued" value="18" />
            <InlineMetric label="Protected datasets" value="100%" />
          </div>
        </RecordPanel>
        <RecordPanel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead className="border-b border-ofora-border bg-ofora-soft text-xs uppercase tracking-[0.12em] text-ofora-muted">
                <tr>
                  <th className="px-6 py-4">Tender title</th>
                  <th className="px-6 py-4">Organization</th>
                  <th className="px-6 py-4">Awarded supplier</th>
                  <th className="px-6 py-4 text-right">Award value</th>
                  <th className="px-6 py-4">Policy lock</th>
                  <th className="px-6 py-4">Validation</th>
                  <th className="px-6 py-4">Receipt ID</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ofora-border">
                {auditRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-ofora-soft/60">
                    <td className="px-6 py-5"><Link href={`/audit/${record.id}`} className="font-black text-ofora-deep">{record.tenderTitle}</Link><p className="text-xs text-ofora-muted">{record.tenderId}</p></td>
                    <td className="px-6 py-5 text-ofora-muted">{record.organization}</td>
                    <td className="px-6 py-5 font-semibold text-ofora-ink">{record.awardedSupplier}</td>
                    <td className="px-6 py-5 text-right font-black tabular-nums text-ofora-deep">{formatCurrency(record.awardValue)}</td>
                    <td className="px-6 py-5 text-ofora-muted">{record.policyLockStatus}</td>
                    <td className="px-6 py-5"><StatusBadge status={record.validationStatus} /></td>
                    <td className="px-6 py-5 font-semibold text-ofora-ink">{record.receiptId}</td>
                    <td className="px-6 py-5 text-ofora-muted">{formatDateTime(record.validationDate)}</td>
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
