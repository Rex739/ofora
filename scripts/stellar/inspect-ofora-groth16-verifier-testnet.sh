#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ARTIFACT_DIR="$ROOT_DIR/artifacts/ofora-groth16-demo"

node -e "
const fs = require('fs');
const path = '$ARTIFACT_DIR';
function read(name) {
  const p = path + '/' + name;
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
}
console.log(JSON.stringify({
  contract: read('groth16-contract-id.json'),
  simulation: read('groth16-direct-simulation.json'),
  transaction: read('groth16-direct-transaction.json'),
  inputs: read('soroban-inputs.json')
}, null, 2));
"
