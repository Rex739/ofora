"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { shortenReference, stellarExpertContractUrl, stellarExpertTxUrl } from "@/lib/verification-evidence";

type EvidenceReferenceKind = "transaction" | "contract";

export function EvidenceReference({
  label,
  value,
  kind,
  realMode = true
}: {
  label: string;
  value: string;
  kind: EvidenceReferenceKind;
  realMode?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const href = realMode ? getExplorerUrl(kind, value) : null;
  const shortValue = kind === "transaction" ? shortenReference(value, 10, 8) : shortenReference(value, 8, 8);
  const canAct = Boolean(realMode && href);

  async function copyReference() {
    if (!canAct) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="grid gap-3 border-b border-ofora-border py-4 text-sm sm:grid-cols-[0.8fr_minmax(0,1fr)] sm:gap-4">
      <dt className="text-ofora-muted">{label}</dt>
      <dd className="min-w-0">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <code className="block min-w-0 break-all rounded-md bg-ofora-canvas px-2.5 py-2 font-mono text-xs font-black text-ofora-deep sm:break-normal">
            {shortValue}
          </code>
          {canAct ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyReference}
                className="ofora-focus inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-ofora-border bg-white px-3 py-2 text-xs font-black text-ofora-deep transition hover:border-ofora-green"
                aria-label={`Copy full ${label}`}
                title={`Copy full ${label}`}
              >
                {copied ? <Check className="h-4 w-4 text-ofora-green" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <a
                href={href ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="ofora-focus inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-ofora-border bg-white px-3 py-2 text-xs font-black text-ofora-deep transition hover:border-ofora-green"
                aria-label={`Open ${label} in Stellar Explorer`}
                title={`Open ${label} in Stellar Explorer`}
              >
                Open <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          ) : null}
        </div>
      </dd>
    </div>
  );
}

function getExplorerUrl(kind: EvidenceReferenceKind, value: string) {
  return kind === "transaction" ? stellarExpertTxUrl(value) : stellarExpertContractUrl(value);
}
