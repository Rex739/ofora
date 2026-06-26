#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "../..");
const PUBLIC_DIR = path.join(ROOT_DIR, "artifacts/ofora-groth16-demo");
const PRIVATE_DIR = path.join(ROOT_DIR, "artifacts/private/ofora-groth16");

const FR_MODULUS = BigInt("0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001");
const C1 = 1315423911n;
const C2 = 2654435761n;
const C3 = 97n;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function fr(value) {
  const reduced = BigInt(value) % FR_MODULUS;
  return reduced >= 0n ? reduced : reduced + FR_MODULUS;
}

function hash2(a, b) {
  return fr(fr(a) * C1 + fr(b) * C2 + C3);
}

function fold(values) {
  let current = hash2(values[0], values[1]);
  for (let index = 2; index < values.length; index += 1) {
    current = hash2(current, values[index]);
  }
  return current;
}

function fieldBytes(value) {
  const out = Buffer.alloc(32);
  let n = fr(value);
  for (let i = 31; i >= 0; i -= 1) {
    out[i] = Number(n & 255n);
    n >>= 8n;
  }
  return out;
}

const publicContextPath = path.join(PUBLIC_DIR, "public-context.json");
const publicContext = readJson(publicContextPath);
const novaInput = readJson(path.join(PRIVATE_DIR, "nova-input.json"));

const tenderRef = novaInput.tenderRef;
const policyVersion = novaInput.policyVersion;
const receiptNonce = novaInput.receiptNonce;
const bidCommitments = publicContext.bidCommitments.map(fr);
const policyCommitment = fr(publicContext.policyCommitment);

function verificationContextFor(selectedSupplierIndex) {
  return fold([
    3001,
    selectedSupplierIndex,
    tenderRef,
    receiptNonce,
    policyVersion,
    policyCommitment,
    bidCommitments[0],
    bidCommitments[1],
    bidCommitments[2],
    bidCommitments[selectedSupplierIndex],
  ]);
}

const fixtureValues = {
  "groth16-policy-commitment.bin": policyCommitment,
  "groth16-atlas-bid-commitment.bin": bidCommitments[0],
  "groth16-nova-bid-commitment.bin": bidCommitments[1],
  "groth16-meridian-bid-commitment.bin": bidCommitments[2],
  "groth16-selected-bid-commitment.bin": bidCommitments[1],
  "groth16-receipt-nonce.bin": receiptNonce,
  "groth16-verification-context-commitment.bin": verificationContextFor(1),
  "groth16-atlas-verification-context-commitment.bin": verificationContextFor(0),
  "groth16-meridian-verification-context-commitment.bin": verificationContextFor(2),
};

for (const [name, value] of Object.entries(fixtureValues)) {
  fs.writeFileSync(path.join(PUBLIC_DIR, name), fieldBytes(value));
}

const enrichedContext = {
  ...publicContext,
  tenderRef,
  receiptNonce,
  policyVersion,
  fieldEncoding: "bls12-381-fr-32-byte-big-endian",
  reducedVerificationContextCommitment: fr(verificationContextFor(1)).toString(),
  rejectionContexts: {
    atlas: fr(verificationContextFor(0)).toString(),
    meridian: fr(verificationContextFor(2)).toString(),
  },
};
fs.writeFileSync(publicContextPath, `${JSON.stringify(enrichedContext, null, 2)}\n`);

console.log("Exported Groth16 registry finalization fixtures");
