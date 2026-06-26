import evidenceJson from "@/public/verification/ofora-testnet-evidence.json";

export type TestnetEvidence = typeof evidenceJson;

export const testnetEvidence: TestnetEvidence = evidenceJson;

export function shortenReference(value: string, lead = 8, tail = 6) {
  if (value.length <= lead + tail + 3) return value;
  return `${value.slice(0, lead)}...${value.slice(-tail)}`;
}

export function stellarExpertTxUrl(hash: string) {
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}
