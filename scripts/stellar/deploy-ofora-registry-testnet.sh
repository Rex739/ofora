#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_ofora-testnet.sh"
require_source_account

print_header
echo "Deploying Ofora registry..."
contract_id="$(
  stellar contract deploy \
    --wasm "$ROOT_DIR/contracts/ofora-registry/target/wasm32v1-none/release/ofora_registry.wasm" \
    --source "$SOURCE_ACCOUNT" \
    --network "$NETWORK"
)"
write_contract_id "registryContractId" "$contract_id"
echo "Registry contract ID: $contract_id"

