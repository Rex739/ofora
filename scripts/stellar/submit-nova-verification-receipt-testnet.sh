#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_ofora-groth16-finalization.sh"
require_source_account
require_finalization_fixtures

verifier_id="$(canonical_value groth16ReceiptVerifierContractId)"

print_header
echo "Submitting Nova Groth16 verification receipt transaction..."
set +e
output="$(
  stellar contract invoke \
    --id "$verifier_id" \
    --source "$SOURCE_ACCOUNT" \
    --network "$NETWORK" \
    --send yes \
    -- \
    verify_and_record \
    --context_commitment-file-path "$ARTIFACT_DIR/soroban-public.bin" \
    --vk_bytes-file-path "$ARTIFACT_DIR/soroban-vk.bin" \
    --proof_bytes-file-path "$ARTIFACT_DIR/soroban-proof.bin" 2>&1
)"
status=$?
set -e
printf '%s\n' "$output"
write_command_artifact "$ARTIFACT_DIR/verification-receipt-transaction.json" "verificationReceipt" "$verifier_id" "$status" "$output"
if [[ "$status" -ne 0 ]]; then
  exit "$status"
fi

receipt_output="$(
  stellar contract invoke \
    --id "$verifier_id" \
    --source "$SOURCE_ACCOUNT" \
    --network "$NETWORK" \
    -- \
    get_verification_receipt \
    --context_commitment-file-path "$ARTIFACT_DIR/soroban-public.bin"
)"
node -e "const fs=require('fs'); fs.writeFileSync('$ARTIFACT_DIR/verification-receipt.json', JSON.stringify({network:'$NETWORK', verifierContractId:'$verifier_id', status:'verified', contextCommitmentFile:'soroban-public.bin', output:process.argv[1], recordedAt:new Date().toISOString()}, null, 2)+'\n')" "$receipt_output"
echo "Verification receipt recorded."
