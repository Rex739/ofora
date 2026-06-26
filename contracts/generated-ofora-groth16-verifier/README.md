# Generated Ofora Groth16 Verifier

Feasibility-spike verifier for `zk-groth16/circuits/ofora_award.circom`.

Source anchor: Stellar `soroban-examples/groth16_verifier`, commit
`7b168174ae1268dab91a0190d80a94ab7ff41b59`, Apache-2.0.

This contract accepts raw byte encodings for:

- verification key: alpha, beta, gamma, delta, IC0, IC1
- proof: A, B, C
- public signals: one 32-byte BLS12-381 scalar

It is not registry integration and does not write receipts or payment state.
