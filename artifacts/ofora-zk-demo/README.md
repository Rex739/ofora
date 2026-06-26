# Ofora ZK demo public artifacts

These files are public, non-sensitive artifacts from the Ofora award-validation run.

Present files:

- `contract-ids.json`: canonical Stellar testnet verifier and registry IDs.
- `canonical-contract-ids.json`: copy of the canonical IDs used by the budget investigation.
- `policy-commitment.json`: public policy commitment.
- `bid-commitments.json`: public bid commitments.
- `public-inputs.json`: compressed public input ordering and verification context.
- `fair-award-receipt.json`: receipt metadata, currently pending testnet validation.
- `final-tender-record.json`: inspected registry state after initialization, lock, bid registration, and begin evaluation.
- `direct-verifier-simulation.json`: compressed direct verifier simulation evidence.
- `direct-verifier-transaction.json`: direct verifier send attempt status.
- `verification-receipt.json`: direct verifier receipt status.
- `registry-finalization-transaction.json`: registry finalization status.
- `nova-proof/`: local Nova proof, verification key, and public inputs.

Not present:

- `validation-transaction.json`

Reason: both registry-to-verifier validation and compressed direct verifier validation reach Stellar testnet simulation but fail with `HostError: Error(Budget, ExceededLimit)`. No validation transaction hash is claimed.
