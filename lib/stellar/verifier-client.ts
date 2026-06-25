export type VerifierArtifactStatus =
  | { ready: true; verifierContractId: string }
  | { ready: false; reason: string };

export function getVerifierArtifactStatus(): VerifierArtifactStatus {
  const verifierContractId = process.env.OFORA_VERIFIER_CONTRACT_ID;
  if (!verifierContractId) {
    return {
      ready: false,
      reason: "No generated UltraHonk verifier contract ID configured."
    };
  }
  return { ready: true, verifierContractId };
}
