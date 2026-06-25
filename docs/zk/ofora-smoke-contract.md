# Ofora smoke contract

The Phase 0 smoke contract is intentionally separate from the Ofora registry.
It verifies that this machine can compile and test a basic Soroban contract.

- Location: `contracts/ofora-toolchain-smoke`
- Function: `ping() -> u32`
- Expected return value: `42`

## Test command

```bash
cargo test --manifest-path contracts/ofora-toolchain-smoke/Cargo.toml
```

## Build command

```bash
stellar contract build --manifest-path contracts/ofora-toolchain-smoke/Cargo.toml --optimize
```

## Expected WASM path

```text
target/wasm32v1-none/release/ofora_toolchain_smoke.optimized.wasm
```

Observed Stellar CLI output path:

```text
contracts/ofora-toolchain-smoke/target/wasm32v1-none/release/ofora_toolchain_smoke.wasm
```

Observed build hash:

```text
2560d1b4ffa47db464c274848e248da8de3915bf9d97fb2e17b0b94240332214
```
