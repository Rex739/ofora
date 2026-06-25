#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT_DIR/scripts/zk/_tooling.sh"

require_zk_tooling

cd "$ROOT_DIR/zk"
nargo check
nargo execute ofora_award_validation
bb prove --scheme ultra_honk --oracle_hash keccak -b target/ofora_award_validation.json -w target/ofora_award_validation.gz -o "$ROOT_DIR/artifacts/ofora-demo"
bb write_vk --scheme ultra_honk --oracle_hash keccak -b target/ofora_award_validation.json -o "$ROOT_DIR/artifacts/ofora-demo"

echo "Generated proof and verification key under artifacts/ofora-demo"
