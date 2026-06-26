#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_ofora-testnet.sh"
require_source_account
split_public_inputs

registry_id="$(contract_id_json_value registryContractId)"
verifier_id="$(contract_id_json_value verifierContractId)"
admin_address="$(stellar keys address "$SOURCE_ACCOUNT")"

print_header
stellar contract invoke \
  --id "$registry_id" \
  --source "$SOURCE_ACCOUNT" \
  --network "$NETWORK" \
  --send yes \
  -- \
  initialize_tender \
  --admin "$admin_address" \
  --tender_id "$TENDER_REFERENCE" \
  --policy_commitment-file-path "$ARTIFACT_DIR/fields/policy-commitment.bin" \
  --policy_version "$POLICY_VERSION" \
  --submission_deadline "$SUBMISSION_DEADLINE" \
  --verifier_contract "$verifier_id"

stellar contract invoke --id "$registry_id" --source "$SOURCE_ACCOUNT" --network "$NETWORK" --send yes -- lock_policy --admin "$admin_address" --tender_id "$TENDER_REFERENCE"

