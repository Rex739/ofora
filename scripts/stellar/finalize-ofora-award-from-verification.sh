#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_ofora-testnet.sh"
require_source_account

if [[ ! -f "$ARTIFACT_DIR/verification-receipt.json" ]]; then
  echo "No verification receipt exists. Run direct verification first." >&2
  exit 1
fi

receipt_status="$(node -e "const fs=require('fs'); const r=JSON.parse(fs.readFileSync('$ARTIFACT_DIR/verification-receipt.json','utf8')); console.log(r.status || '')")"
if [[ "$receipt_status" != "verified" ]]; then
  echo "Cannot finalize award: verifier receipt is not verified." >&2
  exit 1
fi

echo "Finalization from verifier receipt is not implemented until direct UltraHonk verification succeeds on testnet."
exit 1
