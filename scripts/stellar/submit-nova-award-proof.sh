#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_ofora-testnet.sh"
require_source_account
split_public_inputs
require_file "$PROOF_DIR/proof"
require_file "$PROOF_DIR/public_inputs"

registry_id="$(contract_id_json_value registryContractId)"
admin_address="$(stellar keys address "$SOURCE_ACCOUNT")"
public_input_size="$(wc -c < "$PROOF_DIR/public_inputs" | tr -d ' ')"

if [[ "$public_input_size" != "288" ]]; then
  node -e "const fs=require('fs'); fs.writeFileSync('$ARTIFACT_DIR/registry-finalization-transaction.json', JSON.stringify({ network:'$NETWORK', registryContractId:'$registry_id', status:'not-submitted', reason:'Current compressed proof exposes one 32-byte verification context commitment. The deployed registry path is the original nine-public-input validation path, and direct compressed verifier simulation still exceeds testnet budget.' }, null, 2)+'\n');"
  echo "Registry validation not submitted: compressed proof has $public_input_size-byte public input encoding, while the deployed registry path expects 288 bytes." >&2
  exit 1
fi

print_header
echo "Submitting Nova award proof..."
set +e
output="$(
  stellar contract invoke \
    --id "$registry_id" \
    --source "$SOURCE_ACCOUNT" \
    --network "$NETWORK" \
    --send yes \
    -- \
    validate_award \
    --admin "$admin_address" \
    --tender_id "$TENDER_REFERENCE" \
    --selected_bid_commitment-file-path "$ARTIFACT_DIR/fields/selected-bid-commitment.bin" \
    --receipt_id "$RECEIPT_ID" \
    --receipt_nonce-file-path "$ARTIFACT_DIR/fields/receipt-nonce.bin" \
    --proof-file-path "$PROOF_DIR/proof" \
    --public_inputs-file-path "$PROOF_DIR/public_inputs" 2>&1
)"
status=$?
set -e
printf '%s\n' "$output"
if [[ "$status" -ne 0 ]]; then
  echo "Nova award validation failed; no transaction artifact written." >&2
  exit "$status"
fi

node -e "const fs=require('fs'); const out=process.argv[1]; fs.writeFileSync('$ARTIFACT_DIR/validation-transaction.json', JSON.stringify({ network:'$NETWORK', tenderReference:'$TENDER_REFERENCE', receiptId:'$RECEIPT_ID', rawOutput: out }, null, 2)+'\n');" "$output"
