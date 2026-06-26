export type OforaVerificationMode = "mock" | "real";

export function getVerificationMode(): OforaVerificationMode {
  const value = process.env.NEXT_PUBLIC_OFORA_VERIFICATION_MODE ?? "mock";
  if (value === "mock" || value === "real") return value;
  throw new Error(`Invalid NEXT_PUBLIC_OFORA_VERIFICATION_MODE: ${value}`);
}

export const stellarConfig = {
  network: process.env.OFORA_STELLAR_NETWORK ?? "testnet",
  registryContractId: process.env.OFORA_REGISTRY_CONTRACT_ID ?? "",
  verifierContractId: process.env.OFORA_VERIFIER_CONTRACT_ID ?? "",
  verificationReceiptTxHash: process.env.OFORA_VERIFICATION_RECEIPT_TX_HASH ?? "",
  registryFinalizationTxHash: process.env.OFORA_REGISTRY_FINALIZATION_TX_HASH ?? "",
  fairAwardReceiptId: process.env.OFORA_FAIR_AWARD_RECEIPT_ID ?? ""
};
