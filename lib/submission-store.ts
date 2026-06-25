"use client";

export type InvitedSupplier = {
  id: string;
  tenderId: string;
  company: string;
  contact: string;
  email: string;
  invitationStatus: "Invitation prepared";
  invitationDate: string;
  submissionStatus: "Not yet submitted" | "Submission received";
};

export type StoredSupplierSubmission = {
  id: string;
  tenderId: string;
  supplierCompany: string;
  submittedAt: string;
  submissionStatus: "Received";
  eligibilityStatus: "Requirements check pending" | "Eligible" | "Not eligible" | "Under review";
  confidentialDossierStatus: "Protected";
  companyDetails: Record<string, string>;
  commercialProposal: Record<string, string>;
  capabilityData: Record<string, string>;
  documentMetadata: string[];
};

export type StoredTenderSubmissionState = {
  tenderId: string;
  status: "Open for submissions" | "Evaluation in progress";
  invitedSuppliers: InvitedSupplier[];
  submissions: StoredSupplierSubmission[];
  auditEvents: Array<{
    id: string;
    title: string;
    description: string;
    timestamp: string;
    actor: string;
    eventType: string;
  }>;
};

const keyForTender = (tenderId: string) => `ofora:tender-submissions:v2:${tenderId}`;

const demoInvites = (tenderId: string): InvitedSupplier[] => [
  "Atlas Supply Group",
  "Nova Relief Systems",
  "Meridian Industrial Ltd."
].map((company, index) => ({
  id: `invite-${index + 1}`,
  tenderId,
  company,
  contact: ["Maya Kent", "Daniel Tan", "Amina Okello"][index],
  email: ["maya@atlas.example", "daniel@nova.example", "amina@meridian.example"][index],
  invitationStatus: "Invitation prepared",
  invitationDate: "2026-06-25T09:00:00.000Z",
  submissionStatus: "Not yet submitted"
}));

export function getTenderSubmissionState(tenderId: string): StoredTenderSubmissionState {
  if (typeof window === "undefined") {
    return { tenderId, status: "Open for submissions", invitedSuppliers: [], submissions: [], auditEvents: [] };
  }

  const stored = window.localStorage.getItem(keyForTender(tenderId));
  if (stored) return JSON.parse(stored) as StoredTenderSubmissionState;

  const initial = {
    tenderId,
    status: "Open for submissions" as const,
    invitedSuppliers: demoInvites(tenderId),
    submissions: [],
    auditEvents: []
  };
  saveTenderSubmissionState(initial);
  return initial;
}

export function saveTenderSubmissionState(state: StoredTenderSubmissionState) {
  window.localStorage.setItem(keyForTender(state.tenderId), JSON.stringify(state));
}

export function addInvitedSupplier(tenderId: string, input: { company: string; contact: string; email: string }) {
  const state = getTenderSubmissionState(tenderId);
  const next: InvitedSupplier = {
    id: `invite-${Date.now()}`,
    tenderId,
    company: input.company,
    contact: input.contact,
    email: input.email,
    invitationStatus: "Invitation prepared",
    invitationDate: new Date().toISOString(),
    submissionStatus: "Not yet submitted"
  };
  const nextState = { ...state, invitedSuppliers: [next, ...state.invitedSuppliers] };
  saveTenderSubmissionState(nextState);
  return nextState;
}

export function addSupplierSubmission(tenderId: string, submission: Omit<StoredSupplierSubmission, "id" | "tenderId" | "submittedAt" | "submissionStatus" | "eligibilityStatus" | "confidentialDossierStatus">) {
  const state = getTenderSubmissionState(tenderId);
  const submittedAt = new Date().toISOString();
  const next: StoredSupplierSubmission = {
    ...submission,
    id: `SUB-${tenderId}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    tenderId,
    submittedAt,
    submissionStatus: "Received",
    eligibilityStatus: "Requirements check pending",
    confidentialDossierStatus: "Protected"
  };

  const invitedSuppliers = state.invitedSuppliers.map((supplier) =>
    supplier.company.toLowerCase() === submission.supplierCompany.toLowerCase()
      ? { ...supplier, submissionStatus: "Submission received" as const }
      : supplier
  );

  const nextState: StoredTenderSubmissionState = {
    ...state,
    invitedSuppliers,
    submissions: [next, ...state.submissions],
    auditEvents: [
      {
        id: `event-${Date.now()}`,
        title: "Confidential supplier submission received",
        description: "A supplier submitted a confidential proposal before the submission deadline.",
        timestamp: submittedAt,
        actor: "Supplier submission portal",
        eventType: "submission_received"
      },
      ...state.auditEvents
    ]
  };
  saveTenderSubmissionState(nextState);
  return { state: nextState, submission: next };
}

export function closeSubmissions(tenderId: string) {
  const state = getTenderSubmissionState(tenderId);
  const nextState: StoredTenderSubmissionState = {
    ...state,
    status: "Evaluation in progress",
    auditEvents: [
      {
        id: `event-${Date.now()}`,
        title: "Supplier submissions closed",
        description: "Supplier submissions were closed and confidential evaluation began.",
        timestamp: new Date().toISOString(),
        actor: "Elena Marquez",
        eventType: "submissions_closed"
      },
      ...state.auditEvents
    ]
  };
  saveTenderSubmissionState(nextState);
  return nextState;
}

export function seedDemoSubmissions(tenderId: string) {
  const demo = [
    ["Atlas Supply Group", "8900", "9", "100", "2000", "82", "70"],
    ["Nova Relief Systems", "9400", "7", "100", "2000", "91", "88"],
    ["Meridian Industrial Ltd.", "8100", "18", "100", "2000", "80", "60"]
  ];
  let latest = getTenderSubmissionState(tenderId);
  demo.forEach(([supplierCompany, price, delivery, stock, units, quality, local]) => {
    if (latest.submissions.some((submission) => submission.supplierCompany === supplierCompany)) return;
    latest = addSupplierSubmission(tenderId, {
      supplierCompany,
      companyDetails: { legalCompanyName: supplierCompany, primaryContactName: "Demo contact", workEmail: "demo@example.com" },
      commercialProposal: { proposedTotalPrice: price, currency: "USD", estimatedDeliveryTime: delivery, stockAvailability: stock, unitsAvailableNow: units },
      capabilityData: { qualityRating: quality, certificationStatus: "Certified", localEconomicContribution: local },
      documentMetadata: ["quality-certificate.pdf"]
    }).state;
  });
  return latest;
}
