"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Eye, LockKeyhole, X } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { evaluateSubmissions } from "@/lib/scoring";
import { AwardPolicy, Supplier, SupplierSubmission } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export function SupplierSubmissionsTable({
  suppliers,
  submissions,
  policy
}: {
  suppliers: Supplier[];
  submissions: SupplierSubmission[];
  policy: AwardPolicy;
}) {
  const results = evaluateSubmissions(submissions, policy);

  return (
    <section className="ofora-panel overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-ofora-border p-5">
        <div>
          <h2 className="text-2xl font-black tracking-[-0.055em] text-ofora-deep">Supplier submissions</h2>
          <p className="mt-1 text-sm text-ofora-muted">Main view protects sensitive bid details.</p>
        </div>
        <LockKeyhole className="h-5 w-5 text-ofora-green" aria-hidden="true" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-ofora-border bg-ofora-soft text-xs uppercase tracking-[0.12em] text-ofora-muted">
            <tr>
              <th className="px-5 py-3">Supplier alias</th>
              <th className="px-5 py-3">Submission status</th>
              <th className="px-5 py-3">Eligibility</th>
              <th className="px-5 py-3">Submission timestamp</th>
              <th className="px-5 py-3">Dossier</th>
              <th className="px-5 py-3">Evaluation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ofora-border">
            {submissions.map((submission) => {
              const supplier = suppliers.find((item) => item.id === submission.supplierId);
              const result = results.find((item) => item.supplierId === submission.supplierId);
              return (
                <tr key={submission.id}>
                  <td className="px-5 py-5 font-black text-ofora-deep">{supplier?.alias}</td>
                  <td className="px-5 py-4 text-ofora-muted">{submission.status}</td>
                  <td className="px-5 py-4"><StatusBadge status={result?.eligible ? "Eligible" : "Ineligible"} /></td>
                  <td className="px-5 py-4 text-ofora-muted">{formatDateTime(submission.submittedAt)}</td>
                  <td className="px-5 py-4 text-ofora-muted">Confidential dossier</td>
                  <td className="px-5 py-4">
                    <Dialog.Root>
                      <Dialog.Trigger className="ofora-focus inline-flex items-center gap-2 rounded-lg border border-ofora-border px-3 py-2 text-xs font-black text-ofora-ink transition hover:border-ofora-green">
                        <Eye className="h-4 w-4" />
                        Review confidential evaluation
                      </Dialog.Trigger>
                      <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 z-40 bg-ofora-ink/30" />
                        <Dialog.Content className="fixed right-0 top-0 z-50 h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-panel">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <Dialog.Title className="text-3xl font-black tracking-[-0.06em] text-ofora-deep">{supplier?.name}</Dialog.Title>
                              <Dialog.Description className="mt-1 text-sm text-ofora-muted">Authorized procurement evaluation view.</Dialog.Description>
                            </div>
                            <Dialog.Close className="ofora-focus rounded-md p-2" aria-label="Close evaluation drawer"><X className="h-5 w-5" /></Dialog.Close>
                          </div>
                          <dl className="mt-6 grid gap-3 text-sm">
                            <Row label="Submitted price" value={formatCurrency(submission.price)} />
                            <Row label="Delivery timeline" value={`${submission.deliveryDays} days`} />
                            <Row label="Stock availability" value={`${submission.stockAvailability}%`} />
                            <Row label="Price score" value={result?.priceScore.toFixed(1) ?? "-"} />
                            <Row label="Delivery score" value={result?.deliveryScore.toFixed(1) ?? "-"} />
                            <Row label="Stock score" value={result?.stockScore.toFixed(1) ?? "-"} />
                            <Row label="Quality score" value={result?.qualityScore.toFixed(1) ?? "-"} />
                            <Row label="Local contribution score" value={result?.localContributionScore.toFixed(1) ?? "-"} />
                            <Row label="Eligibility" value={result?.eligible ? "Eligible" : "Ineligible"} />
                            <Row label="Total policy score" value={result?.totalScore ? result.totalScore.toFixed(1) : "Not applicable"} />
                          </dl>
                          {result?.disqualificationReason ? (
                            <p className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{result.disqualificationReason}</p>
                          ) : null}
                        </Dialog.Content>
                      </Dialog.Portal>
                    </Dialog.Root>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-5 rounded-md border border-ofora-border bg-ofora-canvas px-3 py-2">
      <dt className="text-ofora-muted">{label}</dt>
      <dd className="font-medium text-ofora-ink">{value}</dd>
    </div>
  );
}
