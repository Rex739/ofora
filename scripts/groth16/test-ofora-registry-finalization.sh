#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "Exporting public-safe Groth16 finalization fixtures..."
node scripts/groth16/export-registry-finalization-fixtures.js

echo "Checking fixture binding to Nova's verified public signal..."
cmp artifacts/ofora-groth16-demo/soroban-public.bin \
  artifacts/ofora-groth16-demo/groth16-verification-context-commitment.bin

echo "Running receipt verifier tests..."
cargo test --offline --manifest-path contracts/generated-ofora-groth16-verifier/Cargo.toml

echo "Running registry finalization tests..."
cargo test --offline --manifest-path contracts/ofora-registry/Cargo.toml

echo "Ofora Groth16 registry finalization local checks passed."
