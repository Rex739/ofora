#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PUBLIC_DIR="$ROOT_DIR/artifacts/ofora-groth16-demo"
PRIVATE_DIR="$ROOT_DIR/artifacts/private/ofora-groth16"
SNARKJS="$ROOT_DIR/zk-groth16/node_modules/.bin/snarkjs"
WITNESS_CALC="$PUBLIC_DIR/ofora_award_js/generate_witness.js"

require_file() {
  if [[ ! -f "$1" ]]; then
    echo "Required file missing: $1" >&2
    exit 1
  fi
}

require_file "$PUBLIC_DIR/circuit.wasm"
require_file "$PRIVATE_DIR/ofora_award_final.zkey"
require_file "$PUBLIC_DIR/verification_key.json"

echo "==> Generate Nova Groth16 private input"
input_path="$(node "$ROOT_DIR/scripts/groth16/generate-input.js" nova)"

echo "==> Generate Nova witness"
node "$WITNESS_CALC" "$PUBLIC_DIR/circuit.wasm" "$input_path" "$PRIVATE_DIR/nova.wtns"

echo "==> Generate Nova Groth16 proof"
"$SNARKJS" groth16 prove "$PRIVATE_DIR/ofora_award_final.zkey" "$PRIVATE_DIR/nova.wtns" "$PUBLIC_DIR/proof.json" "$PUBLIC_DIR/public.json"

echo "==> Verify Nova proof locally"
"$SNARKJS" groth16 verify "$PUBLIC_DIR/verification_key.json" "$PUBLIC_DIR/public.json" "$PUBLIC_DIR/proof.json"

wc -c "$PUBLIC_DIR/proof.json" | awk '{print "proof json bytes: "$1}'
wc -c "$PUBLIC_DIR/public.json" | awk '{print "public json bytes: "$1}'

