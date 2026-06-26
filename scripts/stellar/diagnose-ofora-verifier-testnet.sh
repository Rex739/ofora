#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_ofora-testnet.sh"
require_source_account
require_file "$PROOF_DIR/proof"
require_file "$PROOF_DIR/public_inputs"

verifier_id="$(contract_id_json_value verifierContractId)"
proof_size="$(wc -c < "$PROOF_DIR/proof" | tr -d ' ')"
public_input_size="$(wc -c < "$PROOF_DIR/public_inputs" | tr -d ' ')"
vk_size="$(wc -c < "$PROOF_DIR/vk" | tr -d ' ')"
public_input_count="$((public_input_size / 32))"

set +e
output="$(
  stellar contract invoke \
    --very-verbose \
    --cost \
    --send no \
    --id "$verifier_id" \
    --source "$SOURCE_ACCOUNT" \
    --network "$NETWORK" \
    -- \
    verify \
    --public_inputs-file-path "$PROOF_DIR/public_inputs" \
    --proof-file-path "$PROOF_DIR/proof" 2>&1
)"
status=$?
set -e

node -e "const fs=require('fs'); fs.writeFileSync('$ARTIFACT_DIR/direct-verifier-simulation.json', JSON.stringify({ network:'$NETWORK', verifierContractId:'$verifier_id', status:Number('$status'), proofSize:Number('$proof_size'), verificationKeySize:Number('$vk_size'), publicInputCount:Number('$public_input_count'), publicInputEncodingSize:Number('$public_input_size'), output:process.argv[1] }, null, 2)+'\n');" "$output"
printf '%s\n' "$output"
exit "$status"

