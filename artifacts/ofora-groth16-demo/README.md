# Ofora Groth16 Demo Artifacts

This directory contains public-safe artifacts for the Ofora proof-backed
registry finalization MVP.

## Proof Inputs

- `soroban-vk.bin`
- `soroban-proof.bin`
- `soroban-public.bin`
- `public-context.json`
- `groth16-*-commitment.bin`
- `groth16-receipt-nonce.bin`

`soroban-public.bin` is the single public Groth16 input:
`context_commitment`.

## Testnet Evidence

The finalization scripts write:

- `canonical-contract-ids.json`
- `verification-receipt-transaction.json`
- `verification-receipt.json`
- `registry-finalization-transaction.json`
- `fair-award-receipt.json`
- `final-tender-record.json`

These files are public evidence only. They do not include supplier private bid
values or salts.
