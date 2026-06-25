#!/usr/bin/env bash
set -euo pipefail

if ! command -v stellar >/dev/null 2>&1; then
  echo "Missing required tool: stellar" >&2
  exit 1
fi

test -n "${OFORA_REGISTRY_CONTRACT_ID:-}"
test -n "${OFORA_STELLAR_SOURCE_ACCOUNT:-}"

echo "TODO: invoke validate_award with Nova selected commitment, proof, and public inputs."
echo "This script must only be completed once real proof artifacts exist."
