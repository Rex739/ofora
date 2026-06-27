"use client";

import { useState } from "react";
import { CheckCircle2, LockKeyhole } from "lucide-react";
import { OforaMark } from "@/components/landing/ofora-mark";
import { RecordPanel } from "@/components/shared/app-primitives";
import { primaryTender } from "@/lib/mock-data";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const progress = ["Company details", "Commercial proposal", "Capability information", "Review submission"];

export function SupplierSubmissionForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="min-h-screen bg-ofora-canvas px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between border-b border-ofora-border pb-5">
          <div className="flex items-center gap-3">
            <OforaMark />
            <span className="text-xl font-black tracking-[-0.05em] text-ofora-deep">Ofora</span>
          </div>
          <a href="mailto:support@ofora.example" className="text-sm font-black text-ofora-green">Support contact</a>
        </header>
        <section className="grid gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-ofora-green">{primaryTender.id}</p>
            <h1 className="mt-4 text-[clamp(3rem,7vw,6rem)] font-black leading-[0.86] tracking-[-0.08em] text-ofora-deep">Submit with confidence.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ofora-muted">Your commercial information is protected and evaluated only against the tender’s locked criteria.</p>
          </div>
          <RecordPanel className="bg-[#E7F5B8] p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-ofora-green">Tender reference</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.055em] text-ofora-deep">{primaryTender.title}</h2>
            <dl className="mt-5 grid gap-3 text-sm">
              <Info label="Budget ceiling" value={formatCurrency(primaryTender.budget)} />
              <Info label="Submission deadline" value={formatDateTime(primaryTender.deadline)} />
            </dl>
          </RecordPanel>
        </section>
        {submitted ? (
          <RecordPanel className="p-10 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-ofora-green" />
            <h2 className="mt-5 text-5xl font-black tracking-[-0.07em] text-ofora-deep">Submission received.</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-ofora-muted">Your commercial details are protected and will be assessed against the tender’s pre-set evaluation policy.</p>
            <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-ofora-green">Reference: SUB-OFR-2026-041-004</p>
          </RecordPanel>
        ) : (
          <div className="grid min-w-0 gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="min-w-0 space-y-3">
              {progress.map((item, index) => (
                <div key={item} className="border-l border-ofora-border py-3 pl-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-ofora-muted">0{index + 1}</p>
                  <p className="mt-1 font-black tracking-[-0.03em] text-ofora-deep">{item}</p>
                </div>
              ))}
              <div className="border border-ofora-border bg-ofora-mist p-4 text-sm text-ofora-green">
                <LockKeyhole className="mb-3 h-4 w-4" />
                Your submission is confidential.
              </div>
            </aside>
            <form className="min-w-0 border border-ofora-border bg-white p-5 sm:p-6" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
              <h2 className="text-3xl font-black tracking-[-0.06em] text-ofora-deep">Submission workspace</h2>
              <p className="mt-3 text-sm text-ofora-muted">Quality score of 75 or higher, delivery within 14 days, and pricing within the locked budget ceiling.</p>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {["Company information", "Proposed price", "Delivery timeline", "Stock availability", "Quality certification", "Local supplier contribution"].map((label) => (
                  <label key={label} className="grid gap-2 text-sm font-black text-ofora-deep">
                    {label}
                    <input className="ofora-focus min-w-0 rounded-lg border border-ofora-border px-3 py-3 font-normal" required />
                  </label>
                ))}
                <label className="grid gap-2 text-sm font-black text-ofora-deep sm:col-span-2">
                  Supporting documents placeholder
                  <input type="file" className="ofora-focus w-full min-w-0 rounded-lg border border-ofora-border px-3 py-3 font-normal" />
                </label>
              </div>
              <section className="mt-8 border border-ofora-border bg-ofora-canvas p-5">
                <h3 className="font-black text-ofora-deep">Review submission</h3>
                <p className="mt-2 text-sm text-ofora-muted">Your submission will remain confidential. The evaluation policy for this tender has already been locked.</p>
              </section>
              <button className="ofora-focus mt-6 rounded-lg bg-ofora-deep px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-ofora-green">Submit</button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-ofora-muted">{label}</dt><dd className="font-black text-ofora-deep">{value}</dd></div>;
}
