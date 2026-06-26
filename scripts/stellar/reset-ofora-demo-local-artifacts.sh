#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
rm -rf "$ROOT_DIR/artifacts/ofora-zk-demo" "$ROOT_DIR/artifacts/private/ofora-award-proof"
rm -f "$ROOT_DIR/zk/Prover.toml"
echo "Reset Ofora local ZK/testnet demo artifacts."
