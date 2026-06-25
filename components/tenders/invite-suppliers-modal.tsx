"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { Copy, X } from "lucide-react";
import { addInvitedSupplier, StoredTenderSubmissionState } from "@/lib/submission-store";

export function InviteSuppliersModal({
  tenderId,
  open,
  onOpenChange,
  onStateChange,
  onToast
}: {
  tenderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStateChange: (state: StoredTenderSubmissionState, toast: string) => void;
  onToast: (toast: string) => void;
}) {
  const [company, setCompany] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const submissionPath = `/supplier/submit/${tenderId}`;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ofora-ink/35" />
        <Dialog.Content className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-panel">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-4xl font-black tracking-[-0.07em] text-ofora-deep">Invite suppliers</Dialog.Title>
              <Dialog.Description className="mt-3 text-sm leading-6 text-ofora-muted">
                Share a secure submission link with suppliers you want to invite to this tender.
              </Dialog.Description>
            </div>
            <Dialog.Close className="ofora-focus rounded-md p-2" aria-label="Close invite suppliers">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <section className="mt-8 border border-ofora-border bg-ofora-canvas p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-ofora-green">Share a secure link</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input readOnly value={submissionPath} className="rounded-lg border border-ofora-border bg-white px-3 py-3 text-sm font-semibold text-ofora-deep" />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(`${window.location.origin}${submissionPath}`);
                  onToast("Submission link copied.");
                }}
                className="ofora-focus inline-flex items-center justify-center gap-2 rounded-lg bg-ofora-deep px-4 py-3 text-sm font-black text-white"
              >
                <Copy className="h-4 w-4" />Copy submission link
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-ofora-muted">Anyone with this link can prepare a submission for this tender before the deadline.</p>
          </section>

          <section className="mt-6 border border-ofora-border p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-ofora-green">Invite by email</p>
            <div className="mt-5 grid gap-4">
              <Field label="Supplier company name" value={company} onChange={setCompany} />
              <Field label="Contact name" value={contact} onChange={setContact} />
              <Field label="Email address" value={email} onChange={setEmail} />
            </div>
            <button
              type="button"
              onClick={() => {
                if (!company.trim()) return;
                const state = addInvitedSupplier(tenderId, { company, contact, email });
                onStateChange(state, `Invitation prepared for ${company}.`);
                setCompany("");
                setContact("");
                setEmail("");
              }}
              className="ofora-focus mt-5 rounded-lg bg-ofora-green px-4 py-3 text-sm font-black text-white"
            >
              Send invitation
            </button>
          </section>

          <dl className="mt-6 grid gap-3 border border-ofora-border bg-[#E7F5B8] p-5 text-sm">
            <div><dt className="font-black text-ofora-green">Submission deadline</dt><dd className="mt-1 font-black text-ofora-deep">June 28, 2026</dd></div>
            <div><dt className="font-black text-ofora-green">Selection rules</dt><dd className="mt-1 font-black text-ofora-deep">Locked and ready</dd></div>
          </dl>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm font-black text-ofora-deep">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="ofora-focus rounded-lg border border-ofora-border px-3 py-3 font-normal" />
    </label>
  );
}
