# Ofora Groth16 Trust Setup

This feasibility and finalization MVP uses a local development Groth16 setup.

## Used Here

- `snarkjs powersoftau new bls12381`
- one local random Powers of Tau contribution
- one local circuit-specific zkey contribution
- verification key exported to `artifacts/ofora-groth16-demo/verification_key.json`

## Public Artifacts

- `verification_key.json`
- `public.json`
- `proof.json`
- `circuit.r1cs`
- `circuit.wasm`
- Soroban byte encodings for vk, proof, and public input

## Never Commit

- private witness JSON
- witness `.wtns`
- `.ptau` ceremony material
- `.zkey` proving keys
- supplier salts
- seed phrases or Stellar identities

## Limitation

This is sufficient only for hackathon feasibility and testnet validation. It
does not provide production ceremony guarantees and must not be described as a
production trusted setup.
