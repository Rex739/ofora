#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PUBLIC_DIR="$ROOT_DIR/artifacts/ofora-groth16-demo"
PRIVATE_DIR="$ROOT_DIR/artifacts/private/ofora-groth16"
WITNESS_CALC="$PUBLIC_DIR/ofora_award_js/generate_witness.js"

run_negative() {
  local name="$1"
  echo "==> Confirm $name witness is rejected"
  local input_path
  input_path="$(node "$ROOT_DIR/scripts/groth16/generate-input.js" "$name")"
  set +e
  node "$WITNESS_CALC" "$PUBLIC_DIR/circuit.wasm" "$input_path" "$PRIVATE_DIR/$name.wtns" >"$PRIVATE_DIR/$name-negative.log" 2>&1
  local status=$?
  set -e
  if [[ "$status" -eq 0 ]]; then
    echo "FAIL: $name witness unexpectedly satisfied the circuit" >&2
    exit 1
  fi
  echo "PASS: $name witness rejected"
}

run_negative atlas
run_negative meridian

