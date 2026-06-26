#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT_DIR/scripts/zk/_tooling.sh"

require_zk_tooling

OFORA_ROOT="$ROOT_DIR" cargo run --manifest-path "$ROOT_DIR/scripts/zk/commitment-tool/Cargo.toml"
cp "$ROOT_DIR/artifacts/private/ofora-award-proof/Prover.nova.toml" "$ROOT_DIR/zk/Prover.toml"

cd "$ROOT_DIR/zk"
nargo check
nargo execute ofora_nova
mkdir -p "$ROOT_DIR/artifacts/ofora-zk-demo/nova-proof"
bb prove --scheme ultra_honk --oracle_hash keccak --output_format bytes_and_fields -b target/ofora_award_validation.json -w target/ofora_nova.gz -o "$ROOT_DIR/artifacts/ofora-zk-demo/nova-proof"
bb write_vk --scheme ultra_honk --oracle_hash keccak --output_format bytes_and_fields -b target/ofora_award_validation.json -o "$ROOT_DIR/artifacts/ofora-zk-demo/nova-proof"

echo "Generated Nova proof and verification key under artifacts/ofora-zk-demo/nova-proof"
