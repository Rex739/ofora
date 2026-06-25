"use client";

import { useEffect, useMemo, useState } from "react";
import { ReactNode } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, CheckCircle2, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { OforaMark } from "@/components/landing/ofora-mark";
import { AppButton, InlineMetric, RecordPanel } from "@/components/shared/app-primitives";
import { AwardPolicyCard } from "@/components/tenders/award-policy-card";
import { TenderTimeline } from "@/components/tenders/tender-timeline";
import { getAwardState, issueReceipt, markPaymentReady, recordAwardAttempt, resetAwardState, StoredAwardState } from "@/lib/award-store";
import { evaluateSupplierAssessments, getDemoEvaluationSubmissions, getHighestEligibleAssessment, SupplierAssessment } from "@/lib/evaluation-engine";
import { createFairAwardReceipt } from "@/lib/receipt-utils";
import { primaryTender } from "@/lib/mock-data";
import { PaymentStatus, Tender } from "@/lib/types";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";

export function EvaluationWorkspace({ tender }: { tender: Tender }) {
  const assessments = useMemo(() => evaluateSupplierAssessments(getDemoEvaluationSubmissions(), tender.policy), [tender.policy]);
  const highestEligible = useMemo(() => getHighestEligibleAssessment(assessments), [assessments]);
  const [awardState, setAwardState] = useState<StoredAwardState | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState("sup-nova");
  const [drawerSupplierId, setDrawerSupplierId] = useState<string | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const state = getAwardState(tender.id);
    setAwardState(state);
    setSelectedSupplierId(state.selectedSupplierId ?? "sup-nova");
  }, [tender.id]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  if (!awardState) {
    return <RecordPanel className="p-6"><p className="text-sm font-semibold text-ofora-muted">Loading confidential evaluation workspace...</p></RecordPanel>;
  }

  const drawerAssessment = assessments.find((assessment) => assessment.supplierId === drawerSupplierId) ?? null;
  const eligibleCount = assessments.filter((assessment) => assessment.eligible).length;
  const ineligibleCount = assessments.length - eligibleCount;
  const timelineEvents = [
    ...awardState.auditEvents,
    {
      id: "submissions-closed",
      label: "Supplier submissions closed",
      timestamp: "2026-06-25T09:00:00.000Z",
      description: "Submission intake closed with three confidential supplier proposals received.",
      actor: "Elena Marquez",
      eventType: "submissions_closed"
    },
    {
      id: "rules-locked",
      label: "Selection rules locked",
      timestamp: tender.policy.lockedAt,
      description: "Selection rules were locked before supplier submissions opened.",
      actor: "Elena Marquez",
      eventType: "policy_locked"
    }
  ];

  function validateAward() {
    if (!awardState) return;
    const assessment = assessments.find((item) => item.supplierId === selectedSupplierId);
    if (!assessment) return;

    if (!assessment.eligible) {
      const next = recordAwardAttempt(awardState, {
        supplierId: assessment.supplierId,
        supplierName: assessment.supplierName,
        status: "Not eligible",
        title: "Supplier not eligible for award",
        description: "A supplier did not meet the delivery requirement specified in the locked selection rules.",
        eventType: "award_ineligible"
      });
      setAwardState(next);
      setToast("Supplier cannot be considered for award.");
      return;
    }

    if (highestEligible && assessment.supplierId !== highestEligible.supplierId) {
      const next = recordAwardAttempt(awardState, {
        supplierId: assessment.supplierId,
        supplierName: assessment.supplierName,
        status: "Blocked",
        title: "Award validation blocked",
        description: "An award attempt did not match the highest-scoring eligible supplier under the locked selection rules.",
        eventType: "award_blocked"
      });
      setAwardState(next);
      setToast("Award blocked. A higher-ranked eligible supplier exists.");
      return;
    }

    const validated = recordAwardAttempt(awardState, {
      supplierId: assessment.supplierId,
      supplierName: assessment.supplierName,
      status: "Validated",
      title: "Award independently validated",
      description: "The selected supplier was confirmed as the highest-scoring eligible submission under the locked selection rules.",
      eventType: "award_validated"
    });
    const withReceipt = issueReceipt(
      validated,
      createFairAwardReceipt({
        tenderId: tender.id,
        supplierId: assessment.supplierId,
        supplierName: assessment.supplierName,
        awardValue: assessment.price,
        currency: tender.currency,
        policyVersion: tender.policy.version
      })
    );
    setAwardState(withReceipt);
    setToast("Award validated. Fair Award Receipt issued.");
  }

  return (
    <div className="space-y-8">
      {toast ? <div className="fixed right-5 top-5 z-[80] max-w-sm rounded-lg border border-ofora-verify/30 bg-ofora-mist px-4 py-3 text-sm font-black text-ofora-green shadow-panel">{toast}</div> : null}
      <section className="border-y border-ofora-border bg-white px-5 py-4 text-sm font-semibold text-ofora-muted">
        Supplier proposals are being assessed against the selection rules locked before submissions began.
      </section>

      <div className="grid gap-6 xl:grid-cols-12">
        <main className="space-y-6 xl:col-span-8">
          <SupplierAssessmentList
            assessments={assessments}
            onReview={(assessment) => setDrawerSupplierId(assessment.supplierId)}
          />
          <EligibilitySummary eligibleCount={eligibleCount} ineligibleCount={ineligibleCount} highestScore={highestEligible?.finalScore ?? 0} awardState={awardState} />
          <ConfidentialEvaluationDetails />
          <TenderTimeline events={timelineEvents} />
        </main>

        <aside className="space-y-6 xl:col-span-4">
          <AwardDecisionPanel
            assessments={assessments}
            selectedSupplierId={selectedSupplierId}
            awardState={awardState}
            onSelect={(supplierId) => setSelectedSupplierId(supplierId)}
            onValidate={validateAward}
            onReview={(supplierId) => setDrawerSupplierId(supplierId)}
          />
          <AwardPolicyCard policy={tender.policy} />
          <PaymentReadinessPanel awardState={awardState} onPrepare={() => setPaymentOpen(true)} />
          {awardState.receipt ? <FairAwardReceipt receipt={awardState.receipt} onPrepare={() => setPaymentOpen(true)} /> : null}
          {process.env.NODE_ENV !== "production" ? (
            <RecordPanel className="border-dashed p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-ofora-muted">Development helper</p>
              <p className="mt-2 text-sm leading-6 text-ofora-muted">Reset this tender to evaluation in progress with three seeded supplier assessments.</p>
              <button
                type="button"
                onClick={() => {
                  const next = resetAwardState(tender.id);
                  setAwardState(next);
                  setSelectedSupplierId("sup-nova");
                  setToast("Evaluation demo reset.");
                }}
                className="ofora-focus mt-4 rounded-lg border border-ofora-border bg-white px-4 py-2.5 text-sm font-black text-ofora-deep"
              >
                Reset evaluation demo
              </button>
            </RecordPanel>
          ) : null}
        </aside>
      </div>

      <ConfidentialAssessmentDrawer
        assessment={drawerAssessment}
        open={Boolean(drawerAssessment)}
        onOpenChange={(open) => {
          if (!open) setDrawerSupplierId(null);
        }}
        onSelect={(supplierId) => {
          setSelectedSupplierId(supplierId);
          setDrawerSupplierId(null);
        }}
      />
      <PaymentReleaseModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        awardState={awardState}
        onConfirm={() => {
          const next = markPaymentReady(awardState);
          setAwardState(next);
          setPaymentOpen(false);
          setToast("Award marked ready for controlled release.");
        }}
      />
    </div>
  );
}

function SupplierAssessmentList({ assessments, onReview }: { assessments: SupplierAssessment[]; onReview: (assessment: SupplierAssessment) => void }) {
  return (
    <section id="supplier-assessments" className="border border-ofora-border bg-white">
      <div className="border-b border-ofora-border p-6">
        <h2 className="text-3xl font-black tracking-[-0.06em] text-ofora-deep">Supplier assessments</h2>
        <p className="mt-2 text-sm leading-6 text-ofora-muted">Review whether each supplier meets the tender requirements before making an award decision.</p>
      </div>
      <div className="divide-y divide-ofora-border">
        {assessments.map((assessment) => (
          <article key={assessment.supplierId} className="grid gap-4 p-5 md:grid-cols-[minmax(0,1.2fr)_1fr_auto] md:items-center">
            <div>
              <h3 className="text-xl font-black tracking-[-0.04em] text-ofora-deep">{assessment.supplierName}</h3>
              <p className="mt-1 text-sm text-ofora-muted">Submitted {formatDateTime(assessment.submittedAt)}</p>
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <StatusPair label="Requirement status" value={assessment.requirementStatus} positive={assessment.eligible} />
              <StatusPair label="Assessment status" value={assessment.assessmentStatus} positive={assessment.eligible} />
              <StatusPair label="Dossier" value="Commercial proposal protected" positive />
              <StatusPair label="Review status" value="Complete" positive />
            </dl>
            <button type="button" onClick={() => onReview(assessment)}>
              <AppButton variant="tertiary" className="w-full md:w-auto">Review confidential assessment</AppButton>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function EligibilitySummary({ eligibleCount, ineligibleCount, highestScore, awardState }: { eligibleCount: number; ineligibleCount: number; highestScore: number; awardState: StoredAwardState }) {
  return (
    <RecordPanel className="p-6">
      <div className="border-b border-ofora-border pb-4">
        <h2 className="text-3xl font-black tracking-[-0.06em] text-ofora-deep">Evaluation summary</h2>
        <p className="mt-2 text-sm leading-6 text-ofora-muted">Ofora checks that suppliers meet the tender’s minimum requirements before comparing eligible submissions.</p>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-4">
        <InlineMetric label="Eligible suppliers" value={`${eligibleCount}`} />
        <InlineMetric label="Suppliers not eligible" value={`${ineligibleCount}`} />
        <InlineMetric label="Highest eligible score" value={highestScore.toFixed(1)} />
        <InlineMetric label="Award status" value={awardState.decisionStatus === "Validated" ? "Award validated" : "Awaiting validation"} />
      </div>
    </RecordPanel>
  );
}

function ConfidentialEvaluationDetails() {
  return (
    <RecordPanel className="p-6">
      <h2 className="text-2xl font-black tracking-[-0.055em] text-ofora-deep">Confidential evaluation details</h2>
      <div className="mt-5 grid gap-px overflow-hidden border border-ofora-border bg-ofora-border md:grid-cols-3">
        {["Mandatory requirements checked first", "Eligible suppliers ranked by locked priorities", "Losing commercial details remain protected"].map((item) => (
          <div key={item} className="bg-white p-5 text-sm font-semibold leading-6 text-ofora-muted">{item}</div>
        ))}
      </div>
    </RecordPanel>
  );
}

function AwardDecisionPanel({
  assessments,
  selectedSupplierId,
  awardState,
  onSelect,
  onValidate,
  onReview
}: {
  assessments: SupplierAssessment[];
  selectedSupplierId: string;
  awardState: StoredAwardState;
  onSelect: (supplierId: string) => void;
  onValidate: () => void;
  onReview: (supplierId: string) => void;
}) {
  const selected = assessments.find((assessment) => assessment.supplierId === selectedSupplierId) ?? assessments[0];

  return (
    <section className="border border-ofora-border bg-white xl:sticky xl:top-28">
      <div className="bg-ofora-deep p-6 text-white">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#E7F5B8]">Award decision</p>
        <h2 className="mt-4 text-3xl font-black leading-none tracking-[-0.06em]">Select an award candidate</h2>
        <p className="mt-4 text-sm leading-6 text-white/68">Select a supplier. Ofora will confirm whether the award follows the rules locked before submissions began.</p>
      </div>
      <div className="p-5">
        <div className="grid gap-3">
          {assessments.map((assessment) => {
            const selectedRow = selectedSupplierId === assessment.supplierId;
            return (
              <button
                key={assessment.supplierId}
                type="button"
                onClick={() => onSelect(assessment.supplierId)}
                className={cn(
                  "ofora-focus border p-4 text-left transition hover:border-ofora-green",
                  selectedRow ? "border-ofora-green bg-ofora-mist" : "border-ofora-border bg-white"
                )}
              >
                <span className="flex items-start justify-between gap-4">
                  <span>
                    <span className="block text-base font-black tracking-[-0.035em] text-ofora-deep">{assessment.supplierName}</span>
                    <span className="mt-2 block text-sm font-semibold text-ofora-muted">{assessment.assessmentStatus}</span>
                  </span>
                  <span className={cn("mt-1 h-4 w-4 border", selectedRow ? "border-ofora-green bg-ofora-green" : "border-ofora-border bg-white")} />
                </span>
                <span className="mt-3 block text-xs font-black uppercase tracking-[0.12em] text-ofora-muted">{assessment.requirementStatus}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onValidate}
          className="ofora-focus mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ofora-deep px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-ofora-green"
        >
          <ShieldCheck className="h-4 w-4" />Validate award
        </button>
        <ValidationOutcome state={awardState} selected={selected} onReview={onReview} onChooseAnother={() => onSelect("sup-nova")} />
      </div>
    </section>
  );
}

function ValidationOutcome({ state, selected, onReview, onChooseAnother }: { state: StoredAwardState; selected: SupplierAssessment; onReview: (supplierId: string) => void; onChooseAnother: () => void }) {
  if (state.decisionStatus === "Draft") return null;

  if (state.decisionStatus === "Blocked") {
    return (
      <OutcomeShell tone="blocked" label="Award blocked" title="This supplier cannot be awarded this tender." icon={<ShieldAlert className="h-5 w-5" />}>
        <p>Atlas Supply Group meets the minimum requirements, but another eligible supplier achieved a higher score under the selection rules locked for this tender.</p>
        <OutcomeRows rows={[["Requirement status", "Eligible"], ["Award result", "Not validated"], ["Policy integrity", "Preserved"], ["Recommendation", "Review the highest-scoring eligible supplier before continuing."]]} />
        <p className="mt-4 border-t border-ofora-border pt-4 text-xs font-black uppercase tracking-[0.12em] text-ofora-muted">A higher-ranked eligible supplier exists.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={() => onReview("sup-nova")} className="ofora-focus rounded-lg bg-ofora-deep px-3 py-2.5 text-sm font-black text-white">Review eligible suppliers</button>
          <button type="button" onClick={onChooseAnother} className="ofora-focus rounded-lg border border-ofora-border bg-white px-3 py-2.5 text-sm font-black text-ofora-deep">Choose another supplier</button>
        </div>
      </OutcomeShell>
    );
  }

  if (state.decisionStatus === "Not eligible") {
    return (
      <OutcomeShell tone="blocked" label="Not eligible" title="This supplier cannot be considered for award." icon={<ShieldAlert className="h-5 w-5" />}>
        <p>Meridian Industrial Ltd. does not meet the delivery requirement set before supplier submissions began.</p>
        <OutcomeRows rows={[["Requirement", "Delivery within 14 days"], ["Submitted delivery time", "18 days"], ["Result", "Not eligible"], ["Policy integrity", "Preserved"]]} />
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={() => onReview(selected.supplierId)} className="ofora-focus rounded-lg bg-ofora-deep px-3 py-2.5 text-sm font-black text-white">Review supplier assessment</button>
          <button type="button" onClick={onChooseAnother} className="ofora-focus rounded-lg border border-ofora-border bg-white px-3 py-2.5 text-sm font-black text-ofora-deep">Choose another supplier</button>
        </div>
      </OutcomeShell>
    );
  }

  return (
    <OutcomeShell tone="validated" label="Award validated" title="This supplier can be awarded the tender." icon={<CheckCircle2 className="h-5 w-5" />}>
      <p>Nova Relief Systems has been independently confirmed as the highest-scoring eligible supplier under the selection rules locked before submissions began.</p>
      <OutcomeRows rows={[["Requirement status", "Eligible"], ["Award result", "Validated"], ["Policy integrity", "Confirmed"], ["Payment status", "Ready for controlled release"]]} positive />
    </OutcomeShell>
  );
}

function ConfidentialAssessmentDrawer({ assessment, open, onOpenChange, onSelect }: { assessment: SupplierAssessment | null; open: boolean; onOpenChange: (open: boolean) => void; onSelect: (supplierId: string) => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ofora-ink/35" />
        <Dialog.Content className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-panel">
          {assessment ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Dialog.Title className="text-4xl font-black tracking-[-0.07em] text-ofora-deep">Confidential supplier assessment</Dialog.Title>
                  <Dialog.Description className="mt-2 text-base font-black text-ofora-green">{assessment.supplierName}</Dialog.Description>
                </div>
                <Dialog.Close className="ofora-focus rounded-md p-2" aria-label="Close assessment">
                  <X className="h-5 w-5" />
                </Dialog.Close>
              </div>
              <div className="mt-6 border border-ofora-green/25 bg-ofora-mist p-4 text-sm font-semibold leading-6 text-ofora-muted">
                This information is protected and available only to authorized procurement reviewers.
              </div>
              <DrawerSection title="Submission overview">
                <DrawerRows rows={[["Supplier name", assessment.supplierName], ["Submission reference", assessment.submissionId], ["Submitted date", formatDateTime(assessment.submittedAt)], ["Proposal status", "Received"]]} />
              </DrawerSection>
              <DrawerSection title="Requirement check">
                <h3 className={cn("text-xl font-black", assessment.eligible ? "text-ofora-green" : "text-ofora-deep")}>{assessment.requirementStatus}</h3>
                <ul className="mt-4 grid gap-3 text-sm text-ofora-muted">
                  <CheckLine ok label="Quality rating meets the required minimum" />
                  <CheckLine ok={assessment.deliveryDays <= primaryTender.policy.maximumDeliveryDays} label={assessment.deliveryDays <= primaryTender.policy.maximumDeliveryDays ? "Delivery time meets the required maximum" : "Delivery time exceeds the 14-day maximum"} />
                  <CheckLine ok label="Required submission details provided" />
                </ul>
              </DrawerSection>
              <DrawerSection title="Confidential proposal details">
                <DrawerRows rows={[["Proposed price", formatCurrency(assessment.price)], ["Delivery timeline", `${assessment.deliveryDays} days`], ["Stock availability", `${assessment.stockAvailability}%`], ["Quality and certification rating", `${assessment.qualityScore} / 100`], ["Local economic contribution", `${assessment.localContributionScore} / 100`], ["Supporting documents", assessment.documentMetadata.join(", ")]]} />
              </DrawerSection>
              <DrawerSection title="Assessment result">
                <h3 className="text-xl font-black text-ofora-deep">{assessment.assessmentStatus}</h3>
                <p className="mt-2 text-sm leading-6 text-ofora-muted">
                  {assessment.eligible ? "This supplier meets the tender’s minimum requirements and can be considered for award." : "This supplier cannot be considered because they do not meet the delivery requirement."}
                </p>
                <DrawerRows rows={assessment.eligible ? [["Assessment score", `${assessment.finalScore?.toFixed(1)} out of 100`]] : [["Reason", "Delivery time exceeds the maximum 14-day requirement."]]} />
              </DrawerSection>
              <button type="button" onClick={() => onSelect(assessment.supplierId)} className="ofora-focus mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ofora-deep px-4 py-3 text-sm font-black text-white">
                Add to award decision <ArrowRight className="h-4 w-4" />
              </button>
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function FairAwardReceipt({ receipt, onPrepare }: { receipt: NonNullable<StoredAwardState["receipt"]>; onPrepare: () => void }) {
  return (
    <section className="relative overflow-hidden border border-ofora-deep/20 bg-[#fffef8] p-6 shadow-panel">
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(#063524_1px,transparent_1px),linear-gradient(90deg,#063524_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4 border-b border-ofora-border pb-5">
          <div className="flex items-center gap-3">
            <OforaMark className="h-10 w-10" />
            <div>
              <h2 className="text-2xl font-black tracking-[-0.055em] text-ofora-deep">Fair Award Receipt</h2>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-ofora-green">Independent award validation record</p>
            </div>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-ofora-green bg-ofora-mist text-ofora-green">
            <ShieldCheck className="h-8 w-8" />
          </div>
        </div>
        <dl className="mt-5 grid gap-0 text-sm">
          <ReceiptRow label="Receipt ID" value={receipt.id} />
          <ReceiptRow label="Tender" value="Emergency Solar Lantern Procurement" />
          <ReceiptRow label="Tender ID" value={receipt.tenderId} />
          <ReceiptRow label="Organization" value="Global Relief & Infrastructure Network" />
          <ReceiptRow label="Awarded supplier" value={receipt.supplierName} />
          <ReceiptRow label="Award value" value={`${formatCurrency(receipt.awardValue, receipt.currency)} ${receipt.currency}`} />
          <ReceiptRow label="Selection rules" value="Locked before supplier submissions" />
          <ReceiptRow label="Validation status" value={receipt.validationStatus} positive />
          <ReceiptRow label="Payment readiness" value={receipt.paymentStatus} positive />
          <ReceiptRow label="Validation timestamp" value={formatDateTime(receipt.issuedAt)} />
        </dl>
        <p className="mt-5 border-y border-ofora-border py-4 text-sm font-semibold text-ofora-muted">Competing supplier proposals remain confidential.</p>
        <div className="mt-5 grid gap-2">
          <Link href="/audit/audit-ofr-2026-041" className="ofora-focus inline-flex justify-center rounded-lg border border-ofora-border bg-white px-4 py-3 text-sm font-black text-ofora-deep">View audit record</Link>
          <button type="button" className="ofora-focus rounded-lg border border-ofora-border bg-white px-4 py-3 text-sm font-black text-ofora-deep">Export receipt</button>
          <button type="button" onClick={onPrepare} className="ofora-focus rounded-lg bg-ofora-green px-4 py-3 text-sm font-black text-white">Proceed to payment release</button>
        </div>
      </div>
    </section>
  );
}

function PaymentReadinessPanel({ awardState, onPrepare }: { awardState: StoredAwardState; onPrepare: () => void }) {
  const ready = awardState.decisionStatus === "Validated";
  return (
    <RecordPanel className="p-6">
      <h2 className="text-xl font-black tracking-[-0.05em] text-ofora-deep">Payment readiness</h2>
      <p className={cn("mt-4 text-2xl font-black tracking-[-0.05em]", ready ? "text-ofora-green" : "text-ofora-muted")}>
        {ready ? PaymentStatus.ReadyForControlledRelease : "Not ready"}
      </p>
      <p className="mt-3 text-sm leading-6 text-ofora-muted">
        {ready ? "The award has been validated against the tender’s locked rules. Payment can now proceed through the organization’s approved process." : "Payment readiness stays inactive until the award is validated."}
      </p>
      {ready ? <button type="button" onClick={onPrepare} className="ofora-focus mt-5 rounded-lg bg-ofora-deep px-4 py-3 text-sm font-black text-white">Prepare payment release</button> : null}
    </RecordPanel>
  );
}

function PaymentReleaseModal({ open, onOpenChange, awardState, onConfirm }: { open: boolean; onOpenChange: (open: boolean) => void; awardState: StoredAwardState; onConfirm: () => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ofora-ink/35" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 border border-ofora-border bg-white p-6 shadow-panel">
          <Dialog.Title className="text-3xl font-black tracking-[-0.06em] text-ofora-deep">Prepare payment release</Dialog.Title>
          <Dialog.Description className="mt-3 text-sm leading-6 text-ofora-muted">
            This confirms that the validated award is ready to move into your organization’s approved payment process.
          </Dialog.Description>
          <dl className="mt-5 grid gap-3 border border-ofora-border bg-ofora-canvas p-4 text-sm">
            <ReceiptRow label="Awarded supplier" value={awardState.receipt?.supplierName ?? "Not validated"} />
            <ReceiptRow label="Award value" value={awardState.receipt ? formatCurrency(awardState.receipt.awardValue, awardState.receipt.currency) : "Not available"} />
            <ReceiptRow label="Fair Award Receipt ID" value={awardState.receipt?.id ?? "Not issued"} />
            <ReceiptRow label="Validation status" value={awardState.receipt?.validationStatus ?? "Not validated"} />
          </dl>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Dialog.Close className="ofora-focus rounded-lg border border-ofora-border bg-white px-4 py-2.5 text-sm font-black text-ofora-deep">Cancel</Dialog.Close>
            <button type="button" onClick={onConfirm} className="ofora-focus rounded-lg bg-ofora-green px-4 py-2.5 text-sm font-black text-white">Mark as ready for payment</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function StatusPair({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-black uppercase tracking-[0.12em] text-ofora-muted">{label}</dt>
      <dd className={cn("mt-1 font-black", positive ? "text-ofora-green" : "text-ofora-deep")}>{value}</dd>
    </div>
  );
}

function OutcomeShell({ tone, label, title, icon, children }: { tone: "blocked" | "validated"; label: string; title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className={cn("mt-5 border p-5", tone === "validated" ? "border-ofora-verify/30 bg-ofora-mist" : "border-amber-200 bg-[#FFF8EA]")}>
      <div className="flex items-start gap-3">
        <span className={tone === "validated" ? "text-ofora-green" : "text-[#8A5A00]"}>{icon}</span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ofora-muted">{label}</p>
          <h3 className="mt-2 text-xl font-black tracking-[-0.04em] text-ofora-deep">{title}</h3>
          <div className="mt-3 text-sm leading-6 text-ofora-muted">{children}</div>
        </div>
      </div>
    </div>
  );
}

function OutcomeRows({ rows, positive }: { rows: [string, string][]; positive?: boolean }) {
  return (
    <dl className="mt-4 grid gap-2 border-y border-ofora-border py-3">
      {rows.map(([label, value]) => <ReceiptRow key={label} label={label} value={value} positive={positive && (label.includes("status") || label.includes("result"))} />)}
    </dl>
  );
}

function DrawerSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6 border-t border-ofora-border pt-5">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-ofora-green">{title}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DrawerRows({ rows }: { rows: [string, string][] }) {
  return <dl className="grid gap-0 text-sm">{rows.map(([label, value]) => <ReceiptRow key={label} label={label} value={value} />)}</dl>;
}

function CheckLine({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className={cn("mt-0.5 font-black", ok ? "text-ofora-green" : "text-[#8A5A00]")}>{ok ? "✓" : "✕"}</span>
      <span>{label}</span>
    </li>
  );
}

function ReceiptRow({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="grid grid-cols-[0.85fr_1fr] gap-4 border-b border-ofora-border py-3">
      <dt className="text-ofora-muted">{label}</dt>
      <dd className={cn("font-semibold text-ofora-ink", positive && "font-black text-ofora-green")}>{value}</dd>
    </div>
  );
}
