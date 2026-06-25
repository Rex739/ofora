# Local ZK demo

## Tool versions recorded in this environment

- Node.js: `v22.5.1`
- npm: `10.8.2`
- rustc: `1.95.0 (59807616e 2026-04-14)`
- cargo: `1.95.0 (f2d3ce0bd 2026-03-21)`
- nargo: missing
- bb: missing
- stellar CLI: missing
- soroban CLI: missing

Official Stellar setup notes used:

- Stellar smart contracts require Rust and Stellar CLI.
- The current docs list Stellar CLI stable release `v27.0.0`.
- Smart contracts use the `wasm32v1-none` Rust target.
- Stellar’s ZK page points to BN254 and Poseidon/Poseidon2 host functions and
  the Noir UltraHonk Soroban verifier wrapper.

## Install tools

```bash
rustup target add wasm32v1-none
cargo install --locked stellar-cli --version 27.0.0
```

Install Noir and Barretenberg from the official Noir/Aztec installation
instructions for the versions compatible with the Stellar UltraHonk verifier
wrapper.

## Generate non-sensitive public metadata

```bash
npx tsc --noEmit
node --loader ts-node/esm scripts/zk/generate-commitments.ts
```

This command requires a TypeScript runtime such as `ts-node` if run directly.
The output helper commitments are not final ZK commitments.

## Generate proof

```bash
cp zk/Prover.toml.example zk/Prover.local.toml
# Fill zk/Prover.local.toml locally. Never commit salts or private bid data.
scripts/zk/generate-proof.sh
```

Expected blocker in this environment:

```text
Missing required tool: nargo
```

## Verify locally

```bash
scripts/zk/verify-local.sh
```

## Build contract

```bash
stellar contract build --manifest-path contracts/ofora-registry/Cargo.toml
```

Expected blocker in this environment:

```text
Missing required tool: stellar
```
