import { submissions } from "@/lib/mock-data";
import { evaluateSubmissions, identifyHighestScoringEligibleSupplier } from "@/lib/scoring";
import { AwardDecision, AwardPolicy, PaymentStatus, ValidationStatus } from "@/lib/types";

export type ValidationProvider = {
  validateAward: (input: {
    tenderId: string;
    selectedSupplierId: string;
    policy: AwardPolicy;
  }) => AwardDecision;
};

export type ReceiptGenerator = {
  createReceipt: (input: { tenderId: string; awardedSupplierId: string; policyVersion: string }) => {
    id: string;
    tenderId: string;
    awardedSupplierId: string;
    policyVersion: string;
    validationTimestamp: string;
    awardStatus: ValidationStatus.Validated;
    paymentStatus: PaymentStatus.ReadyForControlledRelease;
    policyIntegrity: "Confirmed";
  };
};

export type PaymentReleaseStatusProvider = {
  getStatus: (validationStatus: ValidationStatus) => PaymentStatus;
};

export const localValidationProvider: ValidationProvider = {
  validateAward({ tenderId, selectedSupplierId, policy }) {
    const tenderSubmissions = submissions.filter((submission) => submission.tenderId === tenderId);
    const results = evaluateSubmissions(tenderSubmissions, policy);
    const winner = identifyHighestScoringEligibleSupplier(results);
    const selected = results.find((result) => result.supplierId === selectedSupplierId);

    if (!selected?.eligible) {
      return {
        tenderId,
        selectedSupplierId,
        validationStatus: ValidationStatus.NotValidated,
        explanation: selected?.disqualificationReason ?? "Selected supplier is not eligible under the locked policy.",
        recommendedSupplierId: winner?.supplierId
      };
    }

    if (winner?.supplierId !== selectedSupplierId) {
      return {
        tenderId,
        selectedSupplierId,
        validationStatus: ValidationStatus.NotValidated,
        explanation:
          "This supplier does not satisfy the highest valid score under the locked evaluation policy.",
        recommendedSupplierId: winner?.supplierId
      };
    }

    return {
      tenderId,
      selectedSupplierId,
      validationStatus: ValidationStatus.Validated,
      explanation:
        "This supplier has been independently confirmed as the highest-scoring eligible submission under the locked award policy."
    };
  }
};

export const localReceiptGenerator: ReceiptGenerator = {
  createReceipt({ tenderId, awardedSupplierId, policyVersion }) {
    return {
      id: `FAR-${tenderId}-001`,
      tenderId,
      awardedSupplierId,
      policyVersion,
      validationTimestamp: new Date("2026-06-25T08:40:00.000Z").toISOString(),
      awardStatus: ValidationStatus.Validated,
      paymentStatus: PaymentStatus.ReadyForControlledRelease,
      policyIntegrity: "Confirmed"
    };
  }
};

export const localPaymentReleaseStatusProvider: PaymentReleaseStatusProvider = {
  getStatus(validationStatus) {
    return validationStatus === ValidationStatus.Validated
      ? PaymentStatus.ReadyForControlledRelease
      : PaymentStatus.PendingValidation;
  }
};
