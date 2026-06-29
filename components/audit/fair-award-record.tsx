import { OforaMark } from "@/components/landing/ofora-mark";
import { EvidenceReference } from "@/components/shared/evidence-reference";
import { MetadataRow } from "@/components/shared/app-primitives";
import { AuditRecord } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { testnetEvidence } from "@/lib/verification-evidence";

const verificationMode = process.env.NEXT_PUBLIC_OFORA_VERIFICATION_MODE === "real" ? "real" : "mock";

export function FairAwardRecord({ record }: { record: AuditRecord }) {
  const realMode = verificationMode === "real";

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
        <section className="mt-5 border border-ofora-green/25 bg-ofora-mist p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-ofora-green">Independent verification</p>
              <h3 className="mt-2 text-xl font-black tracking-[-0.045em] text-ofora-deep">
                {realMode ? "Verified on Stellar testnet" : "Local demo verification"}
              </h3>
              <ul className="mt-3 grid gap-2 text-sm font-semibold text-ofora-muted sm:grid-cols-2">
                <li>Groth16 proof verified</li>
                <li>Verification receipt recorded</li>
                <li>Award record finalized</li>
                <li>Protected bid data withheld</li>
              </ul>
            </div>
            <a href="#stellar-evidence" className="ofora-focus inline-flex min-h-11 items-center justify-center rounded-lg bg-ofora-deep px-4 py-2.5 text-sm font-black text-white transition hover:bg-ofora-green">
              View all verification evidence
            </a>
          </div>
        </section>
        <dl className="mt-5 grid gap-0">
          <MetadataRow label="Tender" value="Emergency Solar Lantern Procurement" />
          <MetadataRow label="Tender reference" value={testnetEvidence.tenderReference} />
          <MetadataRow label="Organization" value={record.organization} />
          <MetadataRow label="Awarded supplier" value={testnetEvidence.selectedSupplierDisplayName} />
          <MetadataRow label="Fair Award Receipt" value={testnetEvidence.fairAwardReceiptId} />
          <MetadataRow label="Selection rules" value="Locked before supplier submissions" />
          <MetadataRow label="Verification" value={realMode ? "Confirmed on Stellar testnet" : "Local demo verification"} />
          <MetadataRow label="Award record" value={realMode ? "Finalized on Stellar testnet" : "Local demo record"} />
          <MetadataRow label="Tender status" value={testnetEvidence.finalTenderStatus} />
          <MetadataRow label="Payment status" value="Controlled release eligible" />
          <MetadataRow label="Timestamp" value={formatDateTime(testnetEvidence.validationTimestamp)} />
        </dl>
        <section id="stellar-evidence" className="mt-6 scroll-mt-28 border-t border-ofora-border pt-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-ofora-green">Stellar evidence</p>
              <h3 className="mt-1 text-2xl font-black tracking-[-0.055em] text-ofora-deep">Public verification references</h3>
            </div>
            <p className="max-w-md text-sm font-semibold leading-6 text-ofora-muted">
              {realMode ? "Open each public reference in StellarExpert Testnet or copy the exact identifier." : "Explorer actions are hidden in local demo mode."}
            </p>
          </div>
          <dl className="mt-4 grid gap-0">
            <EvidenceReference label="Verification receipt transaction" value={testnetEvidence.verificationReceiptTransactionHash} kind="transaction" realMode={realMode} />
            <EvidenceReference label="Award-record finalization transaction" value={testnetEvidence.registryFinalizationTransactionHash} kind="transaction" realMode={realMode} />
            <EvidenceReference label="Verifier receipt contract" value={testnetEvidence.verifierReceiptContractId} kind="contract" realMode={realMode} />
            <EvidenceReference label="Registry contract" value={testnetEvidence.registryContractId} kind="contract" realMode={realMode} />
          </dl>
        </section>
        <p className="mt-5 border-t border-ofora-border pt-4 text-sm font-semibold text-ofora-muted">Payment execution is not included in this hackathon MVP.</p>
      </div>
    </section>
  );
}
