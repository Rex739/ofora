#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_ofora-testnet.sh"
require_source_account

registry_id="$(contract_id_json_value registryContractId)"

print_header
tender_output="$(stellar contract invoke --id "$registry_id" --source "$SOURCE_ACCOUNT" --network "$NETWORK" -- get_tender --tender_id "$TENDER_REFERENCE")"
receipt_output="$(stellar contract invoke --id "$registry_id" --source "$SOURCE_ACCOUNT" --network "$NETWORK" -- get_award_receipt --tender_id "$TENDER_REFERENCE")"
printf '%s\n' "$tender_output"
printf '%s\n' "$receipt_output"
node -e "const fs=require('fs'); fs.writeFileSync('$ARTIFACT_DIR/final-tender-record.json', JSON.stringify({ network:'$NETWORK', tenderReference:'$TENDER_REFERENCE', tender: process.argv[1], receipt: process.argv[2] }, null, 2)+'\n');" "$tender_output" "$receipt_output"

