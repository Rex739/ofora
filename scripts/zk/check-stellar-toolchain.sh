#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT_DIR/scripts/zk/load-zk-env.sh"

fail() {
  echo "FAIL: $1" >&2
  exit 1
}

pass() {
  echo "PASS: $1"
}

command -v rustc >/dev/null 2>&1 || fail "rustc is missing"
command -v cargo >/dev/null 2>&1 || fail "cargo is missing"
command -v rustup >/dev/null 2>&1 || fail "rustup is missing"

RUST_VERSION="$(rustc --version)"
echo "rustc: $RUST_VERSION"
case "$RUST_VERSION" in
  rustc\ 1.8[4-9].*|rustc\ 1.9[0-9].*) pass "Rust is 1.84.0 or higher" ;;
  *) fail "Rust must be 1.84.0 or higher" ;;
esac

if rustup target list --installed | grep -qx "wasm32v1-none"; then
  pass "wasm32v1-none target installed"
else
  fail "wasm32v1-none target missing"
fi

command -v stellar >/dev/null 2>&1 || fail "stellar CLI is missing"
stellar --version
pass "stellar CLI available"
