#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT_DIR/scripts/zk/_tooling.sh"

require_stellar_tooling

if [[ ! -f "$ROOT_DIR/artifacts/ofora-demo/vk" ]]; then
  echo "Missing artifacts/ofora-demo/vk. Generate Noir/Barretenberg artifacts first." >&2
  exit 1
fi

echo "Build registry contract"
stellar contract build --manifest-path "$ROOT_DIR/contracts/ofora-registry/Cargo.toml"

echo "Deploy the generated UltraHonk verifier first using generated-verifier/README.md."
echo "Then deploy ofora-registry with stellar contract deploy and initialize it with the verifier contract ID."
echo "This script intentionally does not fabricate a verifier contract ID."
