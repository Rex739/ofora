import evidenceJson from "@/public/verification/ofora-testnet-evidence.json";

export type TestnetEvidence = typeof evidenceJson;

export const testnetEvidence: TestnetEvidence = evidenceJson;

export function shortenReference(value: string, lead = 8, tail = 6) {
  if (value.length <= lead + tail + 3) return value;
  return `${value.slice(0, lead)}...${value.slice(-tail)}`;
}

export function stellarExpertTxUrl(hash: string) {
  if (!isStellarTransactionHash(hash)) return null;
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}

export function stellarExpertContractUrl(contractId: string) {
  if (!isStellarContractId(contractId)) return null;
  return `https://stellar.expert/explorer/testnet/contract/${contractId}`;
}

export function isStellarTransactionHash(value: string) {
  return /^[a-f0-9]{64}$/i.test(value);
}

export function isStellarContractId(value: string) {
  return /^C[A-Z2-7]{55}$/.test(value);
}
