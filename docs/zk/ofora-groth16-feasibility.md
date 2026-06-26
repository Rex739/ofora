# Ofora Groth16 Feasibility

Status: Nova's Groth16 proof was directly verified on Stellar testnet by the
isolated Groth16 verifier contract. Registry integration is not built.

## Toolchain

- Circom: `2.2.1`
- snarkjs: `0.7.6`
- Curve: `bls12381`
- Stellar CLI: `27.0.0`

## Circuit

- Path: `zk-groth16/circuits/ofora_award.circom`
- Public input count: 1
- Public input ordering: `verificationContextCommitment`
- Private supplier fields: price, delivery days, stock availability, quality
  rating, local contribution, supplier reference, salt
- Suppliers: exactly three

## Compatibility Note

The official Stellar example uses BLS12-381 host functions. The existing Ofora
UltraHonk path uses BN254 Poseidon2 commitments. This spike therefore uses a
BLS12-381 arithmetic field-fold commitment to measure Groth16 verifier viability
through the official Stellar verifier shape. It is not a production replacement
for Ofora's Poseidon2 commitment scheme.

## Local Results

- Circuit compile: pass
- Nova witness: pass
- Nova Groth16 proof: pass
- Local snarkjs verification: pass
- Atlas negative case: rejected
- Meridian negative case: rejected
- Local Soroban verifier tests: pass
  - accepts Nova proof
  - rejects altered public signal
  - rejects malformed proof

## Artifact Sizes

- Proof bytes for Soroban: 384
- Public input bytes: 32
- Verification key bytes for Soroban: 864
- Optimized verifier WASM: 3,817 bytes
- WASM hash: `f1b8656f9c172ffbf4b847e7c85eeead3ee1409080459f444d1a37b304890118`

## Testnet Status

Direct verifier evidence:

- Contract ID: `CD2TRAV5I6RPVNP4JKMK53NVGWVZA55RQQCX6NYQAZZQR5JLH6ERDTX7`
- Direct simulation result: `true`
- Direct transaction hash:
  `c448ebb869a14113a692530dbb4060d5d25104b3f3d4f0062ff1d1eabd09f556`
- Altered public context simulation result: `false`

This proves the isolated Groth16 verifier can verify Nova's proof on Stellar
testnet. It does not prove registry validation, Fair Award Receipt finalization,
payment readiness, or escrow.
