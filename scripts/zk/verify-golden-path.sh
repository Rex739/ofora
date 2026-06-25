#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT_DIR/scripts/zk/load-zk-env.sh"

run_step() {
  local label="$1"
  shift
  echo
  echo "==> $label"
  if ! "$@"; then
    echo "FAILED: $label" >&2
    echo "Command: $*" >&2
    exit 1
  fi
}

run_step "Check Stellar/Rust toolchain" "$ROOT_DIR/scripts/zk/check-stellar-toolchain.sh"
run_step "Check nargo" nargo --version
run_step "Check bb" bb --version

REF_DIR="$ROOT_DIR/vendor/ultrahonk_soroban_contract"
if [[ ! -d "$REF_DIR/.git" ]]; then
  echo "FAILED: reference repository missing at $REF_DIR" >&2
  exit 1
fi

REF_COMMIT="$(git -C "$REF_DIR" rev-parse HEAD)"
echo "Reference commit: $REF_COMMIT"

if [[ -f "$REF_DIR/tests/build_circuits.sh" ]]; then
  run_step "Run reference circuit build workflow" bash "$REF_DIR/tests/build_circuits.sh"
else
  echo "FAILED: reference tests/build_circuits.sh not found" >&2
  exit 1
fi

run_step "Run reference Rust tests" cargo test --manifest-path "$REF_DIR/Cargo.toml"
run_step "Build Ofora smoke contract" stellar contract build --manifest-path "$ROOT_DIR/contracts/ofora-toolchain-smoke/Cargo.toml" --optimize

echo
echo "Ofora ZK golden path: PASS"
echo "nargo: $(nargo --version)"
echo "bb: $(bb --version)"
echo "stellar: $(stellar --version)"
echo "rust: $(rustc --version)"
echo "verifier reference commit: $REF_COMMIT"
echo "reference proof generation status: PASS"
echo "reference verifier integration-test status: PASS"
echo "Ofora smoke contract build status: PASS"
