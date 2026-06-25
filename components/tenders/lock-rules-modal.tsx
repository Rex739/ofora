"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { X } from "lucide-react";

export function LockRulesModal({
  open,
  onOpenChange,
  onConfirm,
  mostImportant,
  minimumQuality,
  maximumDelivery
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  mostImportant: string;
  minimumQuality: number;
  maximumDelivery: number;
}) {
  const [checked, setChecked] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={(next) => {
      onOpenChange(next);
      if (!next) setChecked(false);
    }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ofora-ink/35" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 border border-ofora-border bg-white p-6 shadow-panel">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-3xl font-black tracking-[-0.06em] text-ofora-deep">Lock these selection rules?</Dialog.Title>
              <Dialog.Description className="mt-3 text-sm leading-6 text-ofora-muted">
                After you lock them, suppliers will be evaluated using these rules. You will not be able to change the requirements or priorities after submissions begin.
              </Dialog.Description>
            </div>
            <Dialog.Close className="ofora-focus rounded-md p-2" aria-label="Go back">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <div className="mt-6 border border-ofora-border bg-ofora-canvas p-4">
            <Summary label="Most important factor" value={mostImportant} />
            <Summary label="Suppliers must" value={`Meet a quality rating of ${minimumQuality} or above`} />
            <Summary label="Suppliers must" value={`Deliver within ${maximumDelivery} days`} />
          </div>
          <label className="mt-5 flex gap-3 text-sm font-semibold leading-6 text-ofora-ink">
            <input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} className="mt-1 h-4 w-4 accent-ofora-green" />
            I understand that these rules cannot be changed after supplier submissions begin.
          </label>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Dialog.Close className="ofora-focus rounded-lg border border-ofora-border bg-white px-4 py-2.5 text-sm font-black text-ofora-deep">
              Go back
            </Dialog.Close>
            <button
              type="button"
              disabled={!checked}
              onClick={onConfirm}
              className="ofora-focus rounded-lg bg-ofora-green px-4 py-2.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-ofora-muted"
            >
              Lock rules and open tender
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-ofora-border py-3 last:border-b-0">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-ofora-muted">{label}</p>
      <p className="mt-1 font-black text-ofora-deep">{value}</p>
    </div>
  );
}
