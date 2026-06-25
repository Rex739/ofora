import { StoredAwardReceipt } from "@/lib/award-store";
import { PaymentStatus } from "@/lib/types";

export function createFairAwardReceipt(input: {
  tenderId: string;
  supplierId: string;
  supplierName: string;
  awardValue: number;
  currency: string;
  policyVersion: string;
  issuedAt?: string;
}): StoredAwardReceipt {
  return {
    id: `FAR-${input.tenderId}-001`,
    tenderId: input.tenderId,
    supplierId: input.supplierId,
    supplierName: input.supplierName,
    awardValue: input.awardValue,
    currency: input.currency,
    policyVersion: input.policyVersion,
    validationStatus: "Award validated",
    paymentStatus: PaymentStatus.ReadyForControlledRelease,
    issuedAt: input.issuedAt ?? new Date().toISOString()
  };
}
