#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_ofora-groth16-finalization.sh"

verifier_id="$(canonical_value groth16ReceiptVerifierContractId 2>/dev/null || true)"
registry_id="$(canonical_value registryContractId 2>/dev/null || true)"

node -e "
const fs = require('fs');
const dir = '$ARTIFACT_DIR';
function read(name) {
  const p = dir + '/' + name;
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
}
console.log(JSON.stringify({
  canonicalContractIds: read('canonical-contract-ids.json'),
  verifierRegistryConfiguration: read('verifier-registry-configuration.json'),
  verificationReceiptTransaction: read('verification-receipt-transaction.json'),
  verificationReceipt: read('verification-receipt.json'),
  registryFinalizationTransaction: read('registry-finalization-transaction.json'),
  fairAwardReceipt: read('fair-award-receipt.json'),
  finalTenderRecord: read('final-tender-record.json'),
  publicContext: read('public-context.json')
}, null, 2));
"

if [[ -n "$verifier_id" && -n "$SOURCE_ACCOUNT" ]]; then
  echo
  echo "Live verifier receipt:"
  stellar contract invoke \
    --id "$verifier_id" \
    --source "$SOURCE_ACCOUNT" \
    --network "$NETWORK" \
    -- \
    get_verification_receipt \
    --context_commitment-file-path "$ARTIFACT_DIR/soroban-public.bin" || true
fi

if [[ -n "$registry_id" && -n "$SOURCE_ACCOUNT" ]]; then
  echo
  echo "Live final tender:"
  stellar contract invoke \
    --id "$registry_id" \
    --source "$SOURCE_ACCOUNT" \
    --network "$NETWORK" \
    -- \
    get_tender \
    --tender_id "$TENDER_REFERENCE" || true

  echo
  echo "Live fair award receipt:"
  stellar contract invoke \
    --id "$registry_id" \
    --source "$SOURCE_ACCOUNT" \
    --network "$NETWORK" \
    -- \
    get_fair_award_receipt \
    --receipt_id "$RECEIPT_ID" || true
fi
