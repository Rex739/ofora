#!/usr/bin/env bash
set -euo pipefail

if ! command -v stellar >/dev/null 2>&1; then
  echo "Missing required tool: stellar" >&2
  exit 1
fi

echo "Seed flow requires deployed registry and verifier contract IDs."
echo "Set OFORA_REGISTRY_CONTRACT_ID, OFORA_VERIFIER_CONTRACT_ID, and OFORA_STELLAR_SOURCE_ACCOUNT."
test -n "${OFORA_REGISTRY_CONTRACT_ID:-}"
test -n "${OFORA_VERIFIER_CONTRACT_ID:-}"
test -n "${OFORA_STELLAR_SOURCE_ACCOUNT:-}"

echo "TODO: invoke initialize_tender, lock_policy, and register_bid_commitment with generated public commitments."
