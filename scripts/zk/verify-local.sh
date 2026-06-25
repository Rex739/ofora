#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT_DIR/scripts/zk/_tooling.sh"

require_zk_tooling

bb verify \
  --scheme ultra_honk \
  --oracle_hash keccak \
  -k "$ROOT_DIR/artifacts/ofora-demo/vk" \
  -p "$ROOT_DIR/artifacts/ofora-demo/proof" \
  -i "$ROOT_DIR/artifacts/ofora-demo/public_inputs"
