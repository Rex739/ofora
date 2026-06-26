#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT_DIR/scripts/zk/load-zk-env.sh"

PRIVATE_DIR="$ROOT_DIR/artifacts/private/ofora-award-proof"
PUBLIC_DIR="$ROOT_DIR/artifacts/ofora-zk-demo"
PROOF_DIR="$PUBLIC_DIR/nova-proof"

expect_failure() {
  local label="$1"
  shift
  set +e
  output="$("$@" 2>&1)"
  status=$?
  set -e
  if [[ "$status" -eq 0 ]]; then
    echo "FAILED: $label unexpectedly succeeded" >&2
    exit 1
  fi
  echo "PASS: $label rejected"
  echo "$output" > "$PRIVATE_DIR/${label// /-}.failure.log"
}

echo "==> Generate Poseidon2 commitments and private witnesses"
OFORA_ROOT="$ROOT_DIR" cargo run --manifest-path "$ROOT_DIR/scripts/zk/commitment-tool/Cargo.toml" >/dev/null

echo "==> Compile Ofora Noir circuit"
(
  cd "$ROOT_DIR/zk"
  nargo check
)

echo "==> Generate Nova witness"
cp "$PRIVATE_DIR/Prover.nova.toml" "$ROOT_DIR/zk/Prover.toml"
(
  cd "$ROOT_DIR/zk"
  nargo execute ofora_nova
)

echo "==> Generate Nova UltraHonk proof and verification key"
rm -rf "$PROOF_DIR"
mkdir -p "$PROOF_DIR"
bb prove \
  --scheme ultra_honk \
  --oracle_hash keccak \
  --output_format bytes_and_fields \
  -b "$ROOT_DIR/zk/target/ofora_award_validation.json" \
  -w "$ROOT_DIR/zk/target/ofora_nova.gz" \
  -o "$PROOF_DIR"
bb write_vk \
  --scheme ultra_honk \
  --oracle_hash keccak \
  --output_format bytes_and_fields \
  -b "$ROOT_DIR/zk/target/ofora_award_validation.json" \
  -o "$PROOF_DIR"

echo "==> Verify Nova proof locally"
bb verify \
  --scheme ultra_honk \
  --oracle_hash keccak \
  -k "$PROOF_DIR/vk" \
  -p "$PROOF_DIR/proof" \
  -i "$PROOF_DIR/public_inputs"

echo "==> Confirm Atlas cannot satisfy winner constraints"
cp "$PRIVATE_DIR/Prover.atlas.toml" "$ROOT_DIR/zk/Prover.toml"
expect_failure "atlas-winner-proof" bash -lc "source '$ROOT_DIR/scripts/zk/load-zk-env.sh' && cd '$ROOT_DIR/zk' && nargo execute ofora_atlas"

echo "==> Confirm Meridian cannot satisfy eligibility constraints"
cp "$PRIVATE_DIR/Prover.meridian.toml" "$ROOT_DIR/zk/Prover.toml"
expect_failure "meridian-winner-proof" bash -lc "source '$ROOT_DIR/scripts/zk/load-zk-env.sh' && cd '$ROOT_DIR/zk' && nargo execute ofora_meridian"

cp "$PRIVATE_DIR/Prover.nova.toml" "$ROOT_DIR/zk/Prover.toml"

echo
echo "Ofora award proof tests: PASS"
