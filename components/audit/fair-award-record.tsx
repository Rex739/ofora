import { OforaMark } from "@/components/landing/ofora-mark";
import { MetadataRow } from "@/components/shared/app-primitives";
import { AuditRecord } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export function FairAwardRecord({ record }: { record: AuditRecord }) {
  return (
    <section className="relative overflow-hidden border border-ofora-deep/20 bg-[#fffef8] p-6 shadow-panel">
      <div className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(#063524_1px,transparent_1px),linear-gradient(90deg,#063524_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="relative">
        <div className="flex flex-col gap-4 border-b border-ofora-border pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <OforaMark className="h-11 w-11" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-ofora-green">Fair Award Record</p>
              <h2 className="mt-1 text-3xl font-black tracking-[-0.06em] text-ofora-deep">{record.tenderTitle}</h2>
            </div>
          </div>
          <div className="border border-ofora-green bg-ofora-mist px-4 py-3 text-sm font-black text-ofora-green">Award independently validated</div>
        </div>
        <dl className="mt-5 grid gap-0">
          <MetadataRow label="Tender title" value={record.tenderTitle} />
          <MetadataRow label="Tender ID" value={record.tenderId} />
          <MetadataRow label="Organization" value={record.organization} />
          <MetadataRow label="Awarded supplier" value={record.awardedSupplier} />
          <MetadataRow label="Award value" value={formatCurrency(record.awardValue)} />
          <MetadataRow label="Selection rule status" value="Locked before submissions" />
          <MetadataRow label="Validation status" value="Award independently validated" />
          <MetadataRow label="Fair Award Receipt ID" value={record.receiptId} />
          <MetadataRow label="Validation timestamp" value={formatDateTime(record.validationDate)} />
          <MetadataRow label="Payment readiness" value={record.paymentStatus} />
        </dl>
      </div>
    </section>
  );
}
