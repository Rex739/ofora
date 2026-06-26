#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ARTIFACT_DIR="$ROOT_DIR/artifacts/ofora-zk-demo"
PROOF_DIR="$ARTIFACT_DIR/nova-proof"
CONTRACT_IDS="$ARTIFACT_DIR/contract-ids.json"
NETWORK="${OFORA_STELLAR_NETWORK:-testnet}"
SOURCE_ACCOUNT="${OFORA_STELLAR_SOURCE_ACCOUNT:-}"
TENDER_REFERENCE="OFR-2026-041"
TENDER_REFERENCE_FIELD="2026041"
POLICY_VERSION="1"
RECEIPT_ID="FAR-OFR-2026-041-001"
SUBMISSION_DEADLINE="${OFORA_SUBMISSION_DEADLINE:-1782675600}"

require_source_account() {
  if [[ -z "$SOURCE_ACCOUNT" ]]; then
    echo "OFORA_STELLAR_SOURCE_ACCOUNT is required and must be a funded Stellar CLI identity." >&2
    exit 1
  fi
}

require_file() {
  if [[ ! -f "$1" ]]; then
    echo "Required file missing: $1" >&2
    exit 1
  fi
}

contract_id_json_value() {
  local key="$1"
  node -e "const fs=require('fs'); const p='$CONTRACT_IDS'; const data=fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')):{}; if(!data['$key']) process.exit(1); console.log(data['$key']);"
}

write_contract_id() {
  local key="$1"
  local value="$2"
  mkdir -p "$ARTIFACT_DIR"
  node -e "const fs=require('fs'); const p='$CONTRACT_IDS'; const data=fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')):{}; data.network='$NETWORK'; data['$key']='$value'; fs.writeFileSync(p, JSON.stringify(data,null,2)+'\n');"
}

split_public_inputs() {
  require_file "$ARTIFACT_DIR/public-inputs.json"
  mkdir -p "$ARTIFACT_DIR/fields"
  node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('$ARTIFACT_DIR/public-inputs.json', 'utf8'));
const context = data.context;
function writeField(path, value) {
  const out = Buffer.alloc(32);
  let n = BigInt(value);
  for (let i = 31; i >= 0; i--) {
    out[i] = Number(n & 255n);
    n >>= 8n;
  }
  fs.writeFileSync(path, out);
}
writeField('$ARTIFACT_DIR/fields/selected-index.bin', context.selected_supplier_index);
writeField('$ARTIFACT_DIR/fields/tender-ref.bin', context.tender_ref);
writeField('$ARTIFACT_DIR/fields/receipt-nonce.bin', context.receipt_nonce);
writeField('$ARTIFACT_DIR/fields/policy-version.bin', context.policy_version);
writeField('$ARTIFACT_DIR/fields/policy-commitment.bin', context.expected_policy_commitment);
writeField('$ARTIFACT_DIR/fields/atlas-bid-commitment.bin', context.bid_commitments[0]);
writeField('$ARTIFACT_DIR/fields/nova-bid-commitment.bin', context.bid_commitments[1]);
writeField('$ARTIFACT_DIR/fields/meridian-bid-commitment.bin', context.bid_commitments[2]);
writeField('$ARTIFACT_DIR/fields/selected-bid-commitment.bin', context.selected_bid_commitment);
"
}

print_header() {
  echo "Network: $NETWORK"
  echo "Tender reference: $TENDER_REFERENCE"
}
