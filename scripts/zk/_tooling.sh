#!/usr/bin/env bash
set -euo pipefail

require_tool() {
  local name="$1"
  if ! command -v "$name" >/dev/null 2>&1; then
    echo "Missing required tool: $name" >&2
    return 1
  fi
}

require_zk_tooling() {
  require_tool nargo
  require_tool bb
}

require_stellar_tooling() {
  require_tool stellar
  require_tool cargo
  require_tool rustup
}
