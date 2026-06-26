"use client";

import Link from "next/link";
import { useState } from "react";
import { RotateCcw } from "lucide-react";

const keys = [
  "ofora:lastCreatedTender",
  "ofora:award-state:v2:OFR-2026-041",
  "ofora:tender-submissions:v2:OFR-2026-041"
];

export default function DemoResetPage() {
  const [done, setDone] = useState(false);

  function resetLocalDemo() {
    keys.forEach((key) => window.localStorage.removeItem(key));
    setDone(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ofora-canvas p-6 text-ofora-ink">
      <section className="w-full max-w-xl border border-ofora-border bg-white p-6 shadow-panel">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-ofora-green">Developer-only local reset</p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.07em] text-ofora-deep">Reset browser demo state.</h1>
        <p className="mt-4 text-sm leading-6 text-ofora-muted">This clears only local browser state for the demo tender, supplier submissions, mock award selection, and audit timeline. It does not replay transactions, generate proofs, modify testnet contracts, or change public evidence artifacts.</p>
        <button type="button" onClick={resetLocalDemo} className="ofora-focus mt-6 inline-flex items-center gap-2 rounded-lg bg-ofora-deep px-4 py-3 text-sm font-black text-white"><RotateCcw className="h-4 w-4" />Reset local demo state</button>
        {done ? <p className="mt-4 rounded-lg border border-ofora-green/30 bg-ofora-mist px-4 py-3 text-sm font-black text-ofora-green">Local demo state reset.</p> : null}
        <div className="mt-6 flex gap-3">
          <Link href="/demo" className="ofora-focus rounded-lg border border-ofora-border bg-white px-4 py-2.5 text-sm font-black text-ofora-deep">Open demo</Link>
          <Link href="/tenders/OFR-2026-041" className="ofora-focus rounded-lg border border-ofora-border bg-white px-4 py-2.5 text-sm font-black text-ofora-deep">Open tender</Link>
        </div>
      </section>
    </main>
  );
}
