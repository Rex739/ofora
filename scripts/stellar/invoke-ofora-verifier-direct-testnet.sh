#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_ofora-testnet.sh"
require_source_account
require_file "$PROOF_DIR/proof"
require_file "$PROOF_DIR/public_inputs"

verifier_id="$(contract_id_json_value verifierContractId)"

set +e
output="$(
  stellar contract invoke \
    --cost \
    --send yes \
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
printf '%s\n' "$output"
if [[ "$status" -ne 0 ]]; then
  node -e "const fs=require('fs'); fs.writeFileSync('$ARTIFACT_DIR/direct-verifier-transaction.json', JSON.stringify({ network:'$NETWORK', verifierContractId:'$verifier_id', status:'failed', output:process.argv[1] }, null, 2)+'\n');" "$output"
  exit "$status"
fi
node -e "const fs=require('fs'); fs.writeFileSync('$ARTIFACT_DIR/direct-verifier-transaction.json', JSON.stringify({ network:'$NETWORK', verifierContractId:'$verifier_id', status:'submitted', rawOutput:process.argv[1] }, null, 2)+'\n');" "$output"

