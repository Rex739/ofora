#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ARTIFACT_DIR="$ROOT_DIR/artifacts/ofora-groth16-demo"
CANONICAL_IDS="$ARTIFACT_DIR/canonical-contract-ids.json"
NETWORK="${OFORA_STELLAR_NETWORK:-testnet}"
SOURCE_ACCOUNT="${OFORA_STELLAR_SOURCE_ACCOUNT:-}"
TENDER_REFERENCE="OFR-2026-041"
POLICY_VERSION="1"
RECEIPT_ID="FAR-OFR-2026-041-NOVA"
SUBMISSION_DEADLINE="${OFORA_SUBMISSION_DEADLINE:-1782675600}"
VERIFIER_VERSION="ofora-groth16-receipt-v1"

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

admin_address() {
  stellar keys address "$SOURCE_ACCOUNT"
}

canonical_value() {
  local key="$1"
  node -e "const fs=require('fs'); const p='$CANONICAL_IDS'; const d=fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')):{}; if(!d['$key']) process.exit(1); console.log(d['$key']);"
}

write_canonical_value() {
  local key="$1"
  local value="$2"
  mkdir -p "$ARTIFACT_DIR"
  node -e "
const fs=require('fs');
const p='$CANONICAL_IDS';
const d=fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')):{};
d.network='$NETWORK';
d.proofSystem='Groth16';
d.publicInputCount=1;
d['$key']='$value';
d.updatedAt=new Date().toISOString();
fs.writeFileSync(p, JSON.stringify(d,null,2)+'\n');
"
}

write_command_artifact() {
  local file="$1"
  local kind="$2"
  local contract_id="$3"
  local status="$4"
  local output="$5"
  node -e "
const fs=require('fs');
const hash=(process.argv[4].match(/[0-9a-f]{64}/i)||[''])[0];
fs.writeFileSync(process.argv[1], JSON.stringify({
  network: '$NETWORK',
  kind: process.argv[2],
  contractId: process.argv[3],
  status: Number(process.argv[5]),
  transactionHash: hash || null,
  output: process.argv[4],
  recordedAt: new Date().toISOString()
}, null, 2)+'\n');
" "$file" "$kind" "$contract_id" "$output" "$status"
}

print_header() {
  echo "Network: $NETWORK"
  echo "Tender reference: $TENDER_REFERENCE"
}

require_finalization_fixtures() {
  require_file "$ARTIFACT_DIR/soroban-vk.bin"
  require_file "$ARTIFACT_DIR/soroban-proof.bin"
  require_file "$ARTIFACT_DIR/soroban-public.bin"
  require_file "$ARTIFACT_DIR/groth16-policy-commitment.bin"
  require_file "$ARTIFACT_DIR/groth16-atlas-bid-commitment.bin"
  require_file "$ARTIFACT_DIR/groth16-nova-bid-commitment.bin"
  require_file "$ARTIFACT_DIR/groth16-meridian-bid-commitment.bin"
  require_file "$ARTIFACT_DIR/groth16-receipt-nonce.bin"
}
