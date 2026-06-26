#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_ofora-groth16-finalization.sh"
require_source_account

verifier_id="$(canonical_value groth16ReceiptVerifierContractId)"
registry_id="$(canonical_value registryContractId)"
admin="$(admin_address)"

print_header
echo "Initializing receipt verifier and authorizing registry..."
stellar contract invoke \
  --id "$verifier_id" \
  --source "$SOURCE_ACCOUNT" \
  --network "$NETWORK" \
  --send yes \
  -- \
  initialize \
  --admin "$admin" \
  --verifier_version "$VERIFIER_VERSION"

stellar contract invoke \
  --id "$verifier_id" \
  --source "$SOURCE_ACCOUNT" \
  --network "$NETWORK" \
  --send yes \
  -- \
  set_authorized_registry \
  --admin "$admin" \
  --registry "$registry_id"

node -e "const fs=require('fs'); fs.writeFileSync('$ARTIFACT_DIR/verifier-registry-configuration.json', JSON.stringify({network:'$NETWORK', verifierContractId:'$verifier_id', registryContractId:'$registry_id', verifierVersion:'$VERIFIER_VERSION', configuredAt:new Date().toISOString()}, null, 2)+'\n')"
echo "Verifier registry authorization configured."
