#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_ofora-groth16-finalization.sh"
require_source_account

WASM="$ROOT_DIR/contracts/generated-ofora-groth16-verifier/target/wasm32v1-none/release/generated_ofora_groth16_verifier.wasm"
require_file "$WASM"

print_header
echo "Deploying proof receipt verifier..."
contract_id="$(stellar contract deploy --wasm "$WASM" --source "$SOURCE_ACCOUNT" --network "$NETWORK")"
write_canonical_value "groth16ReceiptVerifierContractId" "$contract_id"
write_canonical_value "groth16VerifierContractId" "$contract_id"
echo "Receipt verifier contract ID: $contract_id"
