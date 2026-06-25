"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, MailPlus, PlayCircle, ShieldCheck } from "lucide-react";
import { AppButton, InlineMetric, RecordPanel } from "@/components/shared/app-primitives";
import { StatusBadge } from "@/components/shared/status-badge";
import { EvaluationWorkspace } from "@/components/evaluation/evaluation-workspace";
import { AwardPolicyCard } from "@/components/tenders/award-policy-card";
import { CloseSubmissionsModal } from "@/components/tenders/close-submissions-modal";
import { ConfidentialSubmissionsList } from "@/components/tenders/confidential-submissions-list";
import { InviteSuppliersModal } from "@/components/tenders/invite-suppliers-modal";
import { InvitedSuppliersList } from "@/components/tenders/invited-suppliers-list";
import { TenderTimeline } from "@/components/tenders/tender-timeline";
import { closeSubmissions, getTenderSubmissionState, seedDemoSubmissions, StoredTenderSubmissionState } from "@/lib/submission-store";
import { Tender } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function TenderSubmissionWorkspace({ tender, lockedAt }: { tender: Tender; lockedAt: string }) {
  const [state, setState] = useState<StoredTenderSubmissionState | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setState(getTenderSubmissionState(tender.id));
  }, [tender.id]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const events = useMemo(() => {
    if (!state) return tender.auditTimeline;
    return [
      ...state.auditEvents.map((event) => ({
        id: event.id,
        label: event.title,
        description: event.description,
        timestamp: event.timestamp,
        actor: event.actor,
        eventType: event.eventType
      })),
      ...tender.auditTimeline
    ];
  }, [state, tender.auditTimeline]);

  if (!state) {
    return (
      <RecordPanel className="p-6">
        <p className="text-sm font-semibold text-ofora-muted">Loading supplier submission workspace...</p>
      </RecordPanel>
    );
  }

  const submissionCount = state.submissions.length;
  const currentStatus = state.status;

  if (currentStatus === "Evaluation in progress") {
    return <EvaluationWorkspace tender={tender} />;
  }

  return (
    <div id="supplier-invitations" className="space-y-6">
      {toast ? (
        <div className="fixed right-5 top-5 z-[70] max-w-sm rounded-lg border border-ofora-verify/30 bg-ofora-mist px-4 py-3 text-sm font-black text-ofora-green shadow-panel">
          {toast}
        </div>
      ) : null}

      <RecordPanel className="relative overflow-hidden bg-ofora-deep p-6 text-white">
        <div className="absolute right-0 top-0 h-56 w-56 bg-[#E7F5B8]/10" />
        <div className="relative grid gap-6 xl:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#E7F5B8]">Submission intake</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.06em] text-white">Open for supplier submissions</h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/74">
              Suppliers will be assessed against the selection rules locked on {formatDateTime(lockedAt)}.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <InlineMetric label="Status" value={currentStatus} inverted />
              <InlineMetric label="Deadline" value="June 28, 2026" inverted />
              <InlineMetric label="Submissions" value={`${submissionCount} confidential`} inverted />
            </div>
          </div>
          <div className="grid gap-3 self-start">
            <StatusBadge status={currentStatus} />
            <StatusBadge status="Policy locked" />
            <div className="flex flex-col gap-3 pt-2">
              <button type="button" onClick={() => setInviteOpen(true)}>
                <AppButton className="w-full"><MailPlus className="h-4 w-4" />Invite suppliers</AppButton>
              </button>
              <a href="#tender-record">
                <AppButton variant="tertiary" className="w-full border-white/20 bg-white/10 text-white hover:border-white/40">
                  <Download className="h-4 w-4" />View tender record
                </AppButton>
              </a>
            </div>
          </div>
        </div>
      </RecordPanel>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="space-y-6">
          <InvitedSuppliersList state={state} />
          <ConfidentialSubmissionsList submissions={state.submissions} />
          {submissionCount > 0 && currentStatus === "Open for submissions" ? (
            <RecordPanel className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-black text-ofora-deep">Ready to begin evaluation?</p>
                <p className="mt-1 text-sm text-ofora-muted">Close supplier submissions once you are ready to evaluate received proposals.</p>
              </div>
              <button type="button" onClick={() => setCloseOpen(true)}>
                <AppButton><ShieldCheck className="h-4 w-4" />Close submissions and begin evaluation</AppButton>
              </button>
            </RecordPanel>
          ) : null}
          {process.env.NODE_ENV !== "production" ? (
            <RecordPanel className="flex flex-col gap-4 border-dashed p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-ofora-muted">Development helper</p>
                <p className="mt-1 text-sm text-ofora-muted">Seed Atlas, Nova, and Meridian submissions for demos.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setState(seedDemoSubmissions(tender.id));
                  setToast("Demo supplier submissions seeded.");
                }}
                className="ofora-focus inline-flex items-center justify-center gap-2 rounded-lg border border-ofora-border bg-white px-4 py-2.5 text-sm font-black text-ofora-deep"
              >
                <PlayCircle className="h-4 w-4" />
                Seed demo supplier submissions
              </button>
            </RecordPanel>
          ) : null}
          <TenderTimeline events={events} />
        </div>
        <div id="tender-record" className="space-y-6">
          <AwardPolicyCard policy={tender.policy} />
          <RecordPanel className="p-6">
            <h2 className="text-xl font-black tracking-[-0.05em] text-ofora-deep">Tender record</h2>
            <dl className="mt-5 grid gap-3 text-sm">
              <RecordRow label="Reference" value={tender.id} />
              <RecordRow label="Submission deadline" value="June 28, 2026" />
              <RecordRow label="Selection rules" value="Locked and ready" />
              <RecordRow label="Confidential submissions" value={`${submissionCount}`} />
            </dl>
          </RecordPanel>
        </div>
      </div>

      <InviteSuppliersModal
        tenderId={tender.id}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onToast={setToast}
        onStateChange={(nextState, message) => {
          setState(nextState);
          setToast(message);
        }}
      />
      <CloseSubmissionsModal
        open={closeOpen}
        onOpenChange={setCloseOpen}
        submissionCount={submissionCount}
        onConfirm={() => {
          setState(closeSubmissions(tender.id));
          setCloseOpen(false);
          setToast("Submissions closed. Supplier evaluation is now in progress.");
        }}
      />
    </div>
  );
}

function RecordRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-ofora-border pb-3">
      <dt className="text-ofora-muted">{label}</dt>
      <dd className="font-black text-ofora-deep">{value}</dd>
    </div>
  );
}
