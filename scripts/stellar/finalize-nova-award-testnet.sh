#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_ofora-groth16-finalization.sh"
require_source_account
require_finalization_fixtures

registry_id="$(canonical_value registryContractId)"
admin="$(admin_address)"

print_header
echo "Finalizing Nova award from consumed verification receipt..."
set +e
output="$(
  stellar contract invoke \
    --id "$registry_id" \
    --source "$SOURCE_ACCOUNT" \
    --network "$NETWORK" \
    --send yes \
    -- \
    finalize_award_from_verification \
    --admin "$admin" \
    --tender_id "$TENDER_REFERENCE" \
    --selected_supplier_index 1 \
    --selected_bid_commitment-file-path "$ARTIFACT_DIR/groth16-nova-bid-commitment.bin" \
    --receipt_id "$RECEIPT_ID" \
    --receipt_nonce-file-path "$ARTIFACT_DIR/groth16-receipt-nonce.bin" \
    --context_commitment-file-path "$ARTIFACT_DIR/soroban-public.bin" 2>&1
)"
status=$?
set -e
printf '%s\n' "$output"
write_command_artifact "$ARTIFACT_DIR/registry-finalization-transaction.json" "registryFinalization" "$registry_id" "$status" "$output"
if [[ "$status" -ne 0 ]]; then
  exit "$status"
fi

tender_output="$(
  stellar contract invoke \
    --id "$registry_id" \
    --source "$SOURCE_ACCOUNT" \
    --network "$NETWORK" \
    -- \
    get_tender \
    --tender_id "$TENDER_REFERENCE"
)"
fair_output="$(
  stellar contract invoke \
    --id "$registry_id" \
    --source "$SOURCE_ACCOUNT" \
    --network "$NETWORK" \
    -- \
    get_fair_award_receipt \
    --receipt_id "$RECEIPT_ID"
)"

node -e "const fs=require('fs'); fs.writeFileSync('$ARTIFACT_DIR/final-tender-record.json', JSON.stringify({network:'$NETWORK', registryContractId:'$registry_id', tenderId:'$TENDER_REFERENCE', status:'Validated', paymentStatus:'ReadyForControlledRelease', output:process.argv[1], recordedAt:new Date().toISOString()}, null, 2)+'\n')" "$tender_output"
node -e "const fs=require('fs'); fs.writeFileSync('$ARTIFACT_DIR/fair-award-receipt.json', JSON.stringify({network:'$NETWORK', registryContractId:'$registry_id', receiptId:'$RECEIPT_ID', tenderId:'$TENDER_REFERENCE', selectedSupplier:'Nova', selectedSupplierIndex:1, output:process.argv[1], recordedAt:new Date().toISOString()}, null, 2)+'\n')" "$fair_output"
echo "Nova award finalized."
