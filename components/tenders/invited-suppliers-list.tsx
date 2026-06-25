"use client";

import { StoredTenderSubmissionState } from "@/lib/submission-store";
import { formatDateTime } from "@/lib/utils";

export function InvitedSuppliersList({ state }: { state: StoredTenderSubmissionState }) {
  return (
    <section className="ofora-panel overflow-hidden">
      <div className="border-b border-ofora-border p-5">
        <h2 className="text-2xl font-black tracking-[-0.055em] text-ofora-deep">Invited suppliers</h2>
        <p className="mt-1 text-sm text-ofora-muted">Invitation status and submission response for this tender.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-ofora-border bg-ofora-soft text-xs uppercase tracking-[0.12em] text-ofora-muted">
            <tr>
              <th className="px-5 py-3">Supplier company</th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">Invitation status</th>
              <th className="px-5 py-3">Invitation date</th>
              <th className="px-5 py-3">Submission status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ofora-border">
            {state.invitedSuppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td className="px-5 py-4 font-black text-ofora-deep">{supplier.company}</td>
                <td className="px-5 py-4 text-ofora-muted">{supplier.contact}</td>
                <td className="px-5 py-4 text-ofora-muted">{supplier.invitationStatus}</td>
                <td className="px-5 py-4 text-ofora-muted">{formatDateTime(supplier.invitationDate)}</td>
                <td className="px-5 py-4 font-semibold text-ofora-green">{supplier.submissionStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
