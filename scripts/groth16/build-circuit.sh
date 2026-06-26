#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
GROTH_DIR="$ROOT_DIR/zk-groth16"
PUBLIC_DIR="$ROOT_DIR/artifacts/ofora-groth16-demo"
PRIVATE_DIR="$ROOT_DIR/artifacts/private/ofora-groth16"
SNARKJS="$GROTH_DIR/node_modules/.bin/snarkjs"

mkdir -p "$PUBLIC_DIR" "$PRIVATE_DIR"

echo "==> Compile Ofora Groth16 circuit"
circom "$GROTH_DIR/circuits/ofora_award.circom" \
  --prime bls12381 \
  --r1cs \
  --wasm \
  --sym \
  --output "$PUBLIC_DIR"

cp "$PUBLIC_DIR/ofora_award.r1cs" "$PUBLIC_DIR/circuit.r1cs"
cp "$PUBLIC_DIR/ofora_award_js/ofora_award.wasm" "$PUBLIC_DIR/circuit.wasm"

echo "==> Create local development Powers of Tau"
"$SNARKJS" powersoftau new bls12381 10 "$PRIVATE_DIR/pot10_0000.ptau"
printf '%s\n' "$(openssl rand -hex 32)" | "$SNARKJS" powersoftau contribute "$PRIVATE_DIR/pot10_0000.ptau" "$PRIVATE_DIR/pot10_0001.ptau" \
  --name="Ofora local dev contribution"
"$SNARKJS" powersoftau prepare phase2 "$PRIVATE_DIR/pot10_0001.ptau" "$PRIVATE_DIR/pot10_final.ptau"

echo "==> Run circuit-specific Groth16 setup"
"$SNARKJS" groth16 setup "$PUBLIC_DIR/ofora_award.r1cs" "$PRIVATE_DIR/pot10_final.ptau" "$PRIVATE_DIR/ofora_award_0000.zkey"
printf '%s\n' "$(openssl rand -hex 32)" | "$SNARKJS" zkey contribute "$PRIVATE_DIR/ofora_award_0000.zkey" "$PRIVATE_DIR/ofora_award_final.zkey" \
  --name="Ofora local circuit contribution"
"$SNARKJS" zkey export verificationkey "$PRIVATE_DIR/ofora_award_final.zkey" "$PUBLIC_DIR/verification_key.json"

wc -c "$PUBLIC_DIR/circuit.wasm" | awk '{print "circuit wasm bytes: "$1}'
wc -c "$PUBLIC_DIR/verification_key.json" | awk '{print "verification key json bytes: "$1}'
