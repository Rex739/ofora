#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "../..");
const PUBLIC_DIR = path.join(ROOT_DIR, "artifacts/ofora-groth16-demo");

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(PUBLIC_DIR, name), "utf8"));
}

function fieldBytes(value, size) {
  const out = Buffer.alloc(size);
  let n = BigInt(value);
  for (let i = size - 1; i >= 0; i -= 1) {
    out[i] = Number(n & 255n);
    n >>= 8n;
  }
  if (n !== 0n) throw new Error(`value does not fit in ${size} bytes`);
  return out;
}

function g1(point) {
  return Buffer.concat([fieldBytes(point[0], 48), fieldBytes(point[1], 48)]);
}

function g2(point) {
  // Soroban BLS12-381 expects x_c1 || x_c0 || y_c1 || y_c0.
  return Buffer.concat([
    fieldBytes(point[0][1], 48),
    fieldBytes(point[0][0], 48),
    fieldBytes(point[1][1], 48),
    fieldBytes(point[1][0], 48)
  ]);
}

const vk = readJson("verification_key.json");
const proof = readJson("proof.json");
const publicSignals = readJson("public.json");

const vkBytes = Buffer.concat([
  g1(vk.vk_alpha_1),
  g2(vk.vk_beta_2),
  g2(vk.vk_gamma_2),
  g2(vk.vk_delta_2),
  g1(vk.IC[0]),
  g1(vk.IC[1])
]);
const proofBytes = Buffer.concat([
  g1(proof.pi_a),
  g2(proof.pi_b),
  g1(proof.pi_c)
]);
const publicBytes = Buffer.concat(publicSignals.map((value) => fieldBytes(value, 32)));

fs.writeFileSync(path.join(PUBLIC_DIR, "soroban-vk.bin"), vkBytes);
fs.writeFileSync(path.join(PUBLIC_DIR, "soroban-proof.bin"), proofBytes);
fs.writeFileSync(path.join(PUBLIC_DIR, "soroban-public.bin"), publicBytes);
fs.writeFileSync(path.join(PUBLIC_DIR, "soroban-inputs.json"), `${JSON.stringify({
  vkBytes: vkBytes.length,
  proofBytes: proofBytes.length,
  publicBytes: publicBytes.length,
  publicSignals
}, null, 2)}\n`);

console.log(`vk bytes: ${vkBytes.length}`);
console.log(`proof bytes: ${proofBytes.length}`);
console.log(`public bytes: ${publicBytes.length}`);
