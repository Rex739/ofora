import {
  AuditRecord,
  PaymentStatus,
  SubmissionStatus,
  Supplier,
  SupplierSubmission,
  Tender,
  TenderStatus,
  ValidationStatus
} from "@/lib/types";

export const suppliers: Supplier[] = [
  { id: "sup-atlas", name: "Atlas Supply Group", country: "United Kingdom" },
  { id: "sup-nova", name: "Nova Relief Systems", country: "Singapore" },
  { id: "sup-meridian", name: "Meridian Industrial Ltd.", country: "Kenya" }
];

export const primaryTender: Tender = {
  id: "OFR-2026-041",
  title: "Emergency Solar Lantern Procurement",
  organization: "Global Relief & Infrastructure Network",
  category: "Emergency response equipment",
  summary:
    "Procurement of 2,000 emergency solar lantern units for rapid deployment across regional relief operations.",
  budget: 10000,
  currency: "USD",
  status: TenderStatus.AwardPendingValidation,
  deadline: "2026-06-28T17:00:00.000Z",
  deliveryDeadline: "2026-07-15T17:00:00.000Z",
  paymentStatus: PaymentStatus.PendingValidation,
  supplierSubmissionIds: ["sub-atlas", "sub-nova", "sub-meridian"],
  policy: {
    version: "1.0",
    locked: true,
    lockedAt: "2026-06-20T09:30:00.000Z",
    minimumQualityScore: 75,
    maximumDeliveryDays: 14,
    budgetCeiling: 10000,
    criteria: [
      { id: "price", label: "Price efficiency", weight: 35 },
      { id: "delivery", label: "Delivery reliability", weight: 25 },
      { id: "stock", label: "Stock availability", weight: 20 },
      { id: "quality", label: "Quality certification", weight: 10 },
      { id: "local", label: "Local supplier contribution", weight: 10 }
    ]
  },
  auditTimeline: [
    {
      id: "tl-created",
      label: "Tender created",
      timestamp: "2026-06-18T10:00:00.000Z",
      description: "Procurement team created the tender record and initial requirements."
    },
    {
      id: "tl-locked",
      label: "Award policy locked",
      timestamp: "2026-06-20T09:30:00.000Z",
      description: "Evaluation policy locked before supplier submissions."
    },
    {
      id: "tl-submitted",
      label: "Supplier submissions received",
      timestamp: "2026-06-24T16:20:00.000Z",
      description: "Three confidential bid dossiers were received."
    }
  ]
};

export const tenderList: Tender[] = [
  primaryTender,
  {
    ...primaryTender,
    id: "OFR-2026-038",
    title: "Water Treatment Equipment Sourcing",
    organization: "East Africa Resilience Facility",
    category: "Water infrastructure",
    budget: 420000,
    status: TenderStatus.Open,
    deadline: "2026-07-09T12:00:00.000Z",
    supplierSubmissionIds: [],
    paymentStatus: PaymentStatus.NotReady
  },
  {
    ...primaryTender,
    id: "OFR-2026-036",
    title: "Regional Medical Supply Procurement",
    organization: "International Health Logistics Alliance",
    category: "Medical logistics",
    budget: 760000,
    status: TenderStatus.Validated,
    deadline: "2026-06-12T12:00:00.000Z",
    paymentStatus: PaymentStatus.ReadyForControlledRelease
  },
  {
    ...primaryTender,
    id: "OFR-2026-033",
    title: "Bridge Maintenance Materials Tender",
    organization: "Andean Transport Authority",
    category: "Transport infrastructure",
    budget: 1180000,
    status: TenderStatus.AwardPendingValidation,
    deadline: "2026-06-30T12:00:00.000Z",
    paymentStatus: PaymentStatus.PendingValidation
  },
  {
    ...primaryTender,
    id: "OFR-2026-029",
    title: "Data Center Infrastructure Tender",
    organization: "Nordic Public Services Cloud",
    category: "Digital infrastructure",
    budget: 2100000,
    status: TenderStatus.Validated,
    deadline: "2026-05-26T12:00:00.000Z",
    paymentStatus: PaymentStatus.ReadyForControlledRelease
  }
];

export const submissions: SupplierSubmission[] = [
  {
    id: "sub-atlas",
    supplierId: "sup-atlas",
    tenderId: "OFR-2026-041",
    submittedAt: "2026-06-24T10:15:00.000Z",
    status: SubmissionStatus.Evaluated,
    price: 8900,
    deliveryDays: 9,
    stockAvailability: 100,
    qualityScore: 82,
    localContributionScore: 70,
    confidentialDossier: true
  },
  {
    id: "sub-nova",
    supplierId: "sup-nova",
    tenderId: "OFR-2026-041",
    submittedAt: "2026-06-24T11:02:00.000Z",
    status: SubmissionStatus.Evaluated,
    price: 9400,
    deliveryDays: 7,
    stockAvailability: 100,
    qualityScore: 91,
    localContributionScore: 88,
    confidentialDossier: true
  },
  {
    id: "sub-meridian",
    supplierId: "sup-meridian",
    tenderId: "OFR-2026-041",
    submittedAt: "2026-06-24T13:44:00.000Z",
    status: SubmissionStatus.Evaluated,
    price: 8100,
    deliveryDays: 18,
    stockAvailability: 100,
    qualityScore: 80,
    localContributionScore: 60,
    confidentialDossier: true
  }
];

export const dashboardData = {
  user: "Elena Marquez",
  role: "Strategic Procurement Lead",
  organization: "Global Relief & Infrastructure Network",
  metrics: [
    { label: "Active Tenders", value: "4" },
    { label: "Awards Awaiting Validation", value: "2" },
    { label: "Validated Awards This Quarter", value: "18" },
    { label: "Total Managed Value", value: "$2.4M" }
  ],
  activity: [
    "Fair Award Receipt FAR-OFR-2026-036-001 issued for regional medical supplies.",
    "Evaluation policy locked for water treatment equipment sourcing.",
    "Award validation requested for bridge maintenance materials."
  ]
};

export const auditRecords: AuditRecord[] = [
  {
    id: "audit-ofr-2026-041",
    tenderId: primaryTender.id,
    tenderTitle: primaryTender.title,
    organization: primaryTender.organization,
    awardedSupplier: "Nova Relief Systems",
    awardValue: 9400,
    awardStatus: "Independently validated",
    validationStatus: ValidationStatus.Validated,
    policyLockStatus: "Locked before submissions",
    auditCompleteness: "Complete",
    validationDate: "2026-06-25T08:40:00.000Z",
    receiptId: "FAR-OFR-2026-041-001",
    paymentStatus: PaymentStatus.ReadyForControlledRelease,
    timeline: [
      ...primaryTender.auditTimeline,
      {
        id: "tl-evaluated",
        label: "Evaluation completed",
        timestamp: "2026-06-25T08:25:00.000Z",
        description: "Eligible supplier rankings were calculated under the locked policy."
      },
      {
        id: "tl-validated",
        label: "Award validated",
        timestamp: "2026-06-25T08:40:00.000Z",
        description: "Award integrity confirmed and Fair Award Receipt generated."
      },
      {
        id: "tl-award-finalized",
        label: "Award record finalized",
        timestamp: "2026-06-25T08:43:00.000Z",
        description: "The validated award record is ready for a future controlled-release workflow. Payment execution is not included in this hackathon MVP."
      }
    ]
  },
  {
    id: "audit-ofr-2026-036",
    tenderId: "OFR-2026-036",
    tenderTitle: "Regional Medical Supply Procurement",
    organization: "International Health Logistics Alliance",
    awardedSupplier: "HelioMed Distribution",
    awardValue: 742000,
    awardStatus: "Independently validated",
    validationStatus: ValidationStatus.Validated,
    policyLockStatus: "Locked before submissions",
    auditCompleteness: "Complete",
    validationDate: "2026-06-14T09:05:00.000Z",
    receiptId: "FAR-OFR-2026-036-001",
    paymentStatus: PaymentStatus.ReadyForControlledRelease,
    timeline: []
  }
];
