import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Policy = {
  tenderRef: string;
  priceWeight: number;
  deliveryWeight: number;
  stockWeight: number;
  qualityWeight: number;
  localWeight: number;
  minimumQuality: number;
  maximumDeliveryDays: number;
  budgetCeiling: number;
  policyVersion: string;
};

type Bid = {
  tenderRef: string;
  supplierRef: string;
  price: number;
  deliveryDays: number;
  stockAvailability: number;
  qualityRating: number;
  localContribution: number;
  saltNotice: "private";
};

const policy: Policy = {
  tenderRef: "OFR-2026-041",
  priceWeight: 35,
  deliveryWeight: 25,
  stockWeight: 20,
  qualityWeight: 10,
  localWeight: 10,
  minimumQuality: 75,
  maximumDeliveryDays: 14,
  budgetCeiling: 10000,
  policyVersion: "1"
};

const bids: Bid[] = [
  { tenderRef: policy.tenderRef, supplierRef: "sup-atlas", price: 8900, deliveryDays: 9, stockAvailability: 100, qualityRating: 82, localContribution: 70, saltNotice: "private" },
  { tenderRef: policy.tenderRef, supplierRef: "sup-nova", price: 9400, deliveryDays: 7, stockAvailability: 100, qualityRating: 91, localContribution: 88, saltNotice: "private" },
  { tenderRef: policy.tenderRef, supplierRef: "sup-meridian", price: 8100, deliveryDays: 18, stockAvailability: 100, qualityRating: 80, localContribution: 60, saltNotice: "private" }
];

function commitment(label: string, values: Array<string | number>) {
  // This is a deterministic public artifact helper only. The final ZK witness
  // generator must use the same Poseidon/Poseidon2 encoding as the Noir circuit
  // and Soroban verifier once that toolchain is installed.
  return `sha256:${createHash("sha256").update(JSON.stringify([label, ...values])).digest("hex")}`;
}

const outDir = join(process.cwd(), "artifacts/ofora-demo");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "policy.json"), `${JSON.stringify(policy, null, 2)}\n`);
writeFileSync(
  join(outDir, "commitments.json"),
  `${JSON.stringify(
    {
      warning: "Do not use these SHA-256 helper commitments as final ZK commitments. They are non-secret public demo metadata until Poseidon2 artifacts are generated.",
      policyCommitment: commitment("policy", Object.values(policy)),
      bidCommitments: bids.map((bid) => ({
        supplierRef: bid.supplierRef,
        commitment: commitment("bid", [bid.tenderRef, bid.supplierRef, bid.price, bid.deliveryDays, bid.stockAvailability, bid.qualityRating, bid.localContribution, "salt:private"])
      }))
    },
    null,
    2
  )}\n`
);
console.log(`Wrote non-sensitive commitment metadata to ${outDir}`);
