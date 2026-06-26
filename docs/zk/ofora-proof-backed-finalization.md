# Ofora Proof-Backed Finalization

Ofora now uses a two-transaction Groth16 finalization path for the smallest real
award validation flow on Stellar testnet.

## Transaction 1: Verification Receipt

`contracts/generated-ofora-groth16-verifier` verifies Nova's existing BLS12-381
Groth16 proof against the single public input:

- `context_commitment`

If verification succeeds, the verifier stores a durable `VerificationReceipt`
with:

- `context_commitment`
- `verified`
- `verified_at`
- `verifier_version`
- `consumed`

Invalid proofs, malformed inputs, duplicate receipts, Atlas context reuse, and
Meridian context reuse are rejected.

## Transaction 2: Registry Finalization

`contracts/ofora-registry` finalizes the tender only after recomputing the same
Groth16 context commitment from stored registry state:

- domain `3001`
- selected supplier index
- tender reference `2026041`
- receipt nonce
- policy version
- stored policy commitment
- stored Atlas, Nova, and Meridian bid commitments
- selected bid commitment

The registry then consumes the verifier receipt using Soroban contract
authorization. The receipt is single-use; replay attempts are rejected by the
receipt verifier.

## Public Result

The finalization creates a `FairAwardReceipt` that identifies Nova by public
commitment only. It does not reveal prices, delivery values, stock values,
quality values, local contribution values, or salts.

Payment readiness is set to `ReadyForControlledRelease`. This is not escrow and
does not release funds.
