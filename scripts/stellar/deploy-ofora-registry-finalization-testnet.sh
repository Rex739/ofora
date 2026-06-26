#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_ofora-groth16-finalization.sh"
require_source_account
require_finalization_fixtures

WASM="$ROOT_DIR/contracts/ofora-registry/target/wasm32v1-none/release/ofora_registry.wasm"
require_file "$WASM"

verifier_id="$(canonical_value groth16ReceiptVerifierContractId)"
admin="$(admin_address)"

print_header
echo "Deploying proof-backed Ofora registry..."
registry_id="$(stellar contract deploy --wasm "$WASM" --source "$SOURCE_ACCOUNT" --network "$NETWORK")"
write_canonical_value "registryContractId" "$registry_id"
write_canonical_value "oforaRegistryContractId" "$registry_id"
echo "Registry contract ID: $registry_id"

echo "Initializing canonical tender..."
stellar contract invoke \
  --id "$registry_id" \
  --source "$SOURCE_ACCOUNT" \
  --network "$NETWORK" \
  --send yes \
  -- \
  initialize_finalization_tender \
  --admin "$admin" \
  --tender_id "$TENDER_REFERENCE" \
  --policy_commitment-file-path "$ARTIFACT_DIR/groth16-policy-commitment.bin" \
  --policy_version "$POLICY_VERSION" \
  --submission_deadline "$SUBMISSION_DEADLINE" \
  --verifier_contract "$verifier_id" \
  --atlas_bid_commitment-file-path "$ARTIFACT_DIR/groth16-atlas-bid-commitment.bin" \
  --nova_bid_commitment-file-path "$ARTIFACT_DIR/groth16-nova-bid-commitment.bin" \
  --meridian_bid_commitment-file-path "$ARTIFACT_DIR/groth16-meridian-bid-commitment.bin"

echo "Registry seeded for proof-backed finalization."
