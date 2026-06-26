#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "../..");
const PRIVATE_DIR = path.join(ROOT_DIR, "artifacts/private/ofora-groth16");
const PUBLIC_DIR = path.join(ROOT_DIR, "artifacts/ofora-groth16-demo");
fs.mkdirSync(PRIVATE_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_DIR, { recursive: true });

const caseName = process.argv[2] || "nova";
const selectedByCase = { atlas: 0, nova: 1, meridian: 2 };
if (!(caseName in selectedByCase)) {
  throw new Error(`Unknown Groth16 input case: ${caseName}`);
}

const C1 = 1315423911n;
const C2 = 2654435761n;
const C3 = 97n;

function hash2(a, b) {
  return BigInt(a) * C1 + BigInt(b) * C2 + C3;
}

function fold(values) {
  let cur = hash2(values[0], values[1]);
  for (let i = 2; i < values.length; i += 1) cur = hash2(cur, values[i]);
  return cur;
}

function salt() {
  return BigInt(`0x${crypto.randomBytes(16).toString("hex")}`).toString();
}

const policy = {
  tenderRef: "2026041",
  policyVersion: "1",
  priceWeight: 35,
  deliveryWeight: 25,
  stockWeight: 15,
  qualityWeight: 20,
  localWeight: 5,
  minimumQuality: 80,
  maximumDeliveryDays: 14,
  budgetCeiling: 250000
};

const suppliers = [
  { supplierRef: "1", price: 222000, deliveryDays: 11, stockAvailability: 82, qualityRating: 88, localContribution: 76 },
  { supplierRef: "2", price: 215000, deliveryDays: 9, stockAvailability: 96, qualityRating: 94, localContribution: 84 },
  { supplierRef: "3", price: 207000, deliveryDays: 18, stockAvailability: 91, qualityRating: 86, localContribution: 72 }
].map((supplier) => ({ ...supplier, salt: salt() }));

function eligible(supplier) {
  return supplier.price <= policy.budgetCeiling
    && supplier.deliveryDays <= policy.maximumDeliveryDays
    && supplier.qualityRating >= policy.minimumQuality;
}

const lowestEligiblePrice = Math.min(...suppliers.filter(eligible).map((supplier) => supplier.price));

function divParts(num, den) {
  const q = Math.floor(num / den);
  return { quotient: q, remainder: num - q * den };
}

function scoreParts(supplier) {
  const price = divParts(lowestEligiblePrice * 10000, supplier.price);
  const delivery = divParts((policy.maximumDeliveryDays - supplier.deliveryDays + 1) * 10000, policy.maximumDeliveryDays);
  const score = price.quotient * policy.priceWeight
    + delivery.quotient * policy.deliveryWeight
    + supplier.stockAvailability * 100 * policy.stockWeight
    + supplier.qualityRating * 100 * policy.qualityWeight
    + supplier.localContribution * 100 * policy.localWeight;
  return { price, delivery, score };
}

const policyCommitment = fold([
  1001,
  policy.tenderRef,
  policy.priceWeight,
  policy.deliveryWeight,
  policy.stockWeight,
  policy.qualityWeight,
  policy.localWeight,
  policy.minimumQuality,
  policy.maximumDeliveryDays,
  policy.budgetCeiling,
  policy.policyVersion
]);

const bidCommitments = suppliers.map((supplier) => fold([
  2001,
  policy.tenderRef,
  supplier.supplierRef,
  supplier.price,
  supplier.deliveryDays,
  supplier.stockAvailability,
  supplier.qualityRating,
  supplier.localContribution,
  supplier.salt
]));

const selectedSupplierIndex = selectedByCase[caseName];
const selectedBidCommitment = bidCommitments[selectedSupplierIndex];
const receiptNonce = BigInt(`0x${crypto.randomBytes(16).toString("hex")}`).toString();
const verificationContextCommitment = fold([
  3001,
  selectedSupplierIndex,
  policy.tenderRef,
  receiptNonce,
  policy.policyVersion,
  policyCommitment,
  bidCommitments[0],
  bidCommitments[1],
  bidCommitments[2],
  selectedBidCommitment
]);

const scores = suppliers.map(scoreParts);
const input = {
  verificationContextCommitment: verificationContextCommitment.toString(),
  selectedSupplierIndex: selectedSupplierIndex.toString(),
  tenderRef: policy.tenderRef,
  receiptNonce,
  policyVersion: policy.policyVersion,
  priceWeight: policy.priceWeight.toString(),
  deliveryWeight: policy.deliveryWeight.toString(),
  stockWeight: policy.stockWeight.toString(),
  qualityWeight: policy.qualityWeight.toString(),
  localWeight: policy.localWeight.toString(),
  minimumQuality: policy.minimumQuality.toString(),
  maximumDeliveryDays: policy.maximumDeliveryDays.toString(),
  budgetCeiling: policy.budgetCeiling.toString(),
  supplierRef: suppliers.map((supplier) => supplier.supplierRef),
  price: suppliers.map((supplier) => supplier.price.toString()),
  deliveryDays: suppliers.map((supplier) => supplier.deliveryDays.toString()),
  stockAvailability: suppliers.map((supplier) => supplier.stockAvailability.toString()),
  qualityRating: suppliers.map((supplier) => supplier.qualityRating.toString()),
  localContribution: suppliers.map((supplier) => supplier.localContribution.toString()),
  salt: suppliers.map((supplier) => supplier.salt),
  lowestEligiblePrice: lowestEligiblePrice.toString(),
  priceQuotient: scores.map(({ price }) => price.quotient.toString()),
  priceRemainder: scores.map(({ price }) => price.remainder.toString()),
  deliveryQuotient: scores.map(({ delivery }) => delivery.quotient.toString()),
  deliveryRemainder: scores.map(({ delivery }) => delivery.remainder.toString()),
  selectionFlags: ["0", "0", "0"]
};
input.selectionFlags[selectedSupplierIndex] = "1";

const privatePath = path.join(PRIVATE_DIR, `${caseName}-input.json`);
fs.writeFileSync(privatePath, `${JSON.stringify(input, null, 2)}\n`);

if (caseName === "nova") {
  const publicSummary = {
    curve: "bls12381",
    publicInputs: ["verificationContextCommitment"],
    verificationContextCommitment: verificationContextCommitment.toString(),
    policyCommitment: policyCommitment.toString(),
    bidCommitments: bidCommitments.map((value) => value.toString()),
    selectedSupplierIndex,
    selectedBidCommitment: selectedBidCommitment.toString(),
    ranking: suppliers.map((supplier, index) => ({
      index,
      eligible: eligible(supplier),
      score: scores[index].score
    }))
  };
  fs.writeFileSync(path.join(PUBLIC_DIR, "public-context.json"), `${JSON.stringify(publicSummary, null, 2)}\n`);
}

console.log(privatePath);
