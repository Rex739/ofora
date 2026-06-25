# Ofora

Ofora is a procurement integrity prototype for confidential supplier submission,
evaluation, and award validation workflows.

## Real ZK validation flow

The frontend still supports mock validation for product development through:

```bash
NEXT_PUBLIC_OFORA_VERIFICATION_MODE=mock
```

The technical workspace for real proof-backed validation is under:

- `zk/` — Noir circuit for the fixed three-supplier MVP statement
- `contracts/ofora-registry/` — Soroban registry contract
- `generated-verifier/` — documented location/process for the generated Noir
  UltraHonk Soroban verifier
- `scripts/zk/` — proof, verification, deployment, and demo scripts
- `docs/zk-architecture.md` — public/private data model and circuit statement

Real mode is fail-closed:

```bash
NEXT_PUBLIC_OFORA_VERIFICATION_MODE=real
```

It must not show an award as validated until a generated proof is accepted by a
real generated UltraHonk verifier contract on Stellar and the registry
transaction confirms.

Current local blocker: `nargo`, `bb`, and `stellar` CLI are not installed in
this environment, so no testnet contract IDs or validation transaction hash are
claimed.
