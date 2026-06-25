# Stellar testnet demo

The current environment cannot deploy because `stellar`, `nargo`, and `bb` are
not installed. Once installed, the intended flow is:

1. Build the Noir circuit.
2. Generate the UltraHonk proof, public inputs, and verification key.
3. Build/deploy the generated UltraHonk Soroban verifier with the Ofora
   verification key.
4. Build/deploy `contracts/ofora-registry`.
5. Initialize tender `OFR-2026-041`.
6. Lock the policy commitment.
7. Register exactly three bid commitments.
8. Close submissions.
9. Begin evaluation.
10. Submit the Nova proof through `validate_award`.
11. Confirm the registry stores:
    - validated winner commitment
    - `FAR-OFR-2026-041-001`
    - validation timestamp
    - payment status `ReadyForControlledRelease`

## Scripts

```bash
scripts/zk/deploy-testnet.sh
scripts/zk/seed-demo-tender.sh
scripts/zk/submit-demo-award.sh
```

Required environment:

```bash
OFORA_STELLAR_NETWORK=testnet
OFORA_VERIFIER_CONTRACT_ID=<deployed generated verifier>
OFORA_REGISTRY_CONTRACT_ID=<deployed registry>
OFORA_STELLAR_SOURCE_ACCOUNT=<local stellar CLI identity>
```

The scripts must print:

- network
- registry contract ID
- verifier contract ID
- tender ID
- policy commitment
- bid commitments
- receipt ID
- validation transaction hash
- final tender record

No salts or private bid witness files should be saved under `artifacts/`.
