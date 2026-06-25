"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, CheckCircle2, LockKeyhole } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHero, RecordPanel } from "@/components/shared/app-primitives";
import { LockRulesModal } from "@/components/tenders/lock-rules-modal";
import { ReadyToLockPanel } from "@/components/tenders/ready-to-lock-panel";
import { TenderReviewRecord } from "@/components/tenders/tender-review-record";

const steps = ["Tender details", "Budget & timing", "Choose how to select a supplier", "Review and lock your rules"];
const pointScale = [35, 25, 20, 10, 10];
const priorityOptions = [
  {
    id: "price",
    title: "Cost",
    description: "Choose suppliers that offer better value for money."
  },
  {
    id: "delivery",
    title: "Delivery speed",
    description: "Prioritize suppliers who can deliver within your required timeframe."
  },
  {
    id: "stock",
    title: "Stock availability",
    description: "Prioritize suppliers who have enough items ready to supply."
  },
  {
    id: "quality",
    title: "Quality and certification",
    description: "Prioritize suppliers who meet your quality and compliance requirements."
  },
  {
    id: "local",
    title: "Local economic contribution",
    description: "Give preference to suppliers that support local jobs, businesses, or supply chains."
  }
];

export function TenderForm() {
  const [step, setStep] = useState(0);
  const [weights, setWeights] = useState({ price: 35, delivery: 25, stock: 20, quality: 10, local: 10 });
  const [priorityOrder, setPriorityOrder] = useState(priorityOptions.map((item) => item.id));
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [exampleOpen, setExampleOpen] = useState(false);
  const [minimumQuality, setMinimumQuality] = useState(75);
  const [maximumDelivery, setMaximumDelivery] = useState(14);
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const totalWeight = useMemo(() => Object.values(weights).reduce((sum, value) => sum + value, 0), [weights]);
  const rankedPriorities = priorityOrder.map((id, index) => ({
    ...priorityOptions.find((item) => item.id === id)!,
    points: pointScale[index]
  }));

  const movePriority = (id: string, direction: "up" | "down") => {
    setPriorityOrder((current) => {
      const index = current.indexOf(id);
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      const nextWeights = Object.fromEntries(next.map((itemId, itemIndex) => [itemId, pointScale[itemIndex]])) as typeof weights;
      setWeights(nextWeights);
      return next;
    });
  };

  const lockTender = () => {
    const tenderId = "OFR-2026-041";
    const lockedAt = new Date().toISOString();
    const createdTender = {
      id: tenderId,
      title: "Emergency Solar Lantern Procurement",
      organization: "Global Relief & Infrastructure Network",
      category: "Emergency response equipment",
      status: "Open for submissions",
      policyStatus: "Locked",
      policyVersion: "1.0",
      policyLockedAt: lockedAt,
      policyCommitment: `local-selection-rules-${tenderId}-v1`,
      auditTimeline: [
        {
          id: `event-${Date.now()}`,
          title: "Selection rules locked",
          label: "Selection rules locked",
          description: "The tender requirements and supplier selection priorities were locked before submissions began.",
          timestamp: lockedAt,
          actor: "Elena Marquez",
          eventType: "policy_locked"
        }
      ],
      selectionRules: {
        priorities: rankedPriorities,
        minimumQuality,
        maximumDelivery,
        totalWeight
      }
    };

    window.localStorage.setItem("ofora:lastCreatedTender", JSON.stringify(createdTender));
    setSuccessMessage("Selection rules locked. Your tender is now open for supplier submissions.");
    setLockModalOpen(false);
    setTimeout(() => router.push(`/tenders/${tenderId}?locked=1`), 900);
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHero
          eyebrow="New procurement process"
          title={<>Create<br />tender.</>}
          description="Define requirements, choose supplier selection rules, and lock the award rules before submissions begin."
        />
        <div className={step === 3 ? "grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_380px]" : "grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_360px]"}>
          <aside className="space-y-3">
            {steps.map((label, index) => (
              <button
                key={label}
                onClick={() => setStep(index)}
                className={`ofora-focus w-full border-l px-4 py-4 text-left transition ${index === step ? "border-ofora-green bg-[#E7F5B8] text-ofora-deep" : "border-ofora-border bg-white text-ofora-muted hover:text-ofora-deep"}`}
              >
                <span className="block text-xs font-black uppercase tracking-[0.18em]">0{index + 1}</span>
                <span className="mt-1 flex items-center gap-2 font-black tracking-[-0.03em]">{index === 3 && step === 3 ? <LockKeyhole className="h-4 w-4" /> : null}{label}</span>
              </button>
            ))}
          </aside>
          <RecordPanel className={step === 3 ? "p-6 xl:p-8" : "p-6"}>
            {step === 0 ? (
              <div className="grid gap-5">
                <SectionTitle title="Tender details" copy="Start with the institutional context and procurement scope." />
                <Field label="Tender title" defaultValue="Emergency Solar Lantern Procurement" />
                <Field label="Organization" defaultValue="Global Relief & Infrastructure Network" />
                <label className="grid gap-2 text-sm font-black text-ofora-deep">Description<textarea className="ofora-focus min-h-32 rounded-lg border border-ofora-border p-3 font-normal" defaultValue="Procurement of emergency solar lantern units for rapid deployment across regional relief operations." /></label>
                <Field label="Procurement category" defaultValue="Emergency response equipment" />
              </div>
            ) : null}
            {step === 1 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <SectionTitle title="Budget & timing" copy="Set the ceiling and submission window that suppliers will work against." className="sm:col-span-2" />
                <Field label="Budget ceiling" defaultValue="10000" />
                <Field label="Currency" defaultValue="USD" />
                <Field label="Submission deadline" defaultValue="2026-06-28" />
                <Field label="Delivery deadline" defaultValue="2026-07-15" />
              </div>
            ) : null}
            {step === 2 ? (
              <div className="grid gap-8">
                <SectionTitle
                  title="How should we choose the best supplier?"
                  copy="Tell us what matters most for this tender. Ofora will use these rules to assess every supplier fairly."
                />
                <p className="text-sm font-semibold text-ofora-muted">You can review everything before locking these rules.</p>

                <section>
                  <h3 className="text-2xl font-black tracking-[-0.055em] text-ofora-deep">What matters most?</h3>
                  <p className="mt-2 text-sm leading-6 text-ofora-muted">Put the most important factor at the top. Ofora will assign the scoring points automatically.</p>
                  <div className="mt-5 grid gap-3">
                    {rankedPriorities.map((item, index) => (
                      <article key={item.id} className="grid gap-4 border border-ofora-border bg-white p-4 sm:grid-cols-[4rem_1fr_auto] sm:items-center">
                        <div className="flex h-14 w-14 items-center justify-center bg-ofora-deep text-2xl font-black text-[#E7F5B8]">{index + 1}</div>
                        <div>
                          <h4 className="text-xl font-black tracking-[-0.045em] text-ofora-deep">{item.title}</h4>
                          <p className="mt-1 text-sm leading-6 text-ofora-muted">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-3 sm:justify-end">
                          <span className="min-w-20 rounded-full bg-[#E7F5B8] px-3 py-2 text-center text-sm font-black text-ofora-deep">{item.points} points</span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => movePriority(item.id, "up")}
                              aria-label={`Move ${item.title} up`}
                              className="ofora-focus flex h-11 w-11 items-center justify-center rounded-lg border border-ofora-border bg-white text-ofora-deep disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              <ArrowUp className="h-5 w-5" />
                            </button>
                            <button
                              type="button"
                              disabled={index === rankedPriorities.length - 1}
                              onClick={() => movePriority(item.id, "down")}
                              aria-label={`Move ${item.title} down`}
                              className="ofora-focus flex h-11 w-11 items-center justify-center rounded-lg border border-ofora-border bg-white text-ofora-deep disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              <ArrowDown className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                  <button type="button" onClick={() => setAdvancedOpen((open) => !open)} className="ofora-focus mt-4 text-sm font-black text-ofora-green underline-offset-4 hover:underline">
                    Need custom scoring?
                  </button>
                  {advancedOpen ? (
                    <div className="mt-4 border border-ofora-border bg-ofora-canvas p-5">
                      <h4 className="text-xl font-black tracking-[-0.045em] text-ofora-deep">Advanced scoring for procurement teams with their own weighting model.</h4>
                      <p className="mt-2 text-sm text-ofora-muted">Use this only if your team already has a required point model. The total must equal 100.</p>
                      <div className="mt-5 grid gap-4">
                        {Object.entries(weights).map(([key, value]) => (
                          <label key={key} className="grid gap-2 text-sm font-black capitalize text-ofora-deep">
                            {priorityOptions.find((item) => item.id === key)?.title ?? key} importance
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={value}
                              onChange={(event) => setWeights((current) => ({ ...current, [key]: Number(event.target.value) }))}
                              className="ofora-focus rounded-lg border border-ofora-border px-3 py-3 font-normal"
                            />
                          </label>
                        ))}
                      </div>
                      <p className={totalWeight === 100 ? "mt-4 text-sm font-black text-ofora-green" : "mt-4 text-sm font-black text-[#8A5A00]"}>{totalWeight} of 100 points assigned.</p>
                      <button type="button" onClick={() => setAdvancedOpen(false)} className="ofora-focus mt-3 text-sm font-black text-ofora-green underline-offset-4 hover:underline">Return to simple ranking</button>
                    </div>
                  ) : null}
                </section>

                <section className="bg-ofora-mist p-5">
                  <h3 className="text-2xl font-black tracking-[-0.055em] text-ofora-deep">How Ofora will choose a supplier</h3>
                  <p className="mt-3 text-sm leading-6 text-ofora-muted">First, Ofora removes suppliers who do not meet your minimum requirements. Then it compares the remaining suppliers using the priorities above. The supplier with the highest overall score can be selected.</p>
                  <div className="mt-5 grid gap-3 text-sm font-black text-ofora-deep md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
                    <StepChip label="Meet the minimum requirements" />
                    <span className="hidden text-ofora-green md:block">→</span>
                    <StepChip label="Score against your priorities" />
                    <span className="hidden text-ofora-green md:block">→</span>
                    <StepChip label="Confirm the best eligible supplier" />
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-black tracking-[-0.055em] text-ofora-deep">Minimum requirements</h3>
                  <p className="mt-2 text-sm leading-6 text-ofora-muted">These are not preferences. Every supplier must meet them before they can be considered.</p>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 border border-ofora-border bg-white p-5 text-sm font-black text-ofora-deep">
                      Minimum quality rating
                      <span className="text-sm font-normal leading-6 text-ofora-muted">Suppliers must score at least this rating to be considered.</span>
                      <input type="number" min="0" max="100" value={minimumQuality} onChange={(event) => setMinimumQuality(Number(event.target.value))} className="ofora-focus mt-2 rounded-lg border border-ofora-border px-3 py-3 font-normal" />
                      <span className="text-sm font-semibold text-ofora-green">Suppliers scoring below {minimumQuality} will not be considered.</span>
                    </label>
                    <label className="grid gap-2 border border-ofora-border bg-white p-5 text-sm font-black text-ofora-deep">
                      Latest acceptable delivery time
                      <span className="text-sm font-normal leading-6 text-ofora-muted">Suppliers must be able to deliver within this timeframe.</span>
                      <div className="mt-2 grid grid-cols-[1fr_auto] items-center rounded-lg border border-ofora-border bg-white">
                        <input type="number" min="1" value={maximumDelivery} onChange={(event) => setMaximumDelivery(Number(event.target.value))} className="ofora-focus border-0 px-3 py-3 font-normal outline-none" />
                        <span className="pr-3 text-ofora-muted">days</span>
                      </div>
                      <span className="text-sm font-semibold text-ofora-green">Suppliers taking longer than {maximumDelivery} days will not be considered.</span>
                    </label>
                  </div>
                </section>

                <section className="border border-ofora-border bg-white p-5">
                  <button type="button" onClick={() => setExampleOpen((open) => !open)} className="ofora-focus flex w-full items-center justify-between text-left">
                    <span className="text-xl font-black tracking-[-0.045em] text-ofora-deep">See how this works</span>
                    <span className="text-sm font-black text-ofora-green">{exampleOpen ? "Hide" : "Show"}</span>
                  </button>
                  {exampleOpen ? (
                    <p className="mt-4 text-sm leading-7 text-ofora-muted">
                      Supplier A offers the lowest price but cannot deliver for 18 days. Supplier B costs slightly more but can deliver in 7 days and meets all quality requirements.
                      <br /><br />
                      Because Supplier A misses your 14-day delivery requirement, Ofora will not consider them. Supplier B may be selected if they achieve the highest score among the eligible suppliers.
                    </p>
                  ) : null}
                </section>
              </div>
            ) : null}
            {step === 3 ? (
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-ofora-green">Final review</p>
                <h2 className="mt-4 text-[clamp(2.7rem,5vw,4.8rem)] font-black leading-[0.9] tracking-[-0.075em] text-ofora-deep">Review and lock<br />your rules.</h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-ofora-muted">Review the tender requirements and selection rules below. Once locked, these rules will apply equally to every supplier.</p>
                <p className="mt-3 text-sm font-semibold text-ofora-muted">You can return to earlier steps to make changes before locking.</p>
                {successMessage ? <p className="mt-5 bg-ofora-mist p-4 text-sm font-black text-ofora-green">{successMessage}</p> : null}
                <div className="mt-8">
                  <TenderReviewRecord
                    priorities={rankedPriorities}
                    minimumQuality={minimumQuality}
                    maximumDelivery={maximumDelivery}
                    onEditStep={setStep}
                  />
                </div>
              </div>
            ) : null}
            {step !== 3 ? (
              <>
                <p className="mt-8 border-t border-ofora-border pt-5 text-sm text-ofora-muted">You will be able to confirm these rules before locking them.</p>
                <div className="mt-3 flex justify-between">
                  <button className="rounded-lg border border-ofora-border bg-white px-4 py-2.5 text-sm font-black" onClick={() => setStep(Math.max(0, step - 1))}>Back</button>
                  <button className="rounded-lg bg-ofora-green px-4 py-2.5 text-sm font-black text-white" onClick={() => setStep(Math.min(3, step + 1))}>{step === 2 ? "Review selection rules" : "Next"}</button>
                </div>
              </>
            ) : null}
          </RecordPanel>
          {step === 3 ? (
            <ReadyToLockPanel onLock={() => setLockModalOpen(true)} onBack={() => setStep(2)} />
          ) : (
            <RecordPanel className="h-fit bg-[#E7F5B8] p-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-ofora-green">Your selection rules</p>
              <div className="mt-6 space-y-5 text-sm">
                <SummaryLine label="Most important" value={rankedPriorities[0].title} />
                <SummaryLine label="Must meet" value={`Quality rating of ${minimumQuality} or above`} />
                <SummaryLine label="Must meet" value={`Delivery within ${maximumDelivery} days`} />
                <SummaryLine label="Scoring" value={`${totalWeight} points assigned automatically`} />
                <p className="flex items-center gap-2 font-black text-ofora-green"><CheckCircle2 className="h-4 w-4" />All scoring points assigned.</p>
              </div>
              <div className="mt-6 border-t border-ofora-deep/15 pt-4 text-sm leading-6 text-ofora-ink/75">
                <LockKeyhole className="mb-2 h-4 w-4 text-ofora-green" />
                Once you lock these rules, they cannot be changed after suppliers start submitting.
              </div>
            </RecordPanel>
          )}
        </div>
        <LockRulesModal
          open={lockModalOpen}
          onOpenChange={setLockModalOpen}
          onConfirm={lockTender}
          mostImportant={rankedPriorities[0].title}
          minimumQuality={minimumQuality}
          maximumDelivery={maximumDelivery}
        />
      </div>
    </AppShell>
  );
}

function StepChip({ label }: { label: string }) {
  return <div className="border border-ofora-border bg-white px-4 py-3">{label}</div>;
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-ofora-green">{label}</p>
      <p className="mt-1 font-black text-ofora-deep">{value}</p>
    </div>
  );
}

function SectionTitle({ title, copy, className }: { title: string; copy: string; className?: string }) {
  return (
    <div className={className}>
      <h2 className="text-3xl font-black tracking-[-0.06em] text-ofora-deep">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ofora-muted">{copy}</p>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <label className="grid gap-2 text-sm font-black text-ofora-deep">
      {label}
      <input className="ofora-focus rounded-lg border border-ofora-border px-3 py-3 font-normal" defaultValue={defaultValue} />
    </label>
  );
}
