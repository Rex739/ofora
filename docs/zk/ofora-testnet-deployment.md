# Ofora Testnet Deployment

Status: local proof path works; verifier and registry are deployed on Stellar testnet; final proof validation is blocked by testnet simulation budget.

## Current Testnet Evidence

- Compressed verifier contract ID: `CDKVPGCMGUPY724BOTXKCAQ7P7H52OIGF3J5EUZR3YRRN2O3R557K6OS`
- Original verifier contract ID: `CBIOI5PLEMPJYZQ7C5QAY7SFK63QYNWMCWTSEGWFULFKM6BEPX6A2RW3`
- Registry contract ID: `CB3CVGUVNA3FEZ2GCPNG2LB3OVMGEVGFOXOTFWMOILUPLJ5Y5RZ3KY4F`
- Verifier WASM hash: `206e2c781a91e72945e238515f6a6f237b866c74c55969f4650930a50470e0c4`
- Registry WASM hash: `3729b867ef91c6c8693ca86dc11c5a8df5a9aea6f21bb91d5862f11ec043b6a7`
- Registry state after setup: `EvaluationInProgress`
- Stored policy commitment: `2f948faee4d6c181391e29c65d0ddf1e334b614d5b8908dc6889027d469b5b56`
- Stored Atlas commitment: `0e1858dd3646fe7b91fba3d71280d7a04555b99d4c570306a2ce4616a3b2ff24`
- Stored Nova commitment: `187d68b45bead7e1e97914d7459ac64c6f722fe6b497db1c7a521bd307ce4279`
- Stored Meridian commitment: `0abff378b55779669e1ea88bf8110f1e3e885ec187ce92d7df2ad92d46073457`

Registry-to-verifier validation attempt result:

```text
transaction simulation failed: HostError: Error(Budget, ExceededLimit)
```

Direct compressed verifier simulation result:

```text
transaction simulation failed: HostError: Error(Budget, ExceededLimit)
DebugInfo not available
```

No verifier or registry validation transaction hash is claimed.

## Prerequisites

Set a funded Stellar CLI identity:

```bash
export OFORA_STELLAR_NETWORK=testnet
export OFORA_STELLAR_SOURCE_ACCOUNT=<funded-stellar-cli-identity>
```

Build local proof artifacts:

```bash
scripts/zk/test-ofora-award-proof.sh
stellar contract build --manifest-path contracts/generated-ofora-verifier/Cargo.toml --optimize
stellar contract build --manifest-path contracts/ofora-registry/Cargo.toml --optimize
```

Deploy and validate:

```bash
scripts/stellar/deploy-ofora-verifier-testnet.sh
scripts/stellar/deploy-ofora-registry-testnet.sh
scripts/stellar/initialize-ofora-demo-tender.sh
scripts/stellar/register-demo-bid-commitments.sh
scripts/stellar/submit-nova-award-proof.sh
scripts/stellar/inspect-ofora-testnet-state.sh
```

## Public Artifacts

Successful scripts write only public outputs under `artifacts/ofora-zk-demo/`:

- `contract-ids.json`
- `policy-commitment.json`
- `bid-commitments.json`
- `public-inputs.json`
- `fair-award-receipt.json`
- `validation-transaction.json` after validation succeeds
- `direct-verifier-simulation.json`
- `direct-verifier-transaction.json`
- `verification-receipt.json`
- `registry-finalization-transaction.json`
- `final-tender-record.json`

Private witness TOMLs and salts are generated under `artifacts/private/ofora-award-proof/` and ignored by git.
