import { getVerificationMode } from "@/lib/stellar/config";
import { validateAwardOnStellar } from "@/lib/stellar/ofora-registry-client";

export type AwardValidationPhase =
  | "Preparing confidential validation"
  | "Generating validation proof"
  | "Submitting to Stellar testnet"
  | "Award independently validated"
  | "Verification failed";

export async function validateAwardWithConfiguredMode(input: {
  tenderId: string;
  selectedSupplierId: string;
  receiptId: string;
}) {
  const mode = getVerificationMode();
  if (mode === "mock") {
    return {
      mode,
      phase: "Award independently validated" as AwardValidationPhase,
      proofBacked: false
    };
  }

  const result = await validateAwardOnStellar(input);
  return {
    mode,
    phase: "Award independently validated" as AwardValidationPhase,
    proofBacked: true,
    result
  };
}
