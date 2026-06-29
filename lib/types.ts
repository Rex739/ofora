export enum TenderStatus {
  Draft = "Draft",
  OpenForSubmissions = "Open for submissions",
  Open = "Open",
  EvaluationInProgress = "Evaluation in progress",
  AwardPendingValidation = "Award Pending Validation",
  Validated = "Validated",
  Blocked = "Blocked",
  Closed = "Closed"
}

export enum PolicyStatus {
  Draft = "Draft",
  Locked = "Locked"
}

export enum SubmissionStatus {
  Received = "Received",
  UnderEvaluation = "Under Evaluation",
  Evaluated = "Evaluated"
}

export enum EligibilityStatus {
  Eligible = "Eligible",
  Ineligible = "Ineligible"
}

export enum ValidationStatus {
  Pending = "Pending",
  Validated = "Validated",
  NotValidated = "Not validated"
}

export enum PaymentStatus {
  NotReady = "Not ready",
  PendingValidation = "Pending validation",
  ReadyForControlledRelease = "Ready for controlled release",
  Authorized = "Authorized",
  Released = "Released"
}

export type EvaluationCriteria = {
  id: string;
  label: string;
  weight: number;
};

export type AwardPolicy = {
  version: string;
  criteria: EvaluationCriteria[];
  minimumQualityScore: number;
  maximumDeliveryDays: number;
  budgetCeiling: number;
  locked: boolean;
  lockedAt: string;
};

export type Supplier = {
  id: string;
  name: string;
  country: string;
};

export type SupplierSubmission = {
  id: string;
  supplierId: string;
  tenderId: string;
  submittedAt: string;
  status: SubmissionStatus;
  price: number;
  deliveryDays: number;
  stockAvailability: number;
  qualityScore: number;
  localContributionScore: number;
  confidentialDossier: boolean;
  eligibilityStatus?: "Pending" | "Eligible" | "Not eligible";
  eligibilityReason?: string | null;
  evaluationStatus?: "Not started" | "In review" | "Complete";
  evaluationScore?: number | null;
};

export type EvaluationResult = {
  supplierId: string;
  priceScore: number;
  deliveryScore: number;
  stockScore: number;
  qualityScore: number;
  localContributionScore: number;
  totalScore: number | null;
  eligible: boolean;
  disqualificationReason?: string;
};

export type AwardDecision = {
  tenderId: string;
  selectedSupplierId: string | null;
  validationStatus: ValidationStatus;
  explanation: string;
  recommendedSupplierId?: string;
  status?: "Draft" | "Blocked" | "Not eligible" | "Validated";
  validationReason?: string | null;
  validatedAt?: string | null;
};

export type AwardReceipt = {
  id: string;
  tenderId: string;
  supplierId?: string;
  supplierName?: string;
  awardValue?: number;
  currency?: string;
  awardedSupplierId: string;
  policyVersion: string;
  validationStatus?: string;
  issuedAt?: string;
  validationTimestamp: string;
  awardStatus: ValidationStatus.Validated;
  paymentStatus: PaymentStatus.ReadyForControlledRelease;
  policyIntegrity: "Confirmed";
};

export type AuditTimelineEvent = {
  id: string;
  label: string;
  title?: string;
  timestamp: string;
  description: string;
  actor?: string;
  eventType?: string;
};

export type AuditRecord = {
  id: string;
  tenderId: string;
  tenderTitle: string;
  organization: string;
  awardedSupplier: string;
  awardValue: number;
  awardStatus: string;
  validationStatus: ValidationStatus;
  policyLockStatus: string;
  auditCompleteness: string;
  validationDate: string;
  receiptId: string;
  paymentStatus: PaymentStatus;
  timeline: AuditTimelineEvent[];
};

export type Tender = {
  id: string;
  title: string;
  organization: string;
  category: string;
  summary: string;
  budget: number;
  currency: string;
  status: TenderStatus;
  deadline: string;
  deliveryDeadline?: string;
  policy: AwardPolicy;
  policyStatus?: PolicyStatus;
  policyVersion?: string;
  policyLockedAt?: string | null;
  policyCommitment?: string;
  supplierSubmissionIds: string[];
  paymentStatus: PaymentStatus;
  auditTimeline: AuditTimelineEvent[];
};
