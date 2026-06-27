import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, LockKeyhole, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AppButton, InlineMetric, PageHero, RecordPanel } from "@/components/shared/app-primitives";
import { StatusBadge } from "@/components/shared/status-badge";
import { AwardDecisionPanel } from "@/components/tenders/award-decision-panel";
import { AwardPolicyCard } from "@/components/tenders/award-policy-card";
import { SupplierSubmissionsTable } from "@/components/tenders/supplier-submissions-table";
import { TenderSubmissionWorkspace } from "@/components/tenders/tender-submission-workspace";
import { EvaluationWorkspace } from "@/components/evaluation/evaluation-workspace";
import { TenderTimeline } from "@/components/tenders/tender-timeline";
import { primaryTender, submissions, suppliers, tenderList } from "@/lib/mock-data";
import { evaluateSubmissions } from "@/lib/scoring";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default async function TenderDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ locked?: string; evaluation?: string }>;
}) {
  const { id } = await params;
  const { locked, evaluation } = await searchParams;
  const tender = tenderList.find((item) => item.id === id) ?? (id === primaryTender.id ? primaryTender : undefined);

  if (!tender) notFound();

  const justLocked = locked === "1";
  const evaluationMode = locked === "evaluation" || evaluation === "1";
  const tenderSubmissions = submissions.filter((submission) => submission.tenderId === primaryTender.id);
  const results = evaluateSubmissions(tenderSubmissions, tender.policy);
  const displayStatus = justLocked ? "Open for submissions" : tender.status;
  const displaySubmissions = justLocked ? "0 confidential submissions" : "3 confidential submissions";
  const lockedAt = tender.policyLockedAt ?? tender.policy.lockedAt ?? new Date().toISOString();

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="text-sm font-semibold text-ofora-muted">
          <Link href="/tenders" className="hover:text-ofora-deep">Tenders</Link> / {tender.id}
        </div>
        <PageHero
          eyebrow={evaluationMode ? "CONFIDENTIAL EVALUATION" : tender.organization}
          title={<>Emergency Solar Lantern<br />Procurement</>}
          description={
            evaluationMode
              ? `${tender.id} · ${formatCurrency(tender.budget, tender.currency)} ${tender.currency} ceiling · Submission period closed`
              : `${tender.id} · ${formatCurrency(tender.budget, tender.currency)} ceiling · Deadline ${formatDateTime(tender.deadline)}`
          }
        >
          {evaluationMode ? (
            <>
              <a href="#supplier-assessments"><AppButton><ShieldCheck className="h-4 w-4" />Review supplier assessments</AppButton></a>
              <a href="#tender-record"><AppButton variant="tertiary"><Download className="h-4 w-4" />View tender record</AppButton></a>
            </>
          ) : justLocked ? (
            <>
              <a href="#supplier-invitations"><AppButton><ShieldCheck className="h-4 w-4" />Invite suppliers</AppButton></a>
              <a href="#tender-record"><AppButton variant="tertiary"><Download className="h-4 w-4" />View tender record</AppButton></a>
            </>
          ) : (
            <>
              <a href="#award-decision"><AppButton><ShieldCheck className="h-4 w-4" />Validate award</AppButton></a>
              <button><AppButton variant="tertiary"><Download className="h-4 w-4" />Export tender record</AppButton></button>
            </>
          )}
        </PageHero>
        {evaluationMode ? (
          <div className="border border-ofora-green/20 bg-ofora-mist p-4 text-sm font-semibold text-ofora-green">
            Supplier proposals are being assessed against the selection rules locked before submissions began.
          </div>
        ) : justLocked ? (
          <div className="border border-ofora-green/20 bg-ofora-mist p-4 text-sm font-semibold text-ofora-green">
            Suppliers will now be assessed against the rules you locked on {formatDateTime(lockedAt)}.
          </div>
        ) : null}

        {evaluationMode ? (
          <>
            <RecordPanel className="relative overflow-hidden bg-ofora-deep p-6 text-white">
              <div className="absolute right-0 top-0 h-56 w-56 bg-[#E7F5B8]/10" />
              <div className="relative grid gap-6 xl:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#E7F5B8]">Evaluation status</p>
                  <p className="mt-5 max-w-3xl text-xl leading-8 text-white/78">{tender.summary}</p>
                  <div className="mt-7 grid gap-4 sm:grid-cols-4">
                    <InlineMetric label="Selection rules" value="Locked" inverted />
                    <InlineMetric label="Submissions" value="3 confidential" inverted />
                    <InlineMetric label="Submission period" value="Closed" inverted />
                    <InlineMetric label="Award" value="Awaiting validation" inverted />
                  </div>
                </div>
                <div className="grid gap-3 self-start">
                  <StatusBadge status="Evaluation in progress" />
                  <StatusBadge status="Policy locked" />
                  <span className="inline-flex items-center gap-2 border border-white/15 bg-white/8 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#E7F5B8]">
                    <LockKeyhole className="h-3.5 w-3.5" />3 confidential submissions
                  </span>
                  <StatusBadge status="Award awaiting validation" />
                </div>
              </div>
            </RecordPanel>
            <EvaluationWorkspace tender={tender} />
          </>
        ) : justLocked ? (
          <TenderSubmissionWorkspace tender={tender} lockedAt={lockedAt} />
        ) : (
          <>
            <RecordPanel className="relative overflow-hidden bg-ofora-deep p-6 text-white">
              <div className="absolute right-0 top-0 h-56 w-56 bg-[#E7F5B8]/10" />
              <div className="relative grid gap-6 xl:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#E7F5B8]">Tender identity</p>
                  <p className="mt-5 max-w-3xl text-xl leading-8 text-white/78">{tender.summary}</p>
                  <div className="mt-7 grid gap-4 sm:grid-cols-3">
                    <InlineMetric label="Budget ceiling" value={formatCurrency(tender.budget, tender.currency)} inverted />
                    <InlineMetric label="Timeline" value="14 days max" inverted />
                    <InlineMetric label="Submissions" value="3 confidential" inverted />
                  </div>
                </div>
                <div className="grid gap-3 self-start">
                  <StatusBadge status={displayStatus} />
                  <StatusBadge status="Policy locked" />
                  <span className="inline-flex items-center gap-2 border border-white/15 bg-white/8 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#E7F5B8]">
                    <LockKeyhole className="h-3.5 w-3.5" />{displaySubmissions}
                  </span>
                </div>
              </div>
            </RecordPanel>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
              <div className="min-w-0 space-y-6">
                <AwardPolicyCard policy={tender.policy} />
                <SupplierSubmissionsTable suppliers={suppliers} submissions={tenderSubmissions} policy={tender.policy} />
                <RecordPanel className="p-6">
                  <h2 className="text-2xl font-black tracking-[-0.055em] text-ofora-deep">Evaluation summary</h2>
                  <div className="mt-5 grid gap-3">
                    {results.map((result) => {
                      const supplier = suppliers.find((item) => item.id === result.supplierId);
                      return (
                        <div key={result.supplierId} className="grid gap-3 border-b border-ofora-border py-4 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center">
                          <span className="font-black text-ofora-deep">{supplier?.alias}</span>
                          <span className="text-ofora-muted">{result.eligible ? "Eligible under locked policy" : "Not eligible"}</span>
                          <span className="font-black text-ofora-green">{result.eligible ? `${result.totalScore?.toFixed(1)} policy score` : "Not applicable"}</span>
                        </div>
                      );
                    })}
                  </div>
                </RecordPanel>
                <TenderTimeline events={tender.auditTimeline} />
              </div>
              <div id="award-decision" className="min-w-0 space-y-6">
                <AwardDecisionPanel tender={primaryTender} suppliers={suppliers} />
                <RecordPanel className="p-6">
                  <h2 className="text-xl font-black tracking-[-0.05em] text-ofora-deep">Controlled release status</h2>
                  <p className="mt-4 text-sm leading-6 text-ofora-muted">{tender.status === "Validated" ? "Controlled release eligible. Payment execution is not included in this hackathon MVP." : tender.paymentStatus}</p>
                </RecordPanel>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
