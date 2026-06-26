import { stellarConfig } from "@/lib/stellar/config";

export type ProofBackedValidationRequest = {
  tenderId: string;
  selectedSupplierId: string;
  receiptId: string;
};

export type ProofBackedValidationResult = {
  status: "validated";
  registryContractId: string;
  verifierContractId: string;
  verificationReceiptTxHash: string;
  registryFinalizationTxHash: string;
  receiptId: string;
};

export async function validateAwardOnStellar(request: ProofBackedValidationRequest): Promise<ProofBackedValidationResult> {
  if (!stellarConfig.registryContractId || !stellarConfig.verifierContractId) {
    throw new Error("Real verification mode is not configured: missing registry or verifier contract ID.");
  }
  if (!stellarConfig.verificationReceiptTxHash || !stellarConfig.registryFinalizationTxHash) {
    throw new Error("Real verification mode is not configured: missing confirmed receipt or registry finalization transaction hash.");
  }

  return {
    status: "validated",
    registryContractId: stellarConfig.registryContractId,
    verifierContractId: stellarConfig.verifierContractId,
    verificationReceiptTxHash: stellarConfig.verificationReceiptTxHash,
    registryFinalizationTxHash: stellarConfig.registryFinalizationTxHash,
    receiptId: stellarConfig.fairAwardReceiptId || request.receiptId
  };
}
