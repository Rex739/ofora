#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SNARKJS="$ROOT_DIR/zk-groth16/node_modules/.bin/snarkjs"

echo "circom: $(circom --version)"
echo "snarkjs: $("$SNARKJS" --version | head -n 1)"
echo "node: $(node --version)"
echo "npm: $(npm --version)"
echo "stellar: $(stellar --version | head -n 1)"
echo "rustc: $(rustc --version)"

