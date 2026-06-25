import { OforaMark } from "@/components/landing/ofora-mark";
import { AwardReceipt, Supplier } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function FairAwardReceipt({ receipt, supplier }: { receipt: AwardReceipt; supplier: Supplier }) {
  return (
    <section className="relative overflow-hidden border border-ofora-deep/15 bg-white p-5">
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(#063524_1px,transparent_1px),linear-gradient(90deg,#063524_1px,transparent_1px)] [background-size:20px_20px]" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <OforaMark className="h-9 w-9" />
          <div>
            <h3 className="text-lg font-black tracking-[-0.04em] text-ofora-deep">Fair Award Receipt</h3>
            <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-ofora-green">Award integrity confirmed</p>
          </div>
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ofora-mist">
          <span className="h-10 w-10 rounded-full border-[8px] border-ofora-green" />
        </div>
      </div>
      <dl className="relative mt-6 grid gap-0 text-sm">
        <Row label="Receipt ID" value={receipt.id} />
        <Row label="Tender ID" value={receipt.tenderId} />
        <Row label="Awarded supplier" value={supplier.name} />
        <Row label="Policy version" value={receipt.policyVersion} />
        <Row label="Validation timestamp" value={formatDateTime(receipt.validationTimestamp)} />
        <Row label="Award status" value={receipt.awardStatus} positive />
        <Row label="Payment status" value={receipt.paymentStatus} positive />
        <Row label="Policy integrity" value={receipt.policyIntegrity} positive />
      </dl>
    </section>
  );
}

function Row({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="grid grid-cols-[0.8fr_1fr] gap-4 border-b border-ofora-border py-3">
      <dt className="text-ofora-muted">{label}</dt>
      <dd className={positive ? "font-black text-ofora-green" : "font-semibold text-ofora-ink"}>{value}</dd>
    </div>
  );
}
