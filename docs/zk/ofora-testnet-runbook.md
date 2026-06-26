# Ofora Testnet Runbook

Run from the repository root with a funded Stellar CLI identity:

```bash
export OFORA_STELLAR_SOURCE_ACCOUNT=<identity>
export OFORA_STELLAR_NETWORK=testnet
```

## Local Checks

```bash
scripts/groth16/test-ofora-registry-finalization.sh
```

## Build Contracts

```bash
cargo build --target wasm32v1-none --release --manifest-path contracts/generated-ofora-groth16-verifier/Cargo.toml
cargo build --target wasm32v1-none --release --manifest-path contracts/ofora-registry/Cargo.toml
```

## Testnet Flow

```bash
scripts/stellar/deploy-ofora-groth16-receipt-verifier-testnet.sh
scripts/stellar/deploy-ofora-registry-finalization-testnet.sh
scripts/stellar/configure-ofora-verifier-registry.sh
scripts/stellar/submit-nova-verification-receipt-testnet.sh
scripts/stellar/finalize-nova-award-testnet.sh
scripts/stellar/inspect-ofora-finalization-testnet.sh
```

## Public Artifacts

Artifacts are written to `artifacts/ofora-groth16-demo/`:

- `canonical-contract-ids.json`
- `verification-receipt-transaction.json`
- `verification-receipt.json`
- `registry-finalization-transaction.json`
- `fair-award-receipt.json`
- `final-tender-record.json`
- `README.md`

Private witness inputs, salts, proving keys, and ceremony material remain under
ignored local paths.
