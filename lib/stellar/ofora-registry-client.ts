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
  transactionHash: string;
  receiptId: string;
};

export async function validateAwardOnStellar(request: ProofBackedValidationRequest): Promise<ProofBackedValidationResult> {
  if (!stellarConfig.registryContractId || !stellarConfig.verifierContractId) {
    throw new Error("Real verification mode is not configured: missing registry or verifier contract ID.");
  }

  throw new Error(
    `Real Stellar validation is not wired yet for ${request.tenderId}/${request.receiptId}. Generate the Noir proof, deploy the UltraHonk verifier, and implement the server-side submit route before enabling real mode.`
  );
}
