"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export function CloseSubmissionsModal({
  open,
  onOpenChange,
  submissionCount,
  onConfirm
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submissionCount: number;
  onConfirm: () => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ofora-ink/35" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 border border-ofora-border bg-white p-6 shadow-panel">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-3xl font-black tracking-[-0.06em] text-ofora-deep">Close supplier submissions?</Dialog.Title>
              <Dialog.Description className="mt-3 text-sm leading-6 text-ofora-muted">
                No new suppliers will be able to submit after this point. Ofora will begin checking submissions against the tender’s locked requirements.
              </Dialog.Description>
            </div>
            <Dialog.Close className="ofora-focus rounded-md p-2" aria-label="Keep submissions open">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <dl className="mt-6 grid gap-3 border border-ofora-border bg-ofora-canvas p-4 text-sm">
            <Row label="Confidential submissions received" value={`${submissionCount}`} />
            <Row label="Submission deadline" value="June 28, 2026" />
            <Row label="Current status" value="Open for submissions" />
          </dl>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Dialog.Close className="ofora-focus rounded-lg border border-ofora-border bg-white px-4 py-2.5 text-sm font-black text-ofora-deep">
              Keep submissions open
            </Dialog.Close>
            <button onClick={onConfirm} className="ofora-focus rounded-lg bg-ofora-green px-4 py-2.5 text-sm font-black text-white">
              Close submissions and begin evaluation
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4"><dt className="text-ofora-muted">{label}</dt><dd className="font-black text-ofora-deep">{value}</dd></div>;
}
