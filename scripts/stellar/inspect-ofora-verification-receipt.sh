#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_ofora-testnet.sh"
require_source_account

if [[ ! -f "$ARTIFACT_DIR/verification-receipt.json" ]]; then
  cat > "$ARTIFACT_DIR/verification-receipt.json" <<JSON
{
  "network": "$NETWORK",
  "status": "not-created",
  "reason": "Direct UltraHonk verifier invocation exceeds Stellar testnet simulation budget before a receipt can be written."
}
JSON
fi
cat "$ARTIFACT_DIR/verification-receipt.json"

