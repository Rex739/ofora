import { OforaMark } from "@/components/landing/ofora-mark";
import { MetadataRow } from "@/components/shared/app-primitives";
import { AuditRecord } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { shortenReference, testnetEvidence } from "@/lib/verification-evidence";

export function FairAwardRecord({ record }: { record: AuditRecord }) {
  return (
    <section className="relative overflow-hidden border border-ofora-deep/20 bg-[#fffef8] p-6 shadow-panel">
      <div className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(#063524_1px,transparent_1px),linear-gradient(90deg,#063524_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="relative">
        <div className="flex flex-col gap-4 border-b border-ofora-border pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <OforaMark className="h-11 w-11" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-ofora-green">FAIR AWARD RECORD</p>
              <h2 className="mt-1 text-3xl font-black tracking-[-0.06em] text-ofora-deep">Award independently validated.</h2>
            </div>
          </div>
          <div className="border border-ofora-green bg-ofora-mist px-4 py-3 text-sm font-black text-ofora-green">Award independently validated</div>
        </div>
        <dl className="mt-5 grid gap-0">
          <MetadataRow label="Tender" value="Emergency Solar Lantern Procurement" />
          <MetadataRow label="Tender reference" value={testnetEvidence.tenderReference} />
          <MetadataRow label="Organization" value={record.organization} />
          <MetadataRow label="Awarded supplier" value={testnetEvidence.selectedSupplierDisplayName} />
          <MetadataRow label="Fair Award Receipt" value={testnetEvidence.fairAwardReceiptId} />
          <MetadataRow label="Selection rules" value="Locked before supplier submissions" />
          <MetadataRow label="Verification" value="Confirmed on Stellar testnet" />
          <MetadataRow label="Award record" value="Finalized on Stellar testnet" />
          <MetadataRow label="Verification receipt reference" value={shortenReference(testnetEvidence.verificationReceiptTransactionHash, 10, 8)} />
          <MetadataRow label="Final award-record reference" value={shortenReference(testnetEvidence.registryFinalizationTransactionHash, 10, 8)} />
          <MetadataRow label="Tender status" value={testnetEvidence.finalTenderStatus} />
          <MetadataRow label="Payment status" value="Controlled release eligible" />
          <MetadataRow label="Timestamp" value={formatDateTime(testnetEvidence.validationTimestamp)} />
        </dl>
        <p className="mt-5 border-t border-ofora-border pt-4 text-sm font-semibold text-ofora-muted">Payment execution is not included in this hackathon MVP.</p>
      </div>
    </section>
  );
}
