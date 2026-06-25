"use client";

import { ChangeEvent, FormEvent, ReactNode, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, FileUp, LockKeyhole, ShieldCheck } from "lucide-react";
import { addSupplierSubmission, StoredSupplierSubmission } from "@/lib/submission-store";
import { cn, formatDateTime } from "@/lib/utils";

type CompanyDetails = {
  legalCompanyName: string;
  tradingName: string;
  primaryContactName: string;
  workEmail: string;
  phone: string;
  countryRegion: string;
  registrationNumber: string;
};

type CommercialProposal = {
  proposedTotalPrice: string;
  currency: string;
  estimatedDeliveryTime: string;
  deliveryTimeUnit: string;
  stockAvailability: string;
  unitsAvailableNow: string;
  warrantyService: string;
};

type CapabilityData = {
  qualityRating: string;
  certificationStatus: string;
  localEconomicContribution: string;
  optionalNote: string;
};

const steps = ["Company details", "Commercial proposal", "Capability/compliance", "Review and submit"];

const demoProposals: Record<string, Partial<CommercialProposal & CapabilityData>> = {
  "atlas supply group": {
    proposedTotalPrice: "8900",
    estimatedDeliveryTime: "9",
    stockAvailability: "100",
    unitsAvailableNow: "2000",
    qualityRating: "82",
    localEconomicContribution: "70",
    certificationStatus: "ISO 9001 certified"
  },
  "nova relief systems": {
    proposedTotalPrice: "9400",
    estimatedDeliveryTime: "7",
    stockAvailability: "100",
    unitsAvailableNow: "2000",
    qualityRating: "91",
    localEconomicContribution: "88",
    certificationStatus: "IEC certified"
  },
  "meridian industrial ltd.": {
    proposedTotalPrice: "8100",
    estimatedDeliveryTime: "18",
    stockAvailability: "100",
    unitsAvailableNow: "2000",
    qualityRating: "80",
    localEconomicContribution: "60",
    certificationStatus: "Manufacturer certificate supplied"
  }
};

export function SupplierSubmissionFlow({ tenderId }: { tenderId: string }) {
  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState<StoredSupplierSubmission | null>(null);
  const [documents, setDocuments] = useState<string[]>([]);
  const [company, setCompany] = useState<CompanyDetails>({
    legalCompanyName: "Atlas Supply Group",
    tradingName: "",
    primaryContactName: "Maya Kent",
    workEmail: "maya@atlas.example",
    phone: "+1 202 555 0188",
    countryRegion: "United States",
    registrationNumber: ""
  });
  const [proposal, setProposal] = useState<CommercialProposal>({
    proposedTotalPrice: "8900",
    currency: "USD",
    estimatedDeliveryTime: "9",
    deliveryTimeUnit: "days",
    stockAvailability: "100",
    unitsAvailableNow: "2000",
    warrantyService: "12-month replacement warranty and field support"
  });
  const [capability, setCapability] = useState<CapabilityData>({
    qualityRating: "82",
    certificationStatus: "ISO 9001 certified",
    localEconomicContribution: "70",
    optionalNote: "Able to mobilize partial shipment within 72 hours."
  });

  const canContinue = useMemo(() => {
    if (step === 0) return Boolean(company.legalCompanyName && company.primaryContactName && company.workEmail && company.phone && company.countryRegion);
    if (step === 1) return Boolean(proposal.proposedTotalPrice && proposal.currency && proposal.estimatedDeliveryTime && proposal.stockAvailability && proposal.unitsAvailableNow);
    if (step === 2) return Boolean(capability.qualityRating && capability.certificationStatus && capability.localEconomicContribution);
    return confirmed;
  }, [capability, company, confirmed, proposal, step]);

  function applyDemoValues(name: string) {
    const demo = demoProposals[name.trim().toLowerCase()];
    if (!demo) return;
    setProposal((current) => ({
      ...current,
      proposedTotalPrice: demo.proposedTotalPrice ?? current.proposedTotalPrice,
      estimatedDeliveryTime: demo.estimatedDeliveryTime ?? current.estimatedDeliveryTime,
      stockAvailability: demo.stockAvailability ?? current.stockAvailability,
      unitsAvailableNow: demo.unitsAvailableNow ?? current.unitsAvailableNow
    }));
    setCapability((current) => ({
      ...current,
      qualityRating: demo.qualityRating ?? current.qualityRating,
      certificationStatus: demo.certificationStatus ?? current.certificationStatus,
      localEconomicContribution: demo.localEconomicContribution ?? current.localEconomicContribution
    }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!confirmed) return;
    const result = addSupplierSubmission(tenderId, {
      supplierCompany: company.legalCompanyName,
      companyDetails: {
        legalCompanyName: company.legalCompanyName,
        tradingName: company.tradingName,
        primaryContactName: company.primaryContactName,
        workEmail: company.workEmail,
        phone: company.phone,
        countryRegion: company.countryRegion,
        registrationNumber: company.registrationNumber
      },
      commercialProposal: {
        proposedTotalPrice: proposal.proposedTotalPrice,
        currency: proposal.currency,
        estimatedDeliveryTime: proposal.estimatedDeliveryTime,
        deliveryTimeUnit: proposal.deliveryTimeUnit,
        stockAvailability: proposal.stockAvailability,
        unitsAvailableNow: proposal.unitsAvailableNow,
        warrantyService: proposal.warrantyService
      },
      capabilityData: {
        qualityRating: capability.qualityRating,
        certificationStatus: capability.certificationStatus,
        localEconomicContribution: capability.localEconomicContribution,
        optionalNote: capability.optionalNote
      },
      documentMetadata: documents
    });
    setSubmitted(result.submission);
  }

  if (submitted) {
    return <SubmissionSuccess submission={submitted} onSummary={() => setSubmitted(null)} />;
  }

  return (
    <main className="min-h-screen bg-ofora-canvas text-ofora-ink">
      <PublicHeader tenderId={tenderId} />
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
        <div className="space-y-6">
          <div className="border border-ofora-border bg-white p-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-ofora-green">Confidential supplier submission</p>
            <h1 className="mt-4 text-[clamp(2.6rem,6vw,5.2rem)] font-black leading-[0.9] tracking-[-0.075em] text-ofora-deep">Submit with confidence.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-ofora-muted">
              Your commercial proposal will remain confidential and will be assessed against the tender&apos;s locked selection rules.
            </p>
          </div>

          <Progress current={step} />

          <form onSubmit={handleSubmit} className="border border-ofora-border bg-white p-5 sm:p-6">
            {step === 0 ? (
              <CompanyStep
                value={company}
                onChange={(next) => {
                  setCompany(next);
                  applyDemoValues(next.legalCompanyName);
                }}
              />
            ) : null}
            {step === 1 ? <CommercialStep value={proposal} onChange={setProposal} /> : null}
            {step === 2 ? <CapabilityStep value={capability} onChange={setCapability} documents={documents} onDocuments={setDocuments} /> : null}
            {step === 3 ? (
              <ReviewStep company={company} proposal={proposal} capability={capability} documents={documents} confirmed={confirmed} onConfirmed={setConfirmed} />
            ) : null}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-ofora-border pt-5 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => setStep((current) => Math.max(0, current - 1))}
                disabled={step === 0}
                className="ofora-focus inline-flex items-center justify-center gap-2 rounded-lg border border-ofora-border bg-white px-4 py-3 text-sm font-black text-ofora-deep disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to edit
              </button>
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  disabled={!canContinue}
                  onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}
                  className="ofora-focus inline-flex items-center justify-center gap-2 rounded-lg bg-ofora-deep px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!canContinue}
                  className="ofora-focus inline-flex items-center justify-center gap-2 rounded-lg bg-ofora-green px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Submit confidential proposal
                </button>
              )}
            </div>
          </form>
        </div>

        <aside className="space-y-5">
          <TenderSummary tenderId={tenderId} />
          <ConfidentialityNotice />
        </aside>
      </section>
    </main>
  );
}

function PublicHeader({ tenderId }: { tenderId: string }) {
  return (
    <header className="border-b border-ofora-border bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ofora-deep text-sm font-black text-white">O</span>
          <div>
            <p className="font-black tracking-[-0.04em] text-ofora-deep">Ofora</p>
            <p className="text-xs font-semibold text-ofora-muted">Secure supplier submission</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-black text-ofora-deep">{tenderId}</span>
          <a href="mailto:support@ofora.example" className="ofora-focus rounded-md border border-ofora-border px-3 py-2 font-black text-ofora-green">Support</a>
        </div>
      </div>
    </header>
  );
}

function Progress({ current }: { current: number }) {
  return (
    <nav className="grid gap-2 sm:grid-cols-4" aria-label="Submission progress">
      {steps.map((label, index) => (
        <div key={label} className={cn("border px-3 py-3 text-sm", index <= current ? "border-ofora-green bg-ofora-mist text-ofora-green" : "border-ofora-border bg-white text-ofora-muted")}>
          <p className="text-xs font-black uppercase tracking-[0.14em]">Step {index + 1}</p>
          <p className="mt-1 font-black">{label}</p>
        </div>
      ))}
    </nav>
  );
}

function TenderSummary({ tenderId }: { tenderId: string }) {
  return (
    <section className="border border-ofora-border bg-white p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-ofora-green">Tender summary</p>
      <h2 className="mt-4 text-2xl font-black tracking-[-0.055em] text-ofora-deep">Emergency Solar Lantern Procurement</h2>
      <dl className="mt-5 grid gap-3 text-sm">
        <SummaryRow label="Organization" value="Global Relief & Infrastructure Network" />
        <SummaryRow label="Reference" value={tenderId} />
        <SummaryRow label="Deadline" value="June 28, 2026" />
        <SummaryRow label="Delivery requirement" value="Within 14 days" />
        <SummaryRow label="Quality threshold" value="75 / 100" />
      </dl>
    </section>
  );
}

function ConfidentialityNotice() {
  return (
    <section className="border border-ofora-green/25 bg-ofora-mist p-5">
      <div className="flex items-start gap-3">
        <LockKeyhole className="mt-0.5 h-5 w-5 text-ofora-green" />
        <div>
          <p className="font-black text-ofora-deep">Confidentiality notice</p>
          <p className="mt-2 text-sm leading-6 text-ofora-muted">
            Procurement officers can see that a proposal was received, but commercial values and uploaded document names stay protected until the evaluation stage.
          </p>
        </div>
      </div>
    </section>
  );
}

function CompanyStep({ value, onChange }: { value: CompanyDetails; onChange: (value: CompanyDetails) => void }) {
  return (
    <StepShell title="Company details" description="Tell the procurement team who is submitting this proposal.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Legal company name" value={value.legalCompanyName} onChange={(legalCompanyName) => onChange({ ...value, legalCompanyName })} />
        <Field label="Trading name optional" value={value.tradingName} onChange={(tradingName) => onChange({ ...value, tradingName })} />
        <Field label="Primary contact" value={value.primaryContactName} onChange={(primaryContactName) => onChange({ ...value, primaryContactName })} />
        <Field label="Work email" type="email" value={value.workEmail} onChange={(workEmail) => onChange({ ...value, workEmail })} />
        <Field label="Phone" value={value.phone} onChange={(phone) => onChange({ ...value, phone })} />
        <Field label="Country/region" value={value.countryRegion} onChange={(countryRegion) => onChange({ ...value, countryRegion })} />
        <Field label="Registration number optional" value={value.registrationNumber} onChange={(registrationNumber) => onChange({ ...value, registrationNumber })} />
      </div>
    </StepShell>
  );
}

function CommercialStep({ value, onChange }: { value: CommercialProposal; onChange: (value: CommercialProposal) => void }) {
  return (
    <StepShell title="Commercial proposal" description="Enter the commercial offer that will be held for confidential evaluation.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Proposed total price" type="number" value={value.proposedTotalPrice} onChange={(proposedTotalPrice) => onChange({ ...value, proposedTotalPrice })} />
        <Field label="Currency" value={value.currency} onChange={(currency) => onChange({ ...value, currency })} />
        <Field label="Estimated delivery time" type="number" value={value.estimatedDeliveryTime} onChange={(estimatedDeliveryTime) => onChange({ ...value, estimatedDeliveryTime })} />
        <Field label="Delivery time unit" value={value.deliveryTimeUnit} onChange={(deliveryTimeUnit) => onChange({ ...value, deliveryTimeUnit })} />
        <Field label="Stock availability" type="number" value={value.stockAvailability} onChange={(stockAvailability) => onChange({ ...value, stockAvailability })} />
        <Field label="Number of units available now" type="number" value={value.unitsAvailableNow} onChange={(unitsAvailableNow) => onChange({ ...value, unitsAvailableNow })} />
        <Field label="Warranty/service optional" value={value.warrantyService} onChange={(warrantyService) => onChange({ ...value, warrantyService })} className="sm:col-span-2" />
      </div>
    </StepShell>
  );
}

function CapabilityStep({
  value,
  onChange,
  documents,
  onDocuments
}: {
  value: CapabilityData;
  onChange: (value: CapabilityData) => void;
  documents: string[];
  onDocuments: (value: string[]) => void;
}) {
  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    onDocuments(Array.from(event.target.files ?? []).map((file) => file.name));
  }

  return (
    <StepShell title="Capability/compliance" description="Share quality, compliance, and supporting document information.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Quality and compliance rating" type="number" value={value.qualityRating} onChange={(qualityRating) => onChange({ ...value, qualityRating })} />
        <Field label="Certification status" value={value.certificationStatus} onChange={(certificationStatus) => onChange({ ...value, certificationStatus })} />
        <Field label="Local contribution" type="number" value={value.localEconomicContribution} onChange={(localEconomicContribution) => onChange({ ...value, localEconomicContribution })} />
        <Field label="Optional note" value={value.optionalNote} onChange={(optionalNote) => onChange({ ...value, optionalNote })} />
      </div>
      <label className="mt-5 flex cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-ofora-border bg-ofora-canvas p-6 text-center">
        <FileUp className="h-7 w-7 text-ofora-green" />
        <span className="font-black text-ofora-deep">Upload supporting documents</span>
        <span className="text-sm text-ofora-muted">File names are recorded for this demo. No files are uploaded.</span>
        <input type="file" multiple className="sr-only" onChange={handleFiles} />
      </label>
      {documents.length > 0 ? (
        <ul className="mt-4 grid gap-2 text-sm text-ofora-muted">
          {documents.map((documentName) => <li key={documentName} className="border border-ofora-border bg-white px-3 py-2">{documentName}</li>)}
        </ul>
      ) : null}
    </StepShell>
  );
}

function ReviewStep({
  company,
  proposal,
  capability,
  documents,
  confirmed,
  onConfirmed
}: {
  company: CompanyDetails;
  proposal: CommercialProposal;
  capability: CapabilityData;
  documents: string[];
  confirmed: boolean;
  onConfirmed: (value: boolean) => void;
}) {
  return (
    <StepShell title="Review and submit" description="Confirm your proposal before submitting it for tender evaluation.">
      <div className="grid gap-4 lg:grid-cols-3">
        <SummaryCard title="Company" rows={[["Legal name", company.legalCompanyName], ["Contact", company.primaryContactName], ["Email", company.workEmail], ["Country/region", company.countryRegion]]} />
        <SummaryCard title="Commercial" rows={[["Total price", `${proposal.currency} ${proposal.proposedTotalPrice}`], ["Delivery", `${proposal.estimatedDeliveryTime} ${proposal.deliveryTimeUnit}`], ["Stock availability", `${proposal.stockAvailability}%`], ["Units now", proposal.unitsAvailableNow]]} />
        <SummaryCard title="Capability" rows={[["Quality rating", capability.qualityRating], ["Certification", capability.certificationStatus], ["Local contribution", capability.localEconomicContribution], ["Documents", documents.length ? documents.join(", ") : "No files selected"]]} />
      </div>
      <div className="mt-5 border border-ofora-green/25 bg-ofora-mist p-4 text-sm leading-6 text-ofora-muted">
        Your commercial proposal is protected and only the receipt status is visible to procurement officers before evaluation begins.
      </div>
      <label className="mt-5 flex items-start gap-3 text-sm font-semibold text-ofora-deep">
        <input type="checkbox" checked={confirmed} onChange={(event) => onConfirmed(event.target.checked)} className="mt-1 h-4 w-4 accent-ofora-green" />
        I confirm that this submission is complete and ready for confidential assessment.
      </label>
    </StepShell>
  );
}

function SubmissionSuccess({ submission, onSummary }: { submission: StoredSupplierSubmission; onSummary: () => void }) {
  return (
    <main className="min-h-screen bg-ofora-canvas px-4 py-8 text-ofora-ink">
      <section className="mx-auto max-w-3xl border border-ofora-border bg-white p-6 sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-ofora-mist text-ofora-green">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-ofora-green">Submission received</p>
        <h1 className="mt-4 text-[clamp(2.6rem,6vw,4.8rem)] font-black leading-[0.9] tracking-[-0.075em] text-ofora-deep">Your proposal has been submitted.</h1>
        <p className="mt-5 text-base leading-7 text-ofora-muted">
          Ofora recorded your proposal and will notify the procurement team that a confidential submission was received before the deadline.
        </p>
        <dl className="mt-7 grid gap-3 border border-ofora-border bg-ofora-canvas p-5 text-sm">
          <SummaryRow label="Receipt reference" value={submission.id} />
          <SummaryRow label="Tender" value="Emergency Solar Lantern Procurement" />
          <SummaryRow label="Submitted" value={formatDateTime(submission.submittedAt)} />
          <SummaryRow label="Status" value="Received before deadline" />
        </dl>
        <p className="mt-5 text-sm leading-6 text-ofora-muted">Ofora will notify you when the procurement team has completed the next review step.</p>
        <button type="button" onClick={onSummary} className="ofora-focus mt-6 rounded-lg bg-ofora-deep px-4 py-3 text-sm font-black text-white">
          View submission summary
        </button>
      </section>
    </main>
  );
}

function StepShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-3xl font-black tracking-[-0.06em] text-ofora-deep">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ofora-muted">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange, type = "text", className }: { label: string; value: string; onChange: (value: string) => void; type?: string; className?: string }) {
  return (
    <label className={cn("grid gap-2 text-sm font-black text-ofora-deep", className)}>
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="ofora-focus rounded-lg border border-ofora-border px-3 py-3 font-normal text-ofora-ink" />
    </label>
  );
}

function SummaryCard({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="border border-ofora-border p-4">
      <h3 className="font-black text-ofora-deep">{title}</h3>
      <dl className="mt-4 grid gap-3 text-sm">
        {rows.map(([label, value]) => <SummaryRow key={label} label={label} value={value || "Not provided"} />)}
      </dl>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ofora-border pb-2">
      <dt className="text-ofora-muted">{label}</dt>
      <dd className="text-right font-black text-ofora-deep">{value}</dd>
    </div>
  );
}
