#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
NETWORK="${OFORA_STELLAR_NETWORK:-testnet}"
SOURCE_ACCOUNT="${OFORA_STELLAR_SOURCE_ACCOUNT:-}"
ARTIFACT_DIR="$ROOT_DIR/artifacts/ofora-groth16-demo"

if [[ -z "$SOURCE_ACCOUNT" ]]; then
  echo "OFORA_STELLAR_SOURCE_ACCOUNT is required." >&2
  exit 1
fi

contract_id="${OFORA_GROTH16_VERIFIER_ID:-}"
if [[ -z "$contract_id" && -f "$ARTIFACT_DIR/groth16-contract-id.json" ]]; then
  contract_id="$(node -e "console.log(JSON.parse(require('fs').readFileSync('$ARTIFACT_DIR/groth16-contract-id.json','utf8')).verifierContractId)")"
fi
if [[ -z "$contract_id" ]]; then
  echo "OFORA_GROTH16_VERIFIER_ID or groth16-contract-id.json is required." >&2
  exit 1
fi

set +e
output="$(
  stellar contract invoke \
    --very-verbose \
    --cost \
    --send no \
    --id "$contract_id" \
    --source "$SOURCE_ACCOUNT" \
    --network "$NETWORK" \
    -- \
    verify \
    --vk_bytes-file-path "$ARTIFACT_DIR/soroban-vk.bin" \
    --proof_bytes-file-path "$ARTIFACT_DIR/soroban-proof.bin" \
    --public_signal_bytes-file-path "$ARTIFACT_DIR/soroban-public.bin" 2>&1
)"
status=$?
set -e
printf '%s\n' "$output"
node -e "const fs=require('fs'); fs.writeFileSync('$ARTIFACT_DIR/groth16-direct-simulation.json', JSON.stringify({network:'$NETWORK', verifierContractId:'$contract_id', status:Number(process.argv[1]), output:process.argv[2]}, null, 2)+'\n')" "$status" "$output"
exit "$status"

