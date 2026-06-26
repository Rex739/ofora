#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
NETWORK="${OFORA_STELLAR_NETWORK:-testnet}"
SOURCE_ACCOUNT="${OFORA_STELLAR_SOURCE_ACCOUNT:-}"
ARTIFACT_DIR="$ROOT_DIR/artifacts/ofora-groth16-demo"
WASM="$ROOT_DIR/contracts/generated-ofora-groth16-verifier/target/wasm32v1-none/release/generated_ofora_groth16_verifier.wasm"

if [[ -z "$SOURCE_ACCOUNT" ]]; then
  echo "OFORA_STELLAR_SOURCE_ACCOUNT is required." >&2
  exit 1
fi
if [[ ! -f "$WASM" ]]; then
  echo "Verifier WASM missing. Run stellar contract build first." >&2
  exit 1
fi

contract_id="$(stellar contract deploy --wasm "$WASM" --source "$SOURCE_ACCOUNT" --network "$NETWORK")"
mkdir -p "$ARTIFACT_DIR"
node -e "const fs=require('fs'); fs.writeFileSync('$ARTIFACT_DIR/groth16-contract-id.json', JSON.stringify({network:'$NETWORK', verifierContractId:process.argv[1]}, null, 2)+'\n')" "$contract_id"
echo "$contract_id"

