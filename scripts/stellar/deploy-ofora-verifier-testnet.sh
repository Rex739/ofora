#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_ofora-testnet.sh"
require_source_account
require_file "$PROOF_DIR/vk"

print_header
echo "Deploying generated Ofora verifier..."
contract_id="$(
  stellar contract deploy \
    --wasm "$ROOT_DIR/contracts/generated-ofora-verifier/target/wasm32v1-none/release/generated_ofora_verifier.wasm" \
    --source "$SOURCE_ACCOUNT" \
    --network "$NETWORK" \
    -- \
    --vk_bytes-file-path "$PROOF_DIR/vk"
)"
write_contract_id "verifierContractId" "$contract_id"
echo "Verifier contract ID: $contract_id"

