"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { FairAwardReceipt } from "@/components/tenders/fair-award-receipt";
import { submissions } from "@/lib/mock-data";
import { evaluateSubmissions } from "@/lib/scoring";
import { AwardDecision, Supplier, Tender, ValidationStatus } from "@/lib/types";
import { localReceiptGenerator, localValidationProvider } from "@/lib/validation";
import { cn } from "@/lib/utils";

export function AwardDecisionPanel({ tender, suppliers }: { tender: Tender; suppliers: Supplier[] }) {
  const [selectedSupplierId, setSelectedSupplierId] = useState("sup-atlas");
  const [decision, setDecision] = useState<AwardDecision | null>(null);
  const tenderSubmissions = submissions.filter((submission) => submission.tenderId === tender.id);
  const results = useMemo(() => evaluateSubmissions(tenderSubmissions, tender.policy), [tender.policy, tenderSubmissions]);
  const selectedSupplier = suppliers.find((supplier) => supplier.id === selectedSupplierId) ?? suppliers[0];
  const selectedResult = results.find((result) => result.supplierId === selectedSupplierId);
  const receipt =
    decision?.validationStatus === ValidationStatus.Validated
      ? localReceiptGenerator.createReceipt({ tenderId: tender.id, awardedSupplierId: selectedSupplierId, policyVersion: tender.policy.version })
      : null;

  return (
    <aside className="border border-ofora-border bg-white xl:sticky xl:top-28">
      <div className="bg-ofora-deep p-6 text-white">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#E7F5B8]">Award Decision</p>
        <h2 className="mt-4 text-3xl font-black leading-none tracking-[-0.06em]">Select an award candidate</h2>
        <p className="mt-4 text-sm leading-6 text-white/68">Independent validation will confirm whether this award satisfies the locked policy.</p>
      </div>
      <div className="p-5">
        <div className="grid gap-3">
          {suppliers.map((supplier) => {
            const result = results.find((item) => item.supplierId === supplier.id);
            const selected = selectedSupplierId === supplier.id;
            return (
              <button
                key={supplier.id}
                type="button"
                onClick={() => {
                  setSelectedSupplierId(supplier.id);
                  setDecision(null);
                }}
                className={cn(
                  "ofora-focus border p-4 text-left transition hover:border-ofora-green",
                  selected ? "border-ofora-green bg-ofora-mist" : "border-ofora-border bg-white"
                )}
              >
                <span className="block text-base font-black tracking-[-0.035em] text-ofora-deep">{supplier.name}</span>
                <span className="mt-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-ofora-muted">
                  {result?.eligible ? "Eligible" : "Not eligible"}
                  <span>{result?.totalScore ? result.totalScore.toFixed(1) : "N/A"}</span>
                </span>
              </button>
            );
          })}
        </div>
        <dl className="mt-5 grid gap-3 border-y border-ofora-border py-4 text-sm">
          <div className="flex justify-between"><dt className="text-ofora-muted">Eligibility</dt><dd className="font-black text-ofora-deep">{selectedResult?.eligible ? "Eligible" : "Ineligible"}</dd></div>
          <div className="flex justify-between"><dt className="text-ofora-muted">Policy score</dt><dd className="font-black text-ofora-deep">{selectedResult?.totalScore ? selectedResult.totalScore.toFixed(1) : "Not applicable"}</dd></div>
        </dl>
        <button
          className="ofora-focus mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ofora-deep px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-ofora-green"
          onClick={() => setDecision(localValidationProvider.validateAward({ tenderId: tender.id, selectedSupplierId, policy: tender.policy }))}
        >
          <ShieldCheck className="h-4 w-4" />Validate award
        </button>
        {decision ? (
          <div className={decision.validationStatus === ValidationStatus.Validated ? "mt-5 border border-ofora-verify/30 bg-ofora-mist p-5" : "mt-5 border border-amber-200 bg-[#FFF7E8] p-5"}>
            <div className="flex items-start gap-3">
              {decision.validationStatus === ValidationStatus.Validated ? <CheckCircle2 className="h-5 w-5 text-ofora-green" /> : <AlertTriangle className="h-5 w-5 text-[#8A5A00]" />}
              <div>
                <h3 className="text-xl font-black uppercase tracking-[-0.03em] text-ofora-deep">{decision.validationStatus === ValidationStatus.Validated ? "Award validated" : selectedResult?.eligible ? "Award blocked" : "Not eligible"}</h3>
                <p className="mt-3 text-sm leading-6 text-ofora-muted">{decision.explanation}</p>
                {decision.validationStatus !== ValidationStatus.Validated ? (
                  <div className="mt-4 space-y-2 text-sm text-ofora-ink">
                    <p><span className="font-black">Policy integrity:</span> Preserved</p>
                    <p><span className="font-black">Recommendation:</span> Review Nova Relief Systems.</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
        {receipt ? (
          <div className="mt-5">
            <FairAwardReceipt receipt={receipt} supplier={selectedSupplier} />
            <Link href="/audit/audit-ofr-2026-041" className="ofora-focus mt-4 inline-flex w-full justify-center rounded-lg border border-ofora-border bg-white px-4 py-3 text-sm font-black text-ofora-deep hover:border-ofora-green">
              View Fair Award Receipt
            </Link>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
