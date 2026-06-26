"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, ShieldCheck } from "lucide-react";
import { OforaMark } from "@/components/landing/ofora-mark";
import { shortenReference, stellarExpertTxUrl, testnetEvidence } from "@/lib/verification-evidence";
import { cn } from "@/lib/utils";

const scenes = [
  {
    eyebrow: "01 Lock the rules",
    title: "Emergency Solar Lantern Procurement",
    copy: "Selection priorities and minimum requirements are locked before any supplier can submit.",
    detail: ["Maximum delivery: 14 days", "Quality threshold: 80 / 100", "Rules locked before submissions"]
  },
  {
    eyebrow: "02 Receive confidential submissions",
    title: "Three suppliers submit protected proposals.",
    copy: "Ofora records submissions without exposing commercial details in the public award record.",
    detail: ["Atlas Supply Group: received", "Nova Relief Systems: received", "Meridian Industrial Ltd.: received"]
  },
  {
    eyebrow: "03 Exclude non-eligible suppliers",
    title: "Meridian is not eligible.",
    copy: "Not eligible - delivery exceeds the 14-day requirement.",
    detail: ["Requirement: deliver within 14 days", "Meridian assessment: not eligible", "Commercial values remain protected"]
  },
  {
    eyebrow: "04 Block an invalid award",
    title: "Atlas cannot be awarded.",
    copy: "Award blocked - another eligible supplier achieved a higher score.",
    detail: ["Atlas is eligible", "Nova ranks higher under locked rules", "Nova's confidential bid values are not revealed"]
  },
  {
    eyebrow: "05 Validate the correct award",
    title: "Nova validates.",
    copy: "Award validated. Ofora creates the real Fair Award Receipt.",
    detail: [testnetEvidence.selectedSupplierDisplayName, testnetEvidence.fairAwardReceiptId, "Controlled release eligible"]
  },
  {
    eyebrow: "06 Verify the record on Stellar",
    title: "The award record is anchored on Stellar testnet.",
    copy: "The verification receipt was confirmed and consumed once by the Ofora registry.",
    detail: [
      `Fair Award Receipt: ${testnetEvidence.fairAwardReceiptId}`,
      `Verification receipt tx: ${shortenReference(testnetEvidence.verificationReceiptTransactionHash, 10, 8)}`,
      `Registry finalization tx: ${shortenReference(testnetEvidence.registryFinalizationTransactionHash, 10, 8)}`,
      `Tender status: ${testnetEvidence.finalTenderStatus}`
    ]
  }
];

export default function DemoPage() {
  const [index, setIndex] = useState(0);
  const scene = scenes[index];
  const progress = useMemo(() => `${index + 1} / ${scenes.length}`, [index]);

  return (
    <main className="min-h-screen bg-ofora-canvas text-ofora-ink">
      <header className="border-b border-ofora-border bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <OforaMark className="h-11 w-11" />
            <div>
              <p className="text-xl font-black tracking-[-0.05em] text-ofora-deep">Ofora demo</p>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-ofora-green">Guided hackathon walkthrough</p>
            </div>
          </div>
          <Link href="/tenders/OFR-2026-041" className="ofora-focus rounded-lg border border-ofora-border bg-white px-4 py-2.5 text-sm font-black text-ofora-deep">Exit demo</Link>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-2">
          {scenes.map((item, itemIndex) => (
            <button
              key={item.eyebrow}
              type="button"
              onClick={() => setIndex(itemIndex)}
              className={cn(
                "ofora-focus w-full border-l px-4 py-4 text-left transition",
                itemIndex === index ? "border-ofora-green bg-[#E7F5B8] text-ofora-deep" : "border-ofora-border bg-white text-ofora-muted hover:text-ofora-deep"
              )}
            >
              <span className="block text-xs font-black uppercase tracking-[0.16em]">{item.eyebrow.slice(0, 2)}</span>
              <span className="mt-1 block font-black tracking-[-0.03em]">{item.eyebrow.slice(3)}</span>
            </button>
          ))}
        </aside>

        <div className="border border-ofora-border bg-white">
          <div className="grid gap-px bg-ofora-border lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="bg-white p-6 sm:p-10">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-ofora-green">{scene.eyebrow}</p>
                <span className="rounded-full border border-ofora-border px-3 py-1 text-xs font-black text-ofora-muted">{progress}</span>
              </div>
              <h1 className="mt-8 max-w-3xl text-[clamp(3rem,7vw,6.8rem)] font-black leading-[0.88] tracking-[-0.08em] text-ofora-deep">{scene.title}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-ofora-muted">{scene.copy}</p>
              <dl className="mt-8 grid gap-px overflow-hidden border border-ofora-border bg-ofora-border sm:grid-cols-3">
                {scene.detail.map((item) => (
                  <div key={item} className="bg-ofora-canvas p-4">
                    <dt className="text-xs font-black uppercase tracking-[0.14em] text-ofora-muted">Record</dt>
                    <dd className="mt-2 min-h-12 text-sm font-black leading-5 text-ofora-deep">{item}</dd>
                  </div>
                ))}
              </dl>
              {index === 5 ? <EvidenceStrip /> : null}
            </section>

            <aside className="bg-ofora-deep p-6 text-white">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#E7F5B8]">Demo notes</p>
              <div className="mt-6 space-y-4 text-sm leading-6 text-white/76">
                <p>No fake proof generation is shown. The evidence in scene six is from confirmed Stellar testnet transactions.</p>
                <p>Commercial bid values, delivery details, internal scores, salts, and witnesses are intentionally absent from the public view.</p>
                <p>Payment execution and escrow are outside this hackathon MVP.</p>
              </div>
            </aside>
          </div>

          <div className="flex flex-col gap-3 border-t border-ofora-border p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <button type="button" onClick={() => setIndex((current) => Math.max(0, current - 1))} disabled={index === 0} className="ofora-focus inline-flex items-center gap-2 rounded-lg border border-ofora-border bg-white px-4 py-2.5 text-sm font-black text-ofora-deep disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft className="h-4 w-4" />Previous scene</button>
              <button type="button" onClick={() => setIndex((current) => Math.min(scenes.length - 1, current + 1))} disabled={index === scenes.length - 1} className="ofora-focus inline-flex items-center gap-2 rounded-lg bg-ofora-deep px-4 py-2.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40">Next scene<ArrowRight className="h-4 w-4" /></button>
            </div>
            <button type="button" onClick={() => setIndex(0)} className="ofora-focus inline-flex items-center justify-center gap-2 rounded-lg border border-ofora-border bg-white px-4 py-2.5 text-sm font-black text-ofora-deep"><RotateCcw className="h-4 w-4" />Restart demo</button>
          </div>
        </div>
      </section>
    </main>
  );
}

function EvidenceStrip() {
  return (
    <section className="mt-8 border border-ofora-green/30 bg-ofora-mist p-5">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-1 h-5 w-5 text-ofora-green" />
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-ofora-green">VERIFIED ON STELLAR TESTNET</p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.055em] text-ofora-deep">Real public evidence</h2>
        </div>
      </div>
      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <EvidenceLink label="Verification receipt transaction" value={testnetEvidence.verificationReceiptTransactionHash} />
        <EvidenceLink label="Registry finalization transaction" value={testnetEvidence.registryFinalizationTransactionHash} />
        <EvidenceText label="Verifier receipt contract" value={testnetEvidence.verifierReceiptContractId} />
        <EvidenceText label="Registry contract" value={testnetEvidence.registryContractId} />
      </div>
    </section>
  );
}

function EvidenceLink({ label, value }: { label: string; value: string }) {
  return (
    <a href={stellarExpertTxUrl(value)} target="_blank" rel="noreferrer" className="ofora-focus border border-ofora-border bg-white p-4">
      <span className="block text-xs font-black uppercase tracking-[0.14em] text-ofora-muted">{label}</span>
      <span className="mt-2 block font-black text-ofora-deep">{shortenReference(value, 10, 8)}</span>
    </a>
  );
}

function EvidenceText({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-ofora-border bg-white p-4">
      <span className="block text-xs font-black uppercase tracking-[0.14em] text-ofora-muted">{label}</span>
      <span className="mt-2 block font-black text-ofora-deep">{shortenReference(value)}</span>
    </div>
  );
}
