# Ofora Demo Runbook

## Local Proof Demo

```bash
scripts/zk/test-ofora-award-proof.sh
```

Expected final line:

```text
Ofora award proof tests: PASS
```

This command proves the local technical claim:

- Nova can generate a valid proof.
- Atlas cannot satisfy the winner constraints.
- Meridian cannot satisfy the eligibility constraints.

## Build Contracts

```bash
stellar contract build --manifest-path contracts/generated-ofora-verifier/Cargo.toml --optimize
stellar contract build --manifest-path contracts/ofora-registry/Cargo.toml --optimize
```

Verified local WASM hashes from the current run:

- Generated verifier: `206e2c781a91e72945e238515f6a6f237b866c74c55969f4650930a50470e0c4`
- Ofora registry: `3729b867ef91c6c8693ca86dc11c5a8df5a9aea6f21bb91d5862f11ec043b6a7`

## Frontend Modes

Mock mode:

```bash
NEXT_PUBLIC_OFORA_VERIFICATION_MODE=mock
```

Real mode:

```bash
NEXT_PUBLIC_OFORA_VERIFICATION_MODE=real
```

Real mode should only be used for demo claims after the Stellar testnet scripts have produced real contract IDs and a validation transaction output.

## Current Testnet Blocker

The verifier and registry deployed successfully to testnet, and the registry stores the tender in `EvaluationInProgress` with all three public commitments. Submitting Nova's proof to `validate_award` currently fails during Stellar simulation with:

```text
HostError: Error(Budget, ExceededLimit)
```

This means no final validation transaction hash or persisted Fair Award Receipt is claimed yet.
