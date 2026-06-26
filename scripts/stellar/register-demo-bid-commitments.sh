#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_ofora-testnet.sh"
require_source_account
split_public_inputs

registry_id="$(contract_id_json_value registryContractId)"
admin_address="$(stellar keys address "$SOURCE_ACCOUNT")"

print_header
for item in atlas nova meridian; do
  field="$ARTIFACT_DIR/fields/${item}-bid-commitment.bin"
  echo "Registering $item commitment..."
  stellar contract invoke \
    --id "$registry_id" \
    --source "$SOURCE_ACCOUNT" \
    --network "$NETWORK" \
    --send yes \
    -- \
    register_bid_commitment \
    --admin "$admin_address" \
    --tender_id "$TENDER_REFERENCE" \
    --bid_commitment-file-path "$field"
done

stellar contract invoke --id "$registry_id" --source "$SOURCE_ACCOUNT" --network "$NETWORK" --send yes -- begin_evaluation --admin "$admin_address" --tender_id "$TENDER_REFERENCE"

