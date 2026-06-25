"use client";

import { LockKeyhole } from "lucide-react";
import { StoredSupplierSubmission } from "@/lib/submission-store";
import { formatDateTime } from "@/lib/utils";

export function ConfidentialSubmissionsList({ submissions }: { submissions: StoredSupplierSubmission[] }) {
  return (
    <section className="ofora-panel overflow-hidden">
      <div className="border-b border-ofora-border p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-[-0.055em] text-ofora-deep">Confidential submissions</h2>
            <p className="mt-1 text-sm text-ofora-muted">Officer view shows receipt status only. Commercial details remain protected.</p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-md border border-ofora-verify/30 bg-ofora-mist px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-ofora-green">
            <LockKeyhole className="h-3.5 w-3.5" />
            Restricted action
          </span>
        </div>
      </div>
      {submissions.length === 0 ? (
        <div className="grid gap-3 p-8 text-sm text-ofora-muted">
          <p className="font-black text-ofora-deep">No confidential submissions received yet.</p>
          <p>Suppliers can submit through the secure submission link until June 28, 2026.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-ofora-border bg-ofora-soft text-xs uppercase tracking-[0.12em] text-ofora-muted">
              <tr>
                <th className="px-5 py-3">Supplier name</th>
                <th className="px-5 py-3">Submission status</th>
                <th className="px-5 py-3">Submitted date/time</th>
                <th className="px-5 py-3">Eligibility check status</th>
                <th className="px-5 py-3">Confidential dossier status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ofora-border">
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td className="px-5 py-4 font-black text-ofora-deep">{submission.supplierCompany}</td>
                  <td className="px-5 py-4 font-semibold text-ofora-green">{submission.submissionStatus}</td>
                  <td className="px-5 py-4 text-ofora-muted">{formatDateTime(submission.submittedAt)}</td>
                  <td className="px-5 py-4 text-ofora-muted">{submission.eligibilityStatus}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-2 rounded-md border border-ofora-border bg-white px-2.5 py-1 text-xs font-black text-ofora-deep">
                      <LockKeyhole className="h-3.5 w-3.5 text-ofora-green" />
                      {submission.confidentialDossierStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="border-t border-ofora-border bg-ofora-canvas px-5 py-4 text-sm font-semibold text-ofora-muted">
        Commercial details are protected until evaluation begins.
      </div>
    </section>
  );
}
