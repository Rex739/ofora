import { AwardPolicy, EvaluationResult, SupplierSubmission } from "@/lib/types";

export function calculatePriceEfficiencyScore(price: number, lowestEligiblePrice: number) {
  return Math.min(100, (lowestEligiblePrice / price) * 100);
}

export function calculateDeliveryReliabilityScore(deliveryDays: number, maximumDeliveryDays: number) {
  return Math.max(0, Math.min(100, ((maximumDeliveryDays - deliveryDays + 1) / maximumDeliveryDays) * 100));
}

export function calculateStockScore(stockAvailability: number) {
  return Math.max(0, Math.min(100, stockAvailability));
}

export function calculateQualityScore(qualityScore: number) {
  return Math.max(0, Math.min(100, qualityScore));
}

export function calculateLocalSupplierContributionScore(localContributionScore: number) {
  return Math.max(0, Math.min(100, localContributionScore));
}

export function determineEligibility(submission: SupplierSubmission, policy: AwardPolicy) {
  if (submission.price > policy.budgetCeiling) {
    return { eligible: false, reason: "Price exceeds the budget ceiling defined in the locked policy." };
  }

  if (submission.deliveryDays > policy.maximumDeliveryDays) {
    return {
      eligible: false,
      reason: "Delivery time exceeds the 14-day maximum defined in the locked policy."
    };
  }

  if (submission.qualityScore < policy.minimumQualityScore) {
    return { eligible: false, reason: "Quality score is below the locked minimum threshold." };
  }

  return { eligible: true };
}

export function calculateTotalWeightedScore(scores: Omit<EvaluationResult, "supplierId" | "totalScore" | "eligible">, policy: AwardPolicy) {
  const byId = {
    price: scores.priceScore,
    delivery: scores.deliveryScore,
    stock: scores.stockScore,
    quality: scores.qualityScore,
    local: scores.localContributionScore
  };

  return policy.criteria.reduce((total, criterion) => {
    const score = byId[criterion.id as keyof typeof byId] ?? 0;
    return total + score * (criterion.weight / 100);
  }, 0);
}

export function evaluateSubmissions(submissionList: SupplierSubmission[], policy: AwardPolicy): EvaluationResult[] {
  const eligibleSubmissions = submissionList.filter((submission) => determineEligibility(submission, policy).eligible);
  const lowestEligiblePrice = Math.min(...eligibleSubmissions.map((submission) => submission.price));

  return submissionList.map((submission) => {
    const eligibility = determineEligibility(submission, policy);
    const priceScore = eligibility.eligible ? calculatePriceEfficiencyScore(submission.price, lowestEligiblePrice) : 0;
    const deliveryScore = calculateDeliveryReliabilityScore(submission.deliveryDays, policy.maximumDeliveryDays);
    const stockScore = calculateStockScore(submission.stockAvailability);
    const qualityScore = calculateQualityScore(submission.qualityScore);
    const localContributionScore = calculateLocalSupplierContributionScore(submission.localContributionScore);
    const totalScore = eligibility.eligible
      ? calculateTotalWeightedScore(
          { priceScore, deliveryScore, stockScore, qualityScore, localContributionScore, disqualificationReason: undefined },
          policy
        )
      : null;

    return {
      supplierId: submission.supplierId,
      priceScore,
      deliveryScore,
      stockScore,
      qualityScore,
      localContributionScore,
      totalScore,
      eligible: eligibility.eligible,
      disqualificationReason: eligibility.reason
    };
  });
}

export function identifyHighestScoringEligibleSupplier(results: EvaluationResult[]) {
  return results
    .filter((result) => result.eligible && result.totalScore !== null)
    .sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0))[0];
}
