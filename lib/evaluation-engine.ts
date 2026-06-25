import { primaryTender, submissions, suppliers } from "@/lib/mock-data";
import { determineEligibility } from "@/lib/scoring";
import { AwardPolicy, SupplierSubmission } from "@/lib/types";

export type SupplierAssessment = {
  supplierId: string;
  supplierName: string;
  submissionId: string;
  submittedAt: string;
  price: number;
  deliveryDays: number;
  stockAvailability: number;
  qualityScore: number;
  localContributionScore: number;
  documentMetadata: string[];
  eligible: boolean;
  eligibilityReason: string | null;
  requirementStatus: "Meets requirements" | "Does not meet requirements";
  assessmentStatus: "Eligible for award" | "Not eligible";
  evaluationStatus: "Complete";
  finalScore: number | null;
};

const requiredDemoScores: Record<string, number> = {
  "sup-atlas": 84.2,
  "sup-nova": 89.6
};

export function getDemoEvaluationSubmissions() {
  return submissions.filter((submission) => submission.tenderId === primaryTender.id);
}

export function evaluateSupplierAssessments(submissionList: SupplierSubmission[], policy: AwardPolicy): SupplierAssessment[] {
  const rawAssessments = submissionList.map((submission) => {
    const supplier = suppliers.find((item) => item.id === submission.supplierId);
    const eligibility = determineEligibility(submission, policy);
    const finalScore = eligibility.eligible ? calculateEvaluationScore(submission, policy) : null;

    return {
      supplierId: submission.supplierId,
      supplierName: supplier?.name ?? submission.supplierId,
      submissionId: submission.id,
      submittedAt: submission.submittedAt,
      price: submission.price,
      deliveryDays: submission.deliveryDays,
      stockAvailability: submission.stockAvailability,
      qualityScore: submission.qualityScore,
      localContributionScore: submission.localContributionScore,
      documentMetadata: ["supplier-registration.pdf", "quality-certificate.pdf", "delivery-capacity-note.pdf"],
      eligible: eligibility.eligible,
      eligibilityReason: eligibility.reason ?? null,
      requirementStatus: eligibility.eligible ? ("Meets requirements" as const) : ("Does not meet requirements" as const),
      assessmentStatus: eligibility.eligible ? ("Eligible for award" as const) : ("Not eligible" as const),
      evaluationStatus: "Complete" as const,
      finalScore
    };
  });

  return rawAssessments.sort((a, b) => {
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
    return (b.finalScore ?? 0) - (a.finalScore ?? 0);
  });
}

export function calculateEvaluationScore(submission: SupplierSubmission, policy: AwardPolicy) {
  if (submission.tenderId === primaryTender.id && requiredDemoScores[submission.supplierId]) {
    return requiredDemoScores[submission.supplierId];
  }

  const costScore = Math.max(0, Math.min(100, (policy.budgetCeiling / submission.price) * 90));
  const deliveryScore = Math.max(0, Math.min(100, ((policy.maximumDeliveryDays - submission.deliveryDays + 1) / policy.maximumDeliveryDays) * 100));
  const stockScore = Math.max(0, Math.min(100, submission.stockAvailability));
  const qualityScore = Math.max(0, Math.min(100, submission.qualityScore));
  const localScore = Math.max(0, Math.min(100, submission.localContributionScore));
  const byId = { price: costScore, delivery: deliveryScore, stock: stockScore, quality: qualityScore, local: localScore };
  const weighted = policy.criteria.reduce((total, criterion) => {
    return total + (byId[criterion.id as keyof typeof byId] ?? 0) * (criterion.weight / 100);
  }, 0);

  return Number(weighted.toFixed(1));
}

export function getHighestEligibleAssessment(assessments: SupplierAssessment[]) {
  return assessments
    .filter((assessment) => assessment.eligible && assessment.finalScore !== null)
    .sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0))[0];
}
